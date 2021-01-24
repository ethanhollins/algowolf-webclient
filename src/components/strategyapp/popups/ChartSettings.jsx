import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faChevronRight, faChevronDown
} from '@fortawesome/pro-regular-svg-icons';
import { 
    faChartBar, faChartLine, faDollarSign, faPencilAlt
} from '@fortawesome/pro-light-svg-icons';
import ColorSwatch from './ColorSwatch';
import moment from "moment-timezone";

class ChartSettings extends Component
{

    constructor(props)
    {
        super(props);

        this.onMouseUp = this.onMouseUp.bind(this);
        this.dropdowns = [];

        this.addDropdownRef = elem => {
            this.dropdowns.push(elem);
        }
    }

    state = {
        selected_dropdown: null
    }

    componentDidMount()
    {
        window.addEventListener("mouseup", this.onMouseUp);

        const popup = this.props.getPopup();
        if (popup.opened === undefined)
            this.props.changeCategory('bars');       
    }

    componentWillUnmount()
    {
        window.removeEventListener("mouseup", this.onMouseUp);
    }

    render()
    {
        return(
            <React.Fragment>
            
            <div className='popup header'>
                <span>Chart Settings</span>
            </div>
            <div className='popup content'>
                <div className='popup category'>
                    <div className={'popup category-btn' + this.isSelected('general')} onClick={this.props.onChangeCategory} name='general'>
                        <span className='popup category-left'>
                            <FontAwesomeIcon icon={faChartLine} />
                            General
                        </span>
                        <span className='popup category-right'><FontAwesomeIcon icon={faChevronRight} className='popup category-icon' /></span>
                    </div>
                    <div className={'popup category-btn' + this.isSelected('appearance')} onClick={this.props.onChangeCategory} name='appearance'>
                        <span className='popup category-left'>
                            <FontAwesomeIcon icon={faPencilAlt} />
                            Appearance
                        </span>
                        <span className='popup category-right'><FontAwesomeIcon icon={faChevronRight} className='popup category-icon' /></span>
                    </div>
                    <div className={'popup category-btn' + this.isSelected('trading')} onClick={this.props.onChangeCategory} name='trading'>
                        <span className='popup category-left'>
                            <FontAwesomeIcon icon={faDollarSign} />
                            Trading
                        </span>
                        <span className='popup category-right'><FontAwesomeIcon icon={faChevronRight} className='popup category-icon' /></span>
                    </div>
                </div>
                <div className='popup main'>
                    <div className='popup main-list'>
                        {this.getItems()}
                    </div>
                </div>
            </div>
            <div className='popup footer'>
                <div className='popup dropdown'>
                    <div className='popup dropdown-btn layout-dropdown' onClick={this.onDropdownClick}>
                        <span>Layout 1</span>
                        <FontAwesomeIcon icon={faChevronDown} />
                    </div>
                    <div className='popup dropdown-content' onClick={this.onDropdownSelectLayout}>
                        {this.getLayouts()}
                    </div>
                </div>
                <div className='popup accept-group'>
                    <div onClick={this.onCancel}>Cancel</div>
                    <div onClick={this.onApply}>Apply & Save</div>
                </div>
            </div>

            </React.Fragment>
        );
    }

    onMouseUp(e)
    {
        this.clearDropdowns(e);
    }

