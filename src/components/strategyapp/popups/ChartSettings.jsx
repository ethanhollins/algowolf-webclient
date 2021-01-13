import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faChevronRight
} from '@fortawesome/pro-regular-svg-icons';
import { 
    faChartBar, faChartLine, faDollarSign, faPencilAlt
} from '@fortawesome/pro-light-svg-icons';
import ColorSwatch from './ColorSwatch';

class ChartSettings extends Component
{

    componentDidMount()
    {
        const popup = this.props.getPopup();
        if (popup.opened === undefined)
            this.props.changeCategory('bars');
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

            </React.Fragment>
        );
    }

    getGeneralItems()
    {
        const settings = this.getChartSettings().general;

        return (
            <div key='bars' className='popup table'>
            
            <div className='popup table-row'>
                <div className='popup table-cell'>
                    <div className='popup left'>Timezone</div>
                </div>
                <div className='popup table-cell'>
                    <div className='popup right'>
                        {settings['timezone'].value}
                    </div>
                </div>
            </div>
            <div className='popup table-row'>
                <div className='popup table-cell'>
                    <div className='popup left'>Date Format</div>
                </div>
                <div className='popup table-cell'>
                    <div className='popup right'>
                        {settings['date-format'].value}
                    </div>
                </div>
            </div>
            <div className='popup table-row'>
                <div className='popup table-cell'>
                    <div className='popup left'>Font Size</div>
                </div>
                <div className='popup table-cell'>
                    <div className='popup right'>
                        {settings['font-size'].value}
                    </div>
                </div>
            </div>
            <div className='popup table-row'>
                <div className='popup table-cell'>
                    <div className='popup left'>Precision</div>
                </div>
                <div className='popup table-cell'>
                    <div className='popup right'>
                        {settings['precision'].value}
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
        return this.props.getPopup().properties.layout;
    }

    getChartSettings()
    {
        return this.props.getStrategyInfo(this.props.getStrategyId()).settings[this.getLayout()]['chart-settings'];
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

    setProperty = (sub, name, value) =>
    {
        const strategy_id = this.props.getStrategyId();
        const item_id = this.props.getPopup().properties.item_id;

        if (this.props.getWindowInfo(strategy_id, item_id).properties[sub] === undefined)
        {
            this.props.getWindowInfo(strategy_id, item_id).properties[sub] = {};
        }
        this.props.getWindowInfo(strategy_id, item_id).properties[sub][name] = value;
        this.props.updateStrategyInfo();
    }
}

export default ChartSettings;