import React, { Component } from 'react';
import moment from "moment-timezone";

class Info extends Component
{
    constructor(props)
    {
        super(props);

        this.updateInfo = this.updateInfo.bind(this);

        this.setInfoBodyRef = elem => {
            this.infoBody = elem;
        }
    }

    state = {
        last_top_window: null,
        current_info: []
    }

    render()
    {
        return (
            <div className='info background'>
                <div ref={this.setInfoBodyRef} className='info body'>
                    <div className='info header'>
                        Chart Info
                    </div>
                    {this.state.current_info}
                </div>
            </div>
        );
    }

    updateInfo = (mouse_pos) =>
    {
        // Get current hovered timestamp

        // let { last_top_window } = this.state;
        let current_info = [];

        // const top_window = this.props.getTopWindow(this.props.strategy_id, mouse_pos);
        // let window = this.props.getWindowById(top_window);
        // if (top_window !== null && window !== undefined && window.getElementType() === 'chart')
        // {
        //     last_top_window = window
        // }
        // else if (last_top_window !== null)
        // {
        //     window = last_top_window
        // }

        // if (window !== undefined && window.getElementType() === 'chart')
        // {
        const chart = this.props.getSelectedChart();
        if (chart !== undefined && chart !== null)
        {
            const product = chart.getProduct();
            const period = chart.getPeriod();
            const prices = chart.getPriceInfo();

            if (prices !== undefined)
            {
                const tz = 'Australia/Melbourne';
                const time = moment.utc(
                    prices.timestamp*1000
                ).tz(tz).format(chart.getCurrentPriceFormat());

                // Generate default info, check settings for visible items
                current_info.push(
                    <React.Fragment key={'chart'}>
                    
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
                    
                const info = this.props.getInfo(product, period);
                const key = String(prices.timestamp);
                // Check for info at timestamp
                if (key in info)
                {
                    for (let i = 0; i < info[key].length; i++)
                    {
                        const item = info[key][i];
                        const name = item.name;
                        const type = item.type;

                        if (type === 'header')
                        {
                            current_info.push(
                                <div 
                                    key={i} className='info header'
                                    style={{ backgroundColor: item.color }}
                                >
                                    {name}
                                </div>
                            );
                        }
                        else
                        {
                            current_info.push(
                                <div key={i} className='info row'>
                                    <div className='info item'>{name}</div>
                                    <div 
                                        className='info item right'
                                        style={{ color: item.color }}
                                    >
                                        {item.value}
                                    </div>
                                </div>
                            );
                        }
                    }
                }


                this.setState({ current_info });
            }
        }
        // }
    }
}

export default Info;