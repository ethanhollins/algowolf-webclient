import React, { Component } from 'react';
import moment from "moment-timezone";

class Info extends Component
{
    constructor(props)
    {
        super(props);

        this.onMouseMoveThrottled = this.onMouseMoveThrottled.bind(this);

        this.setInfoBodyRef = elem => {
            this.infoBody = elem;
        }
    }

    state = {
        current_info: []
    }

    render()
    {
        return (
            <div className='info background'>
                <div ref={this.setInfoBodyRef} className='info body'>
                    {this.state.current_info}
                </div>
            </div>
        );
    }

    getInfo = (mouse_pos) =>
    {
        // Get current hovered timestamp
        const top_window = this.props.getTopWindow(this.props.strategy_id, mouse_pos);

        let current_info = [];
        if (top_window !== null)
        {
            const window = this.props.getWindowById(top_window);
            if (window !== undefined && window.getElementType() === 'chart')
            {
                const chart = window.getInnerElement();
                if (chart !== undefined)
                {
                    const prices = chart.getChartPrices();

                    if (prices !== undefined)
                    {
                        const tz = 'Australia/Melbourne';
                        const time = moment.utc(
                            prices.timestamp*1000
                        ).tz(tz).format(chart.getCurrentPriceFormat());
    
                        // Generate default info, check settings for visible items
                        current_info.push(
                            <React.Fragment key={'chart'}>
                            
                            <div className='info header'>
                                Chart Info
                            </div>
                            <div className='info row'>
                                <div className='info item'>Time</div>
                                <div className='info item right'>{time}</div>
                            </div>
                            <div className='info row'>
                                <div className='info item'>Open</div>
                                <div className='info item right'>{prices.ohlc[0].toFixed(5)}</div>
                            </div>
                            <div className='info row'>
                                <div className='info item'>High</div>
                                <div className='info item right'>{prices.ohlc[1].toFixed(5)}</div>
                            </div>
                            <div className='info row'>
                                <div className='info item'>Low</div>
                                <div className='info item right'>{prices.ohlc[2].toFixed(5)}</div>
                            </div>
                            <div className='info row'>
                                <div className='info item'>Close</div>
                                <div className='info item right'>{prices.ohlc[3].toFixed(5)}</div>
                            </div>
    
                            </React.Fragment>
                        );
                            
                        const info = this.props.getInfo();
                        // Check for info at timestamp
                        if (prices.timestamp in info)
                        {
                            current_info.push(
                                <div key={'strategy'} className='info header'>
                                    Strategy Info
                                </div>
                            );
                            for (let i=0; i < info[prices.timestamp]; i++)
                            {
                                const item = info[prices.timestamp][i];
                                current_info.push(
                                    <div className='info row'>
                                        <div className='info item'>{item.name}</div>
                                        <div className='info item right'>{item.value}</div>
                                    </div>
                                );
                            }
                        }
    
    
                        this.setState({ current_info });
                    }
                }
            }
        }
    }

    onMouseMoveThrottled(mouse_pos)
    {
        this.getInfo(mouse_pos);
    }
}

export default Info;