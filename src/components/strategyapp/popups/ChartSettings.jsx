import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faChevronRight
} from '@fortawesome/pro-regular-svg-icons';
import { 
    faChartBar, faChartLine, faDollarSign
} from '@fortawesome/pro-light-svg-icons';
import ColorSwatch from './ColorSwatch';

class Popup extends Component
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
                    <div className={'popup category-btn' + this.isSelected('bars')} onClick={this.props.onChangeCategory} name='bars'>
                        <span className='popup category-left'>
                            <FontAwesomeIcon icon={faChartBar} />
                            Bars
                        </span>
                        <span className='popup category-right'><FontAwesomeIcon icon={faChevronRight} className='popup category-icon' /></span>
                    </div>
                    <div className={'popup category-btn' + this.isSelected('chart')} onClick={this.props.onChangeCategory} name='chart'>
                        <span className='popup category-left'>
                            <FontAwesomeIcon icon={faChartLine} />
                            Chart
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

    getBarsItems()
    {
        return (
            <React.Fragment>

            <div>
                <div className='popup left'>Bar type</div>
                <div className='popup left'>Body</div>
                <div className='popup left'>Outline</div>
                <div className='popup left'>Wick</div>
            </div>
            <div>
                <div className='popup right'>
                    
                </div>
                <div className='popup right'>
                    <ColorSwatch 
                        key={'bodyLong'}
                        sub={'bars'}
                        name={'bodyLong'}
                        getProperty={this.getProperty}
                        setProperty={this.setProperty}
                        setHoverOn={this.props.setHoverOn}
                        setHoverOff={this.props.setHoverOff}
                    />
                    <ColorSwatch 
                        key={'bodyShort'}
                        sub={'bars'}
                        name={'bodyShort'}
                        getProperty={this.getProperty}
                        setProperty={this.setProperty}
                        setHoverOn={this.props.setHoverOn}
                        setHoverOff={this.props.setHoverOff}
                    />
                </div>
                <div className='popup right'>
                    <ColorSwatch 
                        key={'outlineLong'}
                        sub={'bars'}
                        name={'outlineLong'}
                        getProperty={this.getProperty}
                        setProperty={this.setProperty}
                        setHoverOn={this.props.setHoverOn}
                        setHoverOff={this.props.setHoverOff}
                    />
                    <ColorSwatch 
                        key={'outline'}
                        sub={'bars'}
                        name={'outlineShort'}
                        getProperty={this.getProperty}
                        setProperty={this.setProperty}
                        setHoverOn={this.props.setHoverOn}
                        setHoverOff={this.props.setHoverOff}
                    />
                </div>
                <div className='popup right'>
                    <ColorSwatch 
                        key={'wickLong'}
                        sub={'bars'}
                        name={'wickLong'}
                        getProperty={this.getProperty}
                        setProperty={this.setProperty}
                        setHoverOn={this.props.setHoverOn}
                        setHoverOff={this.props.setHoverOff}
                    />
                    <ColorSwatch 
                        key={'wickShort'}
                        sub={'bars'}
                        name={'wickShort'}
                        getProperty={this.getProperty}
                        setProperty={this.setProperty}
                        setHoverOn={this.props.setHoverOn}
                        setHoverOff={this.props.setHoverOff}
                    />
                </div>
            </div>


            </React.Fragment>
        )
    }

    getChartItems()
    {
        return (
            <React.Fragment>
            
            <div>
                <div className='popup left'>Background</div>
                <div className='popup left'>Horizontal Grid</div>
                <div className='popup left'>Vertical Grid</div>
                <div className='popup left'>Price label</div>
                <div className='popup left'>Price line</div>
                <div className='popup left'>Crosshair</div>
            </div>
            <div>
                <div className='popup right'>
                    <ColorSwatch 
                        key={'background'}
                        sub={'chart'}
                        name={'background'}
                        getProperty={this.getProperty}
                        setProperty={this.setProperty}
                        setHoverOn={this.props.setHoverOn}
                        setHoverOff={this.props.setHoverOff}
                    />
                </div>
                <div className='popup right'>
                    <ColorSwatch 
                        key={'horizontalGrid'}
                        sub={'chart'}
                        name={'horizontalGrid'}
                        getProperty={this.getProperty}
                        setProperty={this.setProperty}
                        setHoverOn={this.props.setHoverOn}
                        setHoverOff={this.props.setHoverOff}
                    />
                </div>
                <div className='popup right'>
                    <ColorSwatch 
                        key={'verticalGrid'}
                        sub={'chart'}
                        name={'verticalGrid'}
                        getProperty={this.getProperty}
                        setProperty={this.setProperty}
                        setHoverOn={this.props.setHoverOn}
                        setHoverOff={this.props.setHoverOff}
                    />
                </div>
                <div className='popup right'>
                    <ColorSwatch 
                        key={'priceLabel'}
                        sub={'chart'}
                        name={'priceLabel'}
                        getProperty={this.getProperty}
                        setProperty={this.setProperty}
                        setHoverOn={this.props.setHoverOn}
                        setHoverOff={this.props.setHoverOff}
                    />
                </div>
                <div className='popup right'>
                    <ColorSwatch 
                        key={'priceLine'}
                        sub={'chart'}
                        name={'priceLine'}
                        getProperty={this.getProperty}
                        setProperty={this.setProperty}
                        setHoverOn={this.props.setHoverOn}
                        setHoverOff={this.props.setHoverOff}
                    />
                </div>
                <div className='popup right'>
                    <ColorSwatch 
                        key={'showOrders'}
                        sub={'chart'}
                        name={'crosshair'}
                        getProperty={this.getProperty}
                        setProperty={this.setProperty}
                        setHoverOn={this.props.setHoverOn}
                        setHoverOff={this.props.setHoverOff}
                    />
                </div>
            </div>

            </React.Fragment>
        )
    }

    getTradingItems()
    {
        return (
            <React.Fragment>

            <div>
                <div className='popup left'>Price</div>
                <div className='popup left'>Show Positions</div>
                <div className='popup left'>Show Orders</div>
            </div>
            <div>
                <div className='popup right'>

                </div>
                <div className='popup right'>
                    
                </div>
                <div className='popup right'>
                    
                </div>
            </div>

            </React.Fragment>
        )
    }

    getItems()
    {
        const opened = this.props.getPopup().opened;

        if (opened === 'bars')
        {
            return this.getBarsItems();
        }
        else if (opened === 'chart')
        {
            return this.getChartItems();
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

    getProperty = (sub, name) =>
    {
        const strategy_id = this.props.getStrategyId();
        const item_id = this.props.getPopup().properties.item_id;

        if (this.props.getWindowInfo(strategy_id, item_id).properties[sub] === undefined)
        {
            this.props.getWindowInfo(strategy_id, item_id).properties[sub] = {};
        }

        return this.props.getWindowInfo(strategy_id, item_id).properties[sub][name];
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

export default Popup;