    getGeneralItems()
    {
        const settings = this.getChartSettings().general;

        let timezone_elems = [];
        for (let tz in this.props.getTimezones())
        {
            timezone_elems.push(
                <div key={tz} className='popup dropdown-item' name={'timezone value'} value={tz}>{tz}</div>
            )
        }

        return (
            <div key='bars' className='popup table'>
            
            <div className='popup table-row'>
                <div className='popup table-cell'>
                    <div className='popup left'>Timezone</div>
                </div>
                <div className='popup table-cell'>
                    <div className='popup right'>
                        <div ref={this.addDropdownRef} className='popup dropdown'>
                            <div className='popup dropdown-btn' onClick={this.onDropdownClick}>
                                <span>{settings['timezone'].value}</span>
                                <FontAwesomeIcon icon={faChevronDown} />
                            </div>
                            <div className='popup dropdown-content' onClick={this.onDropdownSelectGeneral}>
                                {timezone_elems}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='popup table-row'>
                <div className='popup table-cell'>
                    <div className='popup left'>Date Format</div>
                </div>
                <div className='popup table-cell'>
                    <div className='popup right'>
                        <div ref={this.addDropdownRef} className='popup dropdown'>
                            <div className='popup dropdown-btn' onClick={this.onDropdownClick}>
                                <span>{moment().format(settings['date-format'].value.replace(' ', '\xa0'))}</span>
                                <FontAwesomeIcon icon={faChevronDown} />
                            </div>
                            <div className='popup dropdown-content' onClick={this.onDropdownSelectGeneral}>
                                <div className='popup dropdown-item' name={'date-format value'} value={'DD MMM `YY\xa0\xa0HH:mm'}>{moment().format('DD MMM `YY\xa0\xa0HH:mm')}</div>
                                <div className='popup dropdown-item' name={'date-format value'} value={'YYYY/MM/DD\xa0\xa0HH:mm'}>{moment().format('YYYY/MM/DD\xa0\xa0HH:mm')}</div>
                                <div className='popup dropdown-item' name={'date-format value'} value={'DD/MM/YY\xa0\xa0HH:mm'}>{moment().format('DD/MM/YY\xa0\xa0HH:mm')}</div>
                                <div className='popup dropdown-item' name={'date-format value'} value={'MM/DD/YY\xa0\xa0HH:mm'}>{moment().format('MM/DD/YY\xa0\xa0HH:mm')}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='popup table-row'>
                <div className='popup table-cell'>
                    <div className='popup left'>Font Size</div>
                </div>
                <div className='popup table-cell'>
                    <div className='popup right'>
                        <div ref={this.addDropdownRef} className='popup dropdown'>
                            <div className='popup dropdown-btn' onClick={this.onDropdownClick}>
                                <span>{settings['font-size'].value}</span>
                                <FontAwesomeIcon icon={faChevronDown} />
                            </div>
                            <div className='popup dropdown-content' onClick={this.onDropdownSelectGeneral}>
                                <div className='popup dropdown-item' name={'font-size value'} value={8}>8</div>
                                <div className='popup dropdown-item' name={'font-size value'} value={10}>10</div>
                                <div className='popup dropdown-item' name={'font-size value'} value={12}>12</div>
                                <div className='popup dropdown-item' name={'font-size value'} value={14}>14</div>
                                <div className='popup dropdown-item' name={'font-size value'} value={16}>16</div>
                                <div className='popup dropdown-item' name={'font-size value'} value={18}>18</div>
                                <div className='popup dropdown-item' name={'font-size value'} value={20}>20</div>
                                <div className='popup dropdown-item' name={'font-size value'} value={20}>24</div>
                                <div className='popup dropdown-item' name={'font-size value'} value={20}>28</div>
                                <div className='popup dropdown-item' name={'font-size value'} value={20}>32</div>
                                <div className='popup dropdown-item' name={'font-size value'} value={20}>40</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='popup table-row'>
                <div className='popup table-cell'>
                    <div className='popup left'>Precision</div>
                </div>
                <div className='popup table-cell'>
                    <div className='popup right'>
                        <div ref={this.addDropdownRef} className='popup dropdown'>
                            <div className='popup dropdown-btn' onClick={this.onDropdownClick}>
                                <span>{settings['precision'].value}</span>
                                <FontAwesomeIcon icon={faChevronDown} />
                            </div>
                            <div className='popup dropdown-content' onClick={this.onDropdownSelectGeneral}>
                                <div className='popup dropdown-item' name={'precision value'} value={'1/1'}>{'1/1'}</div>
                                <div className='popup dropdown-item' name={'precision value'} value={'1/10'}>{'1/10'}</div>
                                <div className='popup dropdown-item' name={'precision value'} value={'1/100'}>{'1/100'}</div>
                                <div className='popup dropdown-item' name={'precision value'} value={'1/1000'}>{'1/1000'}</div>
                                <div className='popup dropdown-item' name={'precision value'} value={'1/10000'}>{'1/10000'}</div>
                                <div className='popup dropdown-item' name={'precision value'} value={'1/100000'}>{'1/100000'}</div>
                                <div className='popup dropdown-item' name={'precision value'} value={'1/1000000'}>{'1/1000000'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            </div>
        )
    }

    getAppearanceItems()
    {
        const settings = this.getChartSettings().appearance;

        return (
            <div key='bars' className='popup table'>
            
            <div className='popup table-row'>
                <div className='popup table-cell'>
                    <div className='popup left'>
                        <label className='popup checkbox'>
                            <input 
                                type='checkbox' 
                                defaultChecked={settings['body']['enabled']}
                            />
                            <div className='checkmark'></div>
                        </label>
                        <div>Body</div>
                    </div>
                </div>
                <div className='popup table-cell'>
                    <div className='popup right'>
                        <ColorSwatch 
                            key={'body-long'}
                            category={'appearance'}
                            sub={'body'}
                            name={'long'}
                            getProperty={this.getProperty}
                            setProperty={this.setProperty}
                            setHoverOn={this.props.setHoverOn}
                            setHoverOff={this.props.setHoverOff}
                        />
                        <ColorSwatch 
                            key={'body-short'}
                            category={'appearance'}
                            sub={'body'}
                            name={'short'}
                            getProperty={this.getProperty}
                            setProperty={this.setProperty}
                            setHoverOn={this.props.setHoverOn}
                            setHoverOff={this.props.setHoverOff}
                        />
                    </div>
                </div>
            </div>
            <div className='popup table-row'>
                <div className='popup table-cell'>
                    <div className='popup left'>
                        <label className='popup checkbox'>
                            <input 
                                type='checkbox' 
                                defaultChecked={settings['outline']['enabled']}
                            />
                            <div className='checkmark'></div>
                        </label>
                        <div>Outline</div>
                    </div>
                </div>
                <div className='popup table-cell'>
                    <div className='popup right'>
                        <ColorSwatch 
                            key={'outline-long'}
                            category={'appearance'}
                            sub={'outline'}
                            name={'long'}
                            getProperty={this.getProperty}
                            setProperty={this.setProperty}
                            setHoverOn={this.props.setHoverOn}
                            setHoverOff={this.props.setHoverOff}
                        />
                        <ColorSwatch 
                            key={'outline-short'}
                            category={'appearance'}
                            sub={'outline'}
                            name={'short'}
                            getProperty={this.getProperty}
                            setProperty={this.setProperty}
                            setHoverOn={this.props.setHoverOn}
                            setHoverOff={this.props.setHoverOff}
                        />
                    </div>
                </div>
            </div>
            <div className='popup table-row'>
                <div className='popup table-cell'>
                    <div className='popup left'>
                        <label className='popup checkbox'>
                            <input 
                                type='checkbox' 
                                defaultChecked={settings['wick']['enabled']}
                            />
                            <div className='checkmark'></div>
                        </label>
                        <div>Wick</div>
                    </div>
                </div>
                <div className='popup table-cell'>
                    <div className='popup right'>
                        <ColorSwatch 
                            key={'wick-long'}
                            category={'appearance'}
                            sub={'wick'}
                            name={'long'}
                            getProperty={this.getProperty}
                            setProperty={this.setProperty}
                            setHoverOn={this.props.setHoverOn}
                            setHoverOff={this.props.setHoverOff}
                        />
                        <ColorSwatch 
                            key={'wick-short'}
                            category={'appearance'}
                            sub={'wick'}
                            name={'short'}
                            getProperty={this.getProperty}
                            setProperty={this.setProperty}
                            setHoverOn={this.props.setHoverOn}
                            setHoverOff={this.props.setHoverOff}
                        />
                    </div>
                </div>
            </div>
            <div className='popup table-row'>
                <div className='popup table-cell'>
                    <div className='popup left'>
                        <label className='popup checkbox'>
                            <input 
                                type='checkbox' 
                                defaultChecked={settings['price-line']['enabled']}
                            />
                            <div className='checkmark'></div>
                        </label>
                        <div>Price Line</div>
                    </div>
                </div>
                <div className='popup table-cell'>
                    <div className='popup right'>
                        <ColorSwatch 
                            key={'price-line'}
                            category={'appearance'}
                            sub={'price-line'}
                            name={'value'}
                            getProperty={this.getProperty}
                            setProperty={this.setProperty}
                            setHoverOn={this.props.setHoverOn}
                            setHoverOff={this.props.setHoverOff}
                        />
                    </div>
                </div>
            </div>
            <div className='popup table-row'>
                <div className='popup table-cell'>
                    <div className='popup left'>
                        <label className='popup checkbox'>
                            <input 
                                type='checkbox' 
                                defaultChecked={settings['vert-grid-lines']['enabled']}
                            />
                            <div className='checkmark'></div>
                        </label>
                        <div>Vert Grid Lines</div>
                    </div>
                </div>
                <div className='popup table-cell'>
                    <div className='popup right'>
                        <ColorSwatch 
                            key={'vert-grid-lines'}
                            category={'appearance'}
                            sub={'vert-grid-lines'}
                            name={'value'}
                            getProperty={this.getProperty}
                            setProperty={this.setProperty}
                            setHoverOn={this.props.setHoverOn}
                            setHoverOff={this.props.setHoverOff}
                        />
                    </div>
                </div>
            </div>
            <div className='popup table-row'>
                <div className='popup table-cell'>
                    <div className='popup left'>
                        <label className='popup checkbox'>
                            <input 
                                type='checkbox' 
                                defaultChecked={settings['horz-grid-lines']['enabled']}
                            />
                            <div className='checkmark'></div>
                        </label>
                        <div>Horz Grid Lines</div>
                    </div>
                </div>
                <div className='popup table-cell'>
                    <div className='popup right'>
                        <ColorSwatch 
                            key={'horz-grid-lines'}
                            category={'appearance'}
                            sub={'horz-grid-lines'}
                            name={'value'}
                            getProperty={this.getProperty}
                            setProperty={this.setProperty}
                            setHoverOn={this.props.setHoverOn}
                            setHoverOff={this.props.setHoverOff}
                        />
                    </div>
                </div>
            </div>
            <div className='popup table-row'>
                <div className='popup table-cell'>
                    <div className='popup left'>
                        <label className='popup checkbox'>
                            <input 
                                type='checkbox' 
                                defaultChecked={settings['crosshair']['enabled']}
                            />
                            <div className='checkmark'></div>
                        </label>
                        <div>Crosshair</div>
                    </div>
                </div>
                <div className='popup table-cell'>
                    <div className='popup right'>
                        <ColorSwatch 
                            key={'crosshair'}
                            category={'appearance'}
                            sub={'crosshair'}
                            name={'value'}
                            getProperty={this.getProperty}
                            setProperty={this.setProperty}
                            setHoverOn={this.props.setHoverOn}
                            setHoverOff={this.props.setHoverOff}
                        />
                    </div>
                </div>
            </div>

            </div>
        )
    }

    getTradingItems()
    {
        const settings = this.getChartSettings().trading;

        return (
            <div key='bars' className='popup table'>
            
            <div className='popup table-row'>
                <div className='popup table-cell'>
                    <div className='popup left'>
                        <label className='popup checkbox'>
                            <input 
                                type='checkbox' 
                                defaultChecked={settings['show-positions']['enabled']}
                            />
                            <div className='checkmark'></div>
                        </label>
                        <div>Show Positions</div>
                    </div>
                </div>
                <div className='popup table-cell'>
                    <div className='popup right'>
                    </div>
                </div>
            </div>
            <div className='popup table-row'>
                <div className='popup table-cell'>
                    <div className='popup left'>
                        <label className='popup checkbox'>
                            <input 
                                type='checkbox' 
                                defaultChecked={settings['show-orders']['enabled']}
                            />
                            <div className='checkmark'></div>
                        </label>
                        <div>Show Orders</div>
                    </div>
                </div>
                <div className='popup table-cell'>
                    <div className='popup right'>
                    </div>
                </div>
            </div>

            </div>
        )
    }

    getLayout()
    {
        if (this.props.getPopup().properties.layout !== undefined)
        {
            return this.props.getPopup().properties.layout;
        }
        else
        {
            return this.props.getStrategyInfo(this.props.getStrategyId()).settings['chart-settings'].current;
        }
    }

    getChartSettings()
    {
        return this.props.getStrategyInfo(this.props.getStrategyId()).settings['chart-settings'].layouts[this.getLayout()];
    }

    getItems()
    {
        const opened = this.props.getPopup().opened;

        if (opened === 'general')
        {
            return this.getGeneralItems();
        }
        else if (opened === 'appearance')
        {
            return this.getAppearanceItems();
        }
        else if (opened === 'trading')
        {
            return this.getTradingItems();
        }
    }

    isSelected(category)
    {
        const popup = this.props.getPopup();
        if (popup.opened === category)
            return ' selected';
        else
            return '';
    }

    getProperty = (category, sub, name) =>
    {
        const settings = this.getChartSettings()[category];
        
        return settings[sub][name];
    }

    setProperty = (category, sub, name, value) =>
    {
        this.getChartSettings()[category][sub][name] = value;
        this.props.updateStrategyInfo();
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

    onDropdownSelect = (e, category, sub, name, value) =>
    {
        this.resetSelectedDropdown();

        this.getChartSettings()[category][sub][name] = value;
        this.props.updateStrategyInfo();
    }

    onDropdownSelectGeneral = (e) =>
    {
        const elem_name = e.target.getAttribute('name');
        const value = e.target.getAttribute('value');
        if (elem_name)
        {
            const sub = elem_name.split(' ')[0];
            const name = elem_name.split(' ')[1];
            this.onDropdownSelect(e, 'general', sub, name, value);
        }
    }

    onDropdownSelectAppearance = (e) =>
    {
        const elem_name = e.target.getAttribute('name');
        const value = e.target.getAttribute('value');
        if (elem_name)
        {
            const sub = elem_name.split(' ')[0];
            const name = elem_name.split(' ')[1];
            this.onDropdownSelect(e, 'appearance', sub, name, value);
        }
    }

    onDropdownSelectTrading = (e) =>
    {
        const elem_name = e.target.getAttribute('name');
        const value = e.target.getAttribute('value');
        if (elem_name)
        {
            const sub = elem_name.split(' ')[0];
            const name = elem_name.split(' ')[1];
            this.onDropdownSelect(e, 'trading', sub, name, value);
        }
    }

    onDropdownSelectLayout = (e) =>
    {
        this.resetSelectedDropdown();

        const value = e.target.getAttribute('value');
        let settings = this.getChartSettings();
        this.props.getPopup().properties.layout = value;
        settings['current'] = value;
        this.props.updateStrategyInfo();
    }

    getLayouts = () =>
    {
        const settings = this.props.getStrategyInfo(this.props.getStrategyId()).settings['chart-settings'];
        let layouts = [];
        for (let i of Object.keys(settings.layouts))
        {
            layouts.push(<div key={i} className='popup dropdown-item' value={i}>{i}</div>);
        }
        return layouts;
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

    onCancel = () =>
    {
        this.props.close();
    }

    onApply = () =>
    {
        this.props.close();
    }
}

export default ChartSettings;