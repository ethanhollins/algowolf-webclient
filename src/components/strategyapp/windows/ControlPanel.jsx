import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/pro-light-svg-icons';

class ControlPanel extends Component
{
    constructor(props)
    {
        super(props);

        this.setControlPanelBody = elem => {
            this.controlPanelBody = elem;
        }

        this.inputs = [];
        this.addInputRef = elem => {
            this.inputs.push(elem);
        }
    }
    
    state = {
        changed: {}
    }

    render()
    {
        return (
            <React.Fragment>

            <div className='control-panel background'>
                <div ref={this.setControlPanelBody} className='control-panel body'>
                    {this.getItems()}
                </div>
                
            </div>
            <div className='control-panel button-group'>
                <input 
                    id='reset_btn' 
                    className={'control-panel button'  + this.isDisabled()}
                    type="button" value="Reset" 
                    onClick={this.reset.bind(this)}
                />
                <input 
                    id='update_btn' 
                    className={'control-panel button' + this.isDisabled()}
                    type="button" value="Update" 
                    onClick={this.update.bind(this)}
                />
            </div>

            </React.Fragment>
        );
    }

    isDisabled()
    {
        
        if (Object.keys(this.state.changed).length === 0)
        {
            return ' disabled';
        }
        else
        {
            return '';
        }
    }

    getInputVariables = () =>
    {
        const global_preset = this.props.getCurrentGlobalVariablesPreset();
        const local_preset = this.props.getCurrentLocalVariablesPreset();
        return Object.assign(
            {}, this.props.getLocalInputVariables()[local_preset],
            this.props.getGlobalInputVariables()[global_preset]
            
        );
    }

    onVariableChange(e)
    {
        let { changed } = this.state;
        const input_variables = this.getInputVariables();
        
        const name = e.target.getAttribute('name');
        let value = e.target.value;
        if (e.target.type === 'number')
        {
            if (value !== '')
            {
                value = parseFloat(value);

                if (e.target.min !== '' && value < e.target.min)
                {
                    value = e.target.min;
                    e.target.value = e.target.min;
                }
                else if (e.target.max !== '' && value > e.target.max)
                {
                    value = e.target.max;
                    e.target.value = e.target.max;
                }

                if (input_variables[name].type === 'integer')
                {
                    value = Math.floor(value);
                    e.target.value = Math.floor(value);
                }
            }
        }

        if (value === input_variables[name].value)
        {
            if (name in changed)
            {
                delete changed[name];
            }
        }
        else
        {
            changed[name] = value;
        }

        this.setState({ changed });
    }

    reset()
    {
        let { changed } = this.state;
        changed = {};

        const input_variables = this.getInputVariables();
        for (let i of this.inputs)
        {
            i.value = input_variables[i.getAttribute('name')].value;
        }

        this.setState({ changed });
    }

    update()
    {
        let { changed } = this.state;
        const global_preset = this.props.getCurrentGlobalVariablesPreset();
        const global_variables = this.props.getGlobalInputVariables()[global_preset];
        const local_preset = this.props.getCurrentLocalVariablesPreset();
        const local_variables = this.props.getLocalInputVariables()[local_preset];

        for (let name in changed)
        {
            if (name in local_variables)
            {
                local_variables[name].value = changed[name];
            }
            else if (name in global_variables)
            {
                global_variables[name].value = changed[name];
            }
        }

        this.props.updateInputVariables(
            { [local_preset]: local_variables }, 
            { [global_preset]: global_variables }
        );

        changed = {};
        this.setState({ changed });
    }

    getItems = () =>
    {
        const { changed } = this.state;

        const input_variables = this.getInputVariables();
        const global_preset = this.props.getCurrentGlobalVariablesPreset();
        const local_preset = this.props.getCurrentLocalVariablesPreset();
        const is_loaded = this.props.isLoaded();

        let local_items = [];
        let global_items = [];
        if (input_variables !== undefined && is_loaded)
        {
            let elem;
            for (let name in input_variables)
            {
                let item = input_variables[name];
                let value = input_variables[name].value;
                let field_ext = '';
                let icon_ext = '';
                if (name in changed)
                {
                    value = changed[name];
                    field_ext += ' changed';
                    icon_ext += ' changed';
                }
                if (item.type === 'header')
                {
                    elem = (
                        <div key={name} className='info header'>
                            {name}
                        </div>
                    );
                }
                else
                {
                    let type, step, icon, min, max;
                    if (item.type === 'integer')
                    {
                        field_ext += " no-icon";
                        type = 'number';
                        step = '1';
                    }
                    else if (item.type === 'decimal')
                    {
                        field_ext += " no-icon";
                        type = 'number';
                        step = '.01';
                    }
                    else if (item.type === 'percentage')
                    {
                        type = 'number';
                        step = '.01';
                        icon = <span className={'control-panel icon' + icon_ext}>%</span>;
                    }
                    else if (item.type === 'text')
                    {
                        field_ext += " no-icon";
                        type = 'text';
                    }

                    if (item.properties.min !== undefined)
                        min = item.properties.min
                    if (item.properties.max !== undefined)
                        max = item.properties.max

                    elem = (
                        <div key={name} className='info row'>
                            <div className='control-panel item left'>{name}</div>
                            <div className='control-panel item right'>
                                {icon}
                                <input 
                                    ref={this.addInputRef}
                                    className={'control-panel field' + field_ext} name={name}
                                    type={type} defaultValue={value}
                                    step={step} min={min} max={max}
                                    onChange={this.onVariableChange.bind(this)}
                                />
                            </div>
                        </div>
                    );
                }
                if (item.scope === 'local')
                {
                    local_items.push(elem);
                }
                else
                {
                    global_items.push(elem);
                }
            }
        };

        // Compile result
        let result = [];
        if (local_items.length > 0)
        {
            result.push(
                <React.Fragment key={'local_items'}>
                <div className='control-panel scope-body'>
                    <div className='control-panel scope-header'>Account</div>
                    <div className='control-panel scope-dropdown'>
                        {local_preset}<FontAwesomeIcon className='control-panel scope-dropdown-icon' icon={faChevronDown} />
                    </div>
                </div>
                {local_items}
                </React.Fragment>
            );
        }
        if(global_items.length > 0)
        {
            result.push(
                <React.Fragment key={'global_items'}>
                <div className='control-panel scope-body'>
                    <div className='control-panel scope-header'>Strategy</div>
                    <div className='control-panel scope-dropdown'>
                        {global_preset}<FontAwesomeIcon className='control-panel scope-dropdown-icon' icon={faChevronDown} />
                    </div>
                </div>
                {global_items}  
                </React.Fragment>
            );
        }
        return result;
    }
}

export default ControlPanel;