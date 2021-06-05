import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faChevronDown
} from '@fortawesome/pro-regular-svg-icons';
import ColorSwatch from './ColorSwatch';

class IndicatorSettings extends Component
{
    constructor(props)
    {
        super(props);

        this.onMouseUp = this.onMouseUp.bind(this);
    }
 
    state = {
        selected_dropdown: null,
        changed: {}
    }

    componentDidMount()
    {
        window.addEventListener("mouseup", this.onMouseUp);
    }

    componentWillUnmount()
    {
        window.removeEventListener("mouseup", this.onMouseUp);
    }

    render()
    {
        return(
            <React.Fragment>
            
            <div className='popup header no-border'>
                <span>{this.getName()}</span>
            </div>
            <div className='popup category-top'>
                <div 
                    className={this.isSelected('properties') ? 'selected' : ''}
                    name={'properties'}
                    onClick={this.onSelect}
                >
                    Properties
                </div>
                <div 
                    className={this.isSelected('appearance') ? 'selected' : ''}
                    name={'appearance'}
                    onClick={this.onSelect}
                >
                    Appearance
                </div>
            </div>
            <div className='popup content'>
                <div className='popup main'>
                    {this.getItems()}
                </div>
            </div>
            <div className='popup footer'>
                <div className='popup dropdown'>
                    <div className='popup dropdown-btn layout-dropdown disabled' onClick={this.onDropdownClick}>
                        <span>Default</span>
                        <FontAwesomeIcon icon={faChevronDown} />
                    </div>
                    <div className='popup dropdown-content' onClick={this.onDropdownSelectLayout}>
                        
                    </div>
                </div>
                <div className='popup accept-group'>
                    <div onClick={this.onCancel.bind(this)}>Cancel</div>
                    <div onClick={this.onApply.bind(this)}>Ok</div>
                </div>
            </div>

            </React.Fragment>
        );
    }

    onMouseUp(e)
    {
        this.clearDropdowns(e);
    }

