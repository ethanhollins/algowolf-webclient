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

    onVariableEnabledChange(e)
    {
        let { changed } = this.state;
        const input_variables = this.getInputVariables();
        
        const name = e.target.getAttribute('name');
        let value = e.target.checked;

        if (value === input_variables[name].properties.enabled)
        {
            if (name in changed)
            {
                delete changed[name]['enabled'];
                if (Object.keys(changed[name]).length === 0)
                {
                    delete changed[name];
                }
            }
        }
        else
        {
            if (!(name in changed))
            {
                changed[name] = {};
            }

            changed[name]['enabled'] = value;
        }

        this.setState({ changed });
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
                delete changed[name]['value'];
                if (Object.keys(changed[name]).length === 0)
                {
                    delete changed[name];
                }
            }
        }
        else
        {
            if (!(name in changed))
            {
                changed[name] = {};
            }

            changed[name]['value'] = value;
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
                if ('value' in changed[name])
                {
                    local_variables[name].value = changed[name].value;
                }
                if ('enabled' in changed[name])
                {
                    local_variables[name].properties.enabled = changed[name].enabled;
                }
            }
            else if (name in global_variables)
            {
                if ('value' in changed[name])
                {
                    global_variables[name].value = changed[name].value;
                }
                if ('enabled' in changed[name])
                {
                    global_variables[name].properties.enabled = changed[name].enabled;
                }
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
        const current_account = this.props.getCurrentAccount();
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
                        <div key={current_account + name} className='info header'>
                            {name}
                        </div>
                    );
                }
                else
                {
                    let type, step, icon, min, max, enabled;
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
                    else if (item.type === 'time')
                    {
                        field_ext += " no-icon";
                        type = 'time';
                    }

                    if (item.properties.min)
                        min = item.properties.min
                    if (item.properties.max)
                        max = item.properties.max
                    if (item.properties.enabled !== undefined)
                    {
                        enabled = (
                            <div>
                                <label className='control-panel checkbox'>
                                    <input 
                                        type='checkbox' 
                                        defaultChecked={item.properties.enabled}
                                        onChange={this.onVariableEnabledChange.bind(this)}
                                        name={name}
                                    />
                                    <div className='control-panel checkmark'></div>
                                </label>
                            </div>
                        )
                    }

                    elem = (
                        <div key={current_account + name} className='control-panel row'>
                            <div className='control-panel item left'>
                                <div className='control-panel item-main'>
                                    
                                    <span className='control-panel item-title'>{name}</span>
                                    { 
                                        item.properties.description 
                                        ? <span className='control-panel item-description'>{item.properties.description}</span> 
                                        : <React.Fragment/> 
                                    }
                                </div>
                            </div>
                            <div className='control-panel item right'>
                                {icon}
                                <input 
                                    ref={this.addInputRef}
                                    className={'control-panel field' + field_ext} name={name}
                                    type={type} defaultValue={value}
                                    step={step} min={min} max={max}
                                    onChange={this.onVariableChange.bind(this)}
                                />
                                {enabled}
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
                <React.Fragment key={current_account + local_preset + '-local'}>
                <div className='control-panel scope-body'>
                    <div className='control-panel scope-header'>Account</div>
                    {/* <div className='control-panel scope-dropdown'>
                        {local_preset}<FontAwesomeIcon className='control-panel scope-dropdown-icon' icon={faChevronDown} />
                    </div> */}
                </div>
                {local_items}
                </React.Fragment>
            );
        }
        if(global_items.length > 0)
        {
            result.push(
                <React.Fragment key={current_account + global_preset + '-global'}>
                <div className='control-panel scope-body'>
                    <div className='control-panel scope-header'>Strategy</div>
                    {/* <div className='control-panel scope-dropdown'>
                        {global_preset}<FontAwesomeIcon className='control-panel scope-dropdown-icon' icon={faChevronDown} />
                    </div> */}
                </div>
                {global_items}  
                </React.Fragment>
            );
        }
        return result;
    }
}

export default ControlPanel;