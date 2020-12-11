import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretUp } from '@fortawesome/pro-solid-svg-icons';
import { faArrowCircleUp, faArrowCircleDown, faTimesCircle, faQuestionCircle } from '@fortawesome/pro-regular-svg-icons';

class WelcomeDemo extends Component
{

    render()
    {
        return(
            <React.Fragment>
            
            <div className='popup header'>
                <span>Welcome!</span>
            </div>
            <div className='popup content'>
                <div className='popup main'>
                    <div className='popup main-list'>
                        <div className='welcome body'>
                            <div className='welcome message'>
                                <p>Welcome to the AlgoWolf demo platform hosting Scott Phillip's Holy Grail system!</p>
                                <p>
                                    This demo contains the previous day's backtest results which are determined by our algorithmic systems. 
                                    These results are indicitive of the live signals the trading system will produce.
                                </p>
                                <h2>Here's how to use it.</h2>
                                <p>On our charts you will find icons and text drawn. Please refer to the legend below to see what they all mean.</p>
                                <p>
                                    You can click on the candlesticks to change the time of the backtest. 
                                    When you do this only the events that happened before that candlestick will appear.
                                    This will also show, on the chart, any pending orders that have been placed or positions that have been entered.
                                    You can use the arrow keys as well to step the backtest forward bar by bar on any of the charts.
                                </p>
                                <p>
                                    At the bottom of the page you will see a yellow bar and a grey one.
                                    These are separate pages you can switch between. If you click on the second page, you will find a spreadsheet of the backtest's "System Results" for that session.
                                </p>
                                <h2>Legend</h2>
                                <div className='welcome table'>
                                    <div className='welcome table-row'>
                                        <div className='welcome table-cell subject' id='sp_rtv'>RTV</div>
                                        <div className='welcome table-cell'>Pending RTV order.</div>
                                    </div>
                                    <div className='welcome table-row'>
                                        <div className='welcome table-cell subject' id='sp_rtc'>RTC</div>
                                        <div className='welcome table-cell'>Pending RTC order.</div>
                                    </div>
                                    <div className='welcome table-row'>
                                        <div className='welcome table-cell subject' id='sp_dv'>DV</div>
                                        <div className='welcome table-cell'>Pending Decreasing Volatility order.</div>
                                    </div>
                                    <div className='welcome table-row'>
                                        <div className='welcome table-cell subject' id='sp_dv'>DV On</div>
                                        <div className='welcome table-cell'>Decreasing Volatility turned on.</div>
                                    </div>
                                    <div className='welcome table-row'>
                                        <div className='welcome table-cell subject' id='sp_dv'>DV Off</div>
                                        <div className='welcome table-cell'>Decreasing Volatility turned off.</div>
                                    </div>
                                    <div className='welcome table-row'>
                                        <div className='welcome table-cell subject' id='sp_b'>B</div>
                                        <div className='welcome table-cell'>Bollinger Touch confirmed.</div>
                                    </div>
                                    <div className='welcome table-row'>
                                        <div className='welcome table-cell subject' id='sp_t'>T</div>
                                        <div className='welcome table-cell'>Trend with Pullback confirmed.</div>
                                    </div>
                                    <div className='welcome table-row'>
                                        <div className='welcome table-cell subject' id='sp_w'>W</div>
                                        <div className='welcome table-cell'>Bollinger Walk confirmed.</div>
                                    </div>
                                    <div className='welcome table-row'>
                                        <div className='welcome table-cell subject' id='sp_long'>
                                            <FontAwesomeIcon className='welcome message-icon' icon={faArrowCircleUp} />
                                        </div>
                                        <div className='welcome table-cell'>Long position entered.</div>
                                    </div>
                                    <div className='welcome table-row'>
                                        <div className='welcome table-cell subject' id='sp_short'>
                                            <FontAwesomeIcon className='welcome message-icon' icon={faArrowCircleDown} />
                                        </div>
                                        <div className='welcome table-cell'>Short position entered.</div>
                                    </div>
                                    <div className='welcome table-row'>
                                        <div className='welcome table-cell subject' id='sp_trend'>
                                            <FontAwesomeIcon className='welcome message-icon' icon={faCaretUp} />
                                        </div>
                                        <div className='welcome table-cell'>Trend On.</div>
                                    </div>
                                    <div className='welcome table-row'>
                                        <div className='welcome table-cell subject' id='sp_trend'>
                                            <FontAwesomeIcon className='welcome message-icon' icon={faTimesCircle} />
                                        </div>
                                        <div className='welcome table-cell'>Trend Off.</div>
                                    </div>
                                </div>
                                <p>Click on the <FontAwesomeIcon className='welcome message-icon steal-blue_btn' icon={faQuestionCircle} /> icon to read this message again.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            </React.Fragment>
        );
    }

    getBarsItems()
    {
        return
    }

    getChartItems()
    {
        return
    }

    getTradingItems()
    {
        return
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
}

export default WelcomeDemo;