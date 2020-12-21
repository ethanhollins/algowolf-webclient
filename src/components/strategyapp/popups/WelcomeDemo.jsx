import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretUp } from '@fortawesome/pro-solid-svg-icons';
import { 
    faArrowCircleUp, faArrowCircleDown, faTimesCircle, faQuestionCircle, faEnvelope,
    faInfoCircle
} from '@fortawesome/pro-regular-svg-icons';

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
                                <p>Welcome to the AlgoWolf demo platform based on Scott Phillip's Holy Grail system!</p>
                                <p>
                                    This demo contains a recent day's backtest results which are determined by our algorithmic systems. 
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
                                    Clicking on the timestamp will set the charts on the main page to that time.
                                </p>
                                <p>
                                    The position sizing is based on a hypothetical $10K (USD) trading bank and a 1% risk.
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
                                    <div className='welcome table-row'>
                                        <div className='welcome table-cell subject'>
                                            <div id="entry_line"></div>
                                        </div>
                                        <div className='welcome table-cell'>Potential Entry Line (<span id='sp_long'>LONG</span> / <span id='sp_short'>SHORT</span>)</div>
                                    </div>
                                    <div className='welcome table-row'>
                                        <div className='welcome table-cell subject'>
                                            <div id="stop_line"></div>
                                        </div>
                                        <div className='welcome table-cell'>Potential Stop Line</div>
                                    </div>
                                    <div className='welcome table-row'>
                                        <div className='welcome table-cell subject'>
                                            <div id="target_line"></div>
                                        </div>
                                        <div className='welcome table-cell'>Potential Target Line</div>
                                    </div>
                                    <div className='welcome table-row'>
                                        <div className='welcome table-cell subject'>
                                            <div id="be_line"></div>
                                        </div>
                                        <div className='welcome table-cell'>Potential 1.1R Breakeven Line (for 2R trades)</div>
                                    </div>
                                    <div className='welcome table-row'>
                                        <div className='welcome table-cell subject'>
                                            <div id="ht_line"></div>
                                        </div>
                                        <div className='welcome table-cell'>High and Tight Line</div>
                                    </div>
                                    <div className='welcome table-row'>
                                        <div className='welcome table-cell subject'>
                                            <div id="sp_square"></div>
                                        </div>
                                        <div className='welcome table-cell'>Pending Order placed.</div>
                                    </div>
                                    <div className='welcome table-row'>
                                        <div className='welcome table-cell subject'>
                                            <div id="sp_circle"></div>
                                        </div>
                                        <div className='welcome table-cell'>Active Trade (<span id='sp_long'>LONG</span> / <span id='sp_short'>SHORT</span>)</div>
                                    </div>
                                </div>
                                <p>
                                    Please Note: Under <FontAwesomeIcon className='welcome message-icon steal-blue_btn' icon={faInfoCircle} /> <span id='sp_bold'>Chart Info</span> 'Pending' denotes a setup has completed and awaiting H&T and CE confirmation.
                                    Once a position is entered, it's no longer tracked under <FontAwesomeIcon className='welcome message-icon steal-blue_btn' icon={faInfoCircle} /> <span id='sp_bold'>Chart Info</span>, but can still be monitored on the candle chart.
                                </p>
                                <p>
                                    Click on <FontAwesomeIcon className='welcome message-icon steal-blue_btn' icon={faEnvelope} /> <span id='sp_bold'>Notify Me</span> to subscribe for email updates.
                                </p>
                                <p>
                                    Click on the <FontAwesomeIcon className='welcome message-icon steal-blue_btn' icon={faQuestionCircle} /> <span id='sp_bold'>Help</span> icon to read this message again.
                                </p>
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