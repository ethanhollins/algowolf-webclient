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
        this.dropdowns = {};
        this.addDropdownSelectorRef = elem => {
            if (elem)
            {
                this.dropdowns[elem.getAttribute("name")] = elem;
            }
        }
    }
    
    state = {
        changed: {},
        is_loaded: false
    }

    componentDidUpdate()
    {
        let { is_loaded } = this.state;

        if (!is_loaded && this.isLoaded())
        {
            this.initCustomVariables();
            is_loaded = true;
            this.setState({ is_loaded });
        }
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
            <div className='control-panel warning-msg'>Click UPDATE and RESTART strategy for changes to take effect.</div>
            <div className='control-panel button-group'>
                <input 
                    id='reset_btn' 
                    className={'control-panel button'  + this.isDisabled()}
                    type="button" value="Reset" 
                    onClick={this.reset.bind(this)}
                />
                <input 
                    id='update_btn' 
                    className={'control-panel button' + this.isUpdateDisabled()}
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


    isUpdateDisabled()
    {
        const { changed } = this.state;
        const effective_bank = this.getEffectiveBank();
        const maximum_bank = this.getVariableValue('Maximum Bank');        
        const risk = this.getVariableValue('Risk (%)');

        let leverage_val;
        if ('Leverage' in changed && 'value' in changed['Leverage'])
        {
            leverage_val = changed['Leverage'].value;
        }
        else
        {
            leverage_val = this.getVariableValue('Leverage');
        }
        
        if (!effective_bank || !maximum_bank || !risk || !leverage_val)
        {
            return ' disabled';
        }
        else
        {
            const leverage = this.getLevarageCalc(leverage_val);
            const is_update_enabled = effective_bank <= maximum_bank && risk <= leverage;
    
            if (!is_update_enabled || this.isDisabled())
            {
                return ' disabled';
            }
            else
            {
                return '';
            }
        }
    }

    isLoaded = () =>
    {
        const global_preset = this.props.getCurrentGlobalVariablesPreset();
        const local_preset = this.props.getCurrentLocalVariablesPreset();

        const local_vars = this.props.getLocalInputVariables();
        const global_vars = this.props.getGlobalInputVariables();

        return local_vars && local_preset in local_vars && global_vars && global_preset in global_vars;
    }

    getInputVariables = () =>
    {
        const global_preset = this.props.getCurrentGlobalVariablesPreset();
        const local_preset = this.props.getCurrentLocalVariablesPreset();

        const local_vars = this.props.getLocalInputVariables();
        const global_vars = this.props.getGlobalInputVariables();

        if (local_vars && global_vars)
        {
            return Object.assign(
                {}, local_vars[local_preset], global_vars[global_preset]
            );
        }
        
        return {};
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
        this.handleCustomVariables(null, null);
    }

    getTotalBank()
    {
        const current_account = this.props.getCurrentAccount();
        const account_balance = this.props.getBalance(current_account);
        const maximum_bank = this.getVariableValue('Maximum Bank');
        const external_bank = this.getVariableValue('External Bank');
        const fixed_bank = this.getVariableValue('Fixed Bank');

        let value;
        if (fixed_bank)
        {
            if (maximum_bank)
            {
                value = Math.min(fixed_bank, maximum_bank, account_balance);
            }
            else
            {
                value = Math.min(fixed_bank, account_balance);
            }
        }
        else
        {
            if (maximum_bank)
            {
                value = Math.min(account_balance, maximum_bank)
            }
            else
            {
                value = account_balance;
            }
        }

        return value;
    }

    getEffectiveBank()
    {
        const total_bank = this.getTotalBank();
        const risk_perc = this.getVariableValue('Risk (%)');
        

        return total_bank * risk_perc;
    }

    initCustomVariables()
    {
        const input_variables = this.getInputVariables();

        for (let name in input_variables)
        {
            if ('properties' in input_variables[name] && input_variables[name].properties.custom)
            {
                if (input_variables[name].properties.custom === 'risk_percentage')
                {
                    const bank = this.getTotalBank();
                    const value = input_variables[name].value
                    const new_cash_value = Math.round(bank * (value / 100) * 100)/100;

                    if ('Risk ($)' in input_variables)
                    {
                        input_variables['Risk ($)'].value = new_cash_value;
                    }
                    const elem = this.getInputElem('Risk ($)');
                    if (elem)
                        elem.value = new_cash_value;
                }
            }
        }
    }

    handleCustomVariables(name, value)
    {
        const input_variables = this.getInputVariables();
        
        // Handle Custom
        const bank = this.getTotalBank();

        if (name && 'properties' in input_variables[name] && input_variables[name].properties.custom === 'risk_percentage')
        {
            const new_cash_value = Math.round(bank * (value / 100) * 100)/100;
            this.setVariableChange('Risk ($)', new_cash_value);
            // const elem = this.getInputElem('Risk ($)');
            // if (elem)
            //     elem.value = new_cash_value;
        }
        else if (name && 'properties' in input_variables[name] && input_variables[name].properties.custom === 'risk_cash')
        {
            const max_perc = input_variables['Risk (%)'].properties.max;
            // const perc_elem = this.getInputElem('Risk (%)');
            // const cash_elem = this.getInputElem('Risk ($)');
            value = Math.max(Math.min(Math.round(bank * (max_perc/100) * 100)/100, value), 0);
            const new_perc_value = Math.round((value / bank) * 100 * 100)/100;
            this.setVariableChange('Risk (%)', new_perc_value);
            this.setVariableChange('Risk ($)', value);
            // if (perc_elem && cash_elem)
            // {
            //     cash_elem.value = value;
            //     perc_elem.value = new_perc_value;
            // }
        }
        else
        {
            const perc_value = this.getVariableValue('Risk (%)');
            const new_cash_value = Math.round(bank * (perc_value / 100) * 100)/100;
            const cash_elem = this.getInputElem('Risk ($)');
            this.setVariableChange('Risk ($)', new_cash_value);

            // if (cash_elem)
            //     cash_elem.value = new_cash_value;
        }
    }

    getInputElem(name)
    {
        for (let i of this.inputs)
        {
            if (i.getAttribute('name') === name)
            {
                return i;
            }
        }
    }

    getVariableValue(name)
    {
        let { changed } = this.state;
        const input_variables = this.getInputVariables();

        if (name in input_variables)
        {
            let enabled = true;
            if (name in changed && 'enabled' in changed[name])
            {
                enabled = changed[name].enabled;
            }
            else if ('properties' in input_variables[name] && input_variables[name].properties.enabled !== undefined)
            {
                enabled = input_variables[name].properties.enabled;
            }

            if (!enabled)
            {
                return null;
            }
            else if (name in changed && 'value' in changed[name])
            {
                return changed[name].value;
            }
            else
            {
                return input_variables[name].value;
            }
        }

        return null;
    }

    setVariableChange(name, value)
    {
        let { changed } = this.state;
        const input_variables = this.getInputVariables();

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

    onVariableChange(e)
    {
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

        this.setVariableChange(name, value);
        this.handleCustomVariables(name, value);
    }

    reset()
    {
        if (!this.isDisabled())
        {
            let { changed } = this.state;
            changed = {};
            this.setState({ changed });
        }
    }

    update()
    {
        if (!this.isUpdateDisabled())
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
                let enabled = input_variables[name].properties.enabled;
                let field_ext = '';
                let icon_ext = '';
                let type, step, icon, min, max, enabled_elem;
                if (name in changed)
                {
                    if ('value' in changed[name])
                        value = changed[name].value;
                    if ('enabled' in changed[name])
                        enabled = changed[name].enabled;
                    field_ext += ' changed';
                    icon_ext += ' changed';
                }

                if (item.properties.min)
                {
                    min = item.properties.min
                }
                if (item.properties.max)
                {
                    max = item.properties.max
                }
                if (item.properties.currency)
                {
                    icon = <span className={'control-panel icon left' + icon_ext}>USD</span>;
                }

                let readOnly = item.properties.readOnly;
                
                if (item.type === 'header')
                {
                    elem = (
                        <div key={current_account + name} className='info header'>
                            {name}
                        </div>
                    );
                }
                else if (item.type === 'balance')
                {
                    icon = <span className={'control-panel icon left' + icon_ext}>USD</span>;
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
                                    className={'control-panel field right' + field_ext} 
                                    name={name} type='number' value={this.props.getBalance(current_account)}
                                    readOnly
                                />
                            </div>
                        </div>
                    );
                }
                else if (item.type === 'custom')
                {
                    if (name === 'Total Bank' || name === 'Usable Bank')
                    {
                        const total_bank = this.getTotalBank();

                        icon = <span className={'control-panel icon left' + icon_ext}>USD</span>;
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
                                        className={'control-panel field right' + field_ext} 
                                        name={name} type='number' value={total_bank}
                                        min={min} max={max}
                                        readOnly
                                    />
                                </div>
                            </div>
                        );
                    }
                    else if (name === 'Effective Bank')
                    {
                        const effective_bank = this.getEffectiveBank();
                        const maximum_bank = this.getVariableValue('Maximum Bank');

                        let err_msg;
                        let err_class = "";
                        if (effective_bank > maximum_bank)
                        {
                            err_msg = (
                                <div className='control-panel row'>
                                    <div className='control-panel item err-msg'>
                                        Effective Bank [<em>Usable Bank x Risk (%)</em>] <strong>exceeds</strong> <em>Maximum Bank</em>
                                    </div>
                                </div>
                            )
                            err_class = " error";
                        }

                        icon = <span className={'control-panel icon left' + icon_ext + err_class}>USD</span>;
                        elem = (
                            <React.Fragment key={current_account + name}>
                            <div className='control-panel row'>
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
                                        className={'control-panel field right' + field_ext + err_class} 
                                        name={name} type='number' value={effective_bank}
                                        min={min} max={max}
                                        readOnly
                                    />
                                </div>
                            </div>
                            {err_msg}
                            </React.Fragment>
                        );
                    }
                    else if (name === 'Leverage')
                    {
                        elem = (
                            <React.Fragment key={current_account + name}>
                            <div className='control-panel row'>
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
                                    <input 
                                        ref={this.addInputRef}
                                        className={'control-panel field left' + field_ext} 
                                        name={name} type='text' value={value}
                                        readOnly
                                    />
                                    <span name={"dropdown_" + name} className={'control-panel icon right btn' + icon_ext} onClick={this.onDropdownClick.bind(this)}>
                                        <FontAwesomeIcon className='control-panel dropdown-icon-right' icon={faChevronDown} />
                                    </span>
                                    <div 
                                        ref={this.addDropdownSelectorRef} 
                                        name={"dropdown_" + name} 
                                        className='control-panel dropdown-selector'
                                        style={{display: "none"}}
                                        onClick={this.onDropdownSelectorClick.bind(this)}
                                    >
                                        <div>1:500</div>
                                        <div>1:400</div>
                                        <div>1:300</div>
                                        <div>1:200</div>
                                        <div>1:100</div>
                                        <div>1:75</div>
                                        <div>1:50</div>
                                        <div>1:30</div>
                                        <div>1:20</div>
                                        <div>1:10</div>
                                        <div>1:5</div>
                                        <div>1:2</div>
                                        <div>1:1</div>
                                    </div>
                                </div>
                            </div>
                            <div className='control-panel row'>
                                <div className='control-panel item left'>
                                    <div className='control-panel item-main'>
                                        <span className='control-panel item-title'>Maximum Risk (%)</span>
                                        <span className='control-panel item-description'>The maximum Risk % your leverage allows.</span>
                                    </div>
                                </div>
                                <div className='control-panel item right'>
                                    <span className='control-panel item-value'>{this.getLevarageCalc(value)}%</span>
                                </div>
                            </div>
                            </React.Fragment>
                        );
                    }
                    else
                    {
                        elem = <React.Fragment key={current_account + name} />;
                    }
                }
                else
                {
                    if (item.type === 'integer')
                    {
                        type = 'number';
                        step = '1';
                    }
                    else if (item.type === 'decimal')
                    {
                        type = 'number';
                        step = '.01';
                    }
                    else if (item.type === 'percentage')
                    {
                        type = 'number';
                        step = '.01';
                        icon = <span className={'control-panel icon left' + icon_ext}>%</span>;
                    }
                    else if (item.type === 'cash')
                    {
                        type = 'number';
                        step = '.01';
                    }
                    else if (item.type === 'text')
                    {
                        type = 'text';
                    }
                    else if (item.type === 'time')
                    {
                        type = 'time';
                    }

                    if (!icon)
                        field_ext += " no-icon";

                    if (enabled !== undefined)
                    {
                        if (!enabled)
                        {
                            field_ext += " disabled";
                            readOnly = true;
                        }

                        enabled_elem = (
                            <div>
                                <label className='control-panel checkbox'>
                                    <input 
                                        type='checkbox' 
                                        checked={enabled}
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
                                    className={'control-panel field right' + field_ext} name={name}
                                    type={type} value={value}
                                    step={step} min={min} max={max}
                                    onChange={this.onVariableChange.bind(this)}
                                    readOnly={readOnly}
                                />
                                {enabled_elem}
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
                    <div><span className='control-panel scope-header'>Account</span> <span className="control-panel scope-account">({current_account.split('.')[1]})</span></div>
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

    closeDropdown(name)
    {
        if (name in this.dropdowns)
        {
            if (this.dropdowns[name].style.display === "none")
            {
                this.dropdowns[name].style.display = "block";
            }
            else
            {
                this.dropdowns[name].style.display = "none";
            }
        }
    }

    onDropdownClick(e)
    {
        const name = e.target.getAttribute("name");

        this.closeDropdown(name);
    }

    onDropdownSelectorClick(e)
    {
        const name = e.target.parentNode.getAttribute("name");
        const value = e.target.innerText;
        if (name.includes("Leverage"))
        {
            this.setVariableChange("Leverage", value);
        }

        this.closeDropdown(name);
    }

    getLevarageCalc = (leverage) =>
    {
        const leverage_parts = leverage.split(":");

        const bank_size = 10000;
        const max_lotsize = 2.5;

        const max_risk = ((parseFloat(leverage_parts[1]) * bank_size) / 100000) / max_lotsize;
        return (max_risk - 0.05).toFixed(2);
    }
    
}

export default ControlPanel;