    getPropertyItems()
    {
        let result = [];
        for (let i=0; i < Object.keys(this.getIndicator().properties).length; i++)
        {
            const key = Object.keys(this.getIndicator().properties)[i];
            const type = this.getIndicator().properties[key].type;
            const value = this.getIndicator().properties[key].value;
            if (type === 'number')
            {
                result.push(
                    <div key={key} className='popup table-row'>
                        <div className='popup table-cell'>
                            <div className='popup left'>{key}</div>
                        </div>
                        <div className='popup table-cell'>
                            <div className='popup right'>
                                <div>
                                    <input 
                                        className={'popup small-input'} defaultValue={value}
                                        onChange={this.onChange.bind(this)}
                                        type='number' name={key}
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
            else if (type === 'dropdown')
            {
                result.push(
                    <div key={key} className='popup table-row'>
                        <div className='popup table-cell'>
                            <div className='popup left'>
                                {key}
                            </div>
                        </div>
                        <div className='popup table-cell'>
                            <div className='popup right'>
                                <div ref={this.addDropdownRef} className='popup dropdown'>
                                    <div className='popup dropdown-btn' onClick={this.onDropdownClick}>
                                        <span>{value}</span>
                                        <FontAwesomeIcon icon={faChevronDown} />
                                    </div>
                                    <div className='popup dropdown-content'>
                                        <div className='popup dropdown-item' name={'source value'} value={0}>Open</div>
                                        <div className='popup dropdown-item' name={'source value'} value={1}>High</div>
                                        <div className='popup dropdown-item' name={'source value'} value={2}>Low</div>
                                        <div className='popup dropdown-item' name={'source value'} value={3}>Close</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
        }

        return (
            <div key='properties' className='popup table'>
            {result}
            </div>
        );
    }

    getAppearanceItems()
    {
        let result = [];
        for (let i=0; i < Object.keys(this.getIndicator().appearance).length; i++)
        {
            const key = Object.keys(this.getIndicator().appearance)[i];

            if (key === 'colors')
            {
                for (let i in this.getIndicator().appearance[key])
                {
                    const name = i;
                    const enabled = this.getIndicator().appearance[key][i].enabled;
                    const value = this.getIndicator().appearance[key][i].value;

                    result.push(
                        <div key={i} className='popup table-row'>
                            <div className='popup table-cell'>
                                <div className='popup left'>
                                    <label className='popup checkbox'>
                                        <input 
                                            type='checkbox' 
                                            defaultChecked={enabled}
                                        />
                                        <div className='checkmark disabled'></div>
                                    </label>
                                    {name}
                                </div>
                            </div>
                            <div className='popup table-cell'>
                                <div className='popup right'>
                                    <div>
                                        <ColorSwatch 
                                            rgb={value}
                                            disabled={true}
                                            // getProperty={this.getProperty}
                                            // setProperty={this.setProperty}
                                            // setHoverOn={this.props.setHoverOn}
                                            // setHoverOff={this.props.setHoverOff}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }
            }
        }

        return (
            <div key='properties' className='popup table'>
            {result}
            </div>
        );
    }

    clearDropdowns = (e) =>
    {
        let { selected_dropdown } = this.state;

        if (selected_dropdown !== null)
        {
            if (e.target.parentNode !== selected_dropdown && 
                e.target.parentNode.parentNode !== selected_dropdown)
            {
                this.resetSelectedDropdown();
            }
        }
    }

    resetSelectedDropdown = () =>
    {
        let { selected_dropdown } = this.state;
        if (selected_dropdown !== null)
        {
            selected_dropdown.childNodes[0].className = selected_dropdown.childNodes[0].className.replace(' selected', '');
            selected_dropdown.childNodes[1].style.display = 'none';
            selected_dropdown = null
            this.setState({ selected_dropdown });
        }
    }

    onDropdownClick = (e) =>
    {
        let { selected_dropdown } = this.state;

        let parent = e.target.parentNode;
        if (parent.className.includes('dropdown-btn'))
        {
            parent = parent.parentNode;
        }

        if (parent !== selected_dropdown)
        {
            const btn = parent.childNodes[0];
            const options = parent.childNodes[1];
            const container_size = this.props.getContainerSize();

            const DROPDOWN_ITEM_HEIGHT = 37;
            const options_top = parent.offsetTop + 35;
            const options_height = (options.childNodes.length+1) * DROPDOWN_ITEM_HEIGHT;

            btn.className = btn.className + ' selected';
            options.style.display = 'block';
            options.style.width = (parent.clientWidth) + 'px';

            options.style.top = Math.min(options_top, container_size.height - options_height - DROPDOWN_ITEM_HEIGHT) + 'px';

            selected_dropdown = parent;
            this.setState({ selected_dropdown });
        }
        else
        {
            this.resetSelectedDropdown();
        }
    }

    getItems()
    {
        const opened = this.props.getPopup().opened;

        if (opened === 'properties')
        {
            return this.getPropertyItems();
        }
        else if (opened === 'appearance')
        {
            return this.getAppearanceItems();
        }
    }

    getChart = () =>
    {
        return this.props.getPopup().properties.chart;
    }

    getIndicator = () =>
    {
        return this.props.getPopup().properties.indicator;
    }

    getName = () =>
    {
        const name = this.props.getPopup().properties.indicator.type
        return name.substr(0,1).toUpperCase() + name.substr(1);
    }
    
    isSelected = (name) =>
    {
        return this.props.getPopup().opened === name;
    }

    onSelect = (e) =>
    {
        const name = e.target.getAttribute('name');
        this.props.changeCategory(name);
    }

    onChange = (e) =>
    {
        const name = e.target.getAttribute('name');
        let { changed } = this.state;

        changed[name] = e.target.value;
        this.setState({ changed });
    }

    onCancel = () =>
    {
        this.props.close();
    }

    onApply = (e) =>
    {
        let indicator = this.getIndicator();
        let chart = this.getChart();
        let current_indicator = this.props.findIndicator(
            indicator.type, chart.broker, chart.product, 
            chart.period, indicator.properties.Period.value
        );

        let { changed } = this.state;
        for (let name in changed)
        {
            if (indicator.properties[name].type === 'number')
            {
                indicator.properties[name].value = parseInt(changed[name]);
            }
            else
            {
                indicator.properties[name].value = changed[name];
            }
        }

        current_indicator.setProperties(
            chart.broker, chart.product, chart.period, 
            indicator.properties, indicator.appearance
        );
        this.props.resetIndicators(chart);
        this.props.calculateAllChartIndicators(chart);

        changed = {};
        this.setState({ changed });
        this.props.close();
    }
    
}

export default IndicatorSettings;