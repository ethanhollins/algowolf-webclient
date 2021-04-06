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
                <span>Chart Instructions</span>
            </div>
            <div className='popup content'>
                <div className='popup main'>
                    <div className='popup main-list'>
                        <div className='welcome body'>
                            <div className='welcome message'>
                                <p>Welcome to the AlgoWolf automated platform.</p>
                                <p>
                                    Our algorithms can be used to generate precise trading signals and are fully automated through your broker's platform.
                                </p>
                                <h2>Here's how to use it.</h2>
                                <p>On our charts you will find icons and text drawn. Please refer to the legend below to see what they all mean.</p>
                                <p>
                                    The “Chart Info” panel shows information pertaining to either the 2m, 5m or 10m chart you click on.
                                </p>
                                <p>
                                    ‘Hovering’ your mouse (crosshairs) over a bar allows you to see information about setups at that time in “Chart Info” 
                                </p>
                                <p>
                                    ‘Clicking’ on a candlestick on the 2min chart allows you to view detailed drawings on the chart about any setups, pending orders or positions that were placed or entered at that time and to see where the Entry, Stop , H&T and Target lines were placed for that setup.
                                </p>
                                <p>
                                    Clicking on a candle will ‘grey’ out all future bars so that only the drawings and information of the current setup are seen. Clicking anywhere on a blank part of the chart restores all the candles.
                                </p>
                                <p>
                                    Clicking on a candle also ‘locks’ the “Chart Info” panel to that time in case you need to scroll down that panel to see information that is off screen
                                </p>
                                <p>
                                    Use the arrow keys to step ‘forward’ or ‘back’ bar by bar on any of the charts.
                                </p>
                                <p>
                                    At the bottom of the screen you will see separate pages you can switch between.
                                    On the second page, you will find the spreadsheet results of the backtest for that session.
                                    Clicking on the timestamp will set the charts on the main page to that time.
                                    Click back on the Main page to see that trade setup.
                                </p>
                                <p>
                                    The green/red vertical lines denote the start and finish of the trading session based on New York time 0300 - 0800.
                                </p>
                                <p>
                                    <span id='sp_bold'>Please Note:</span> Under <FontAwesomeIcon className='welcome message-icon steal-blue_btn' icon={faInfoCircle} /> <span className='steal-blue_btn' id='sp_bold'>Chart Info</span>, 'Pending' denotes a setup has commenced but still awaiting either H&T, CE or H/SS confirmation.
                                    Once a position is entered, it's no longer tracked under <FontAwesomeIcon className='welcome message-icon steal-blue_btn' icon={faInfoCircle} /> <span className='steal-blue_btn' id='sp_bold'>Chart Info</span>, but can still be monitored on the candle chart.
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
                                        <div className='welcome table-cell'>Potential Target Line (1.1R or 2R as applicable)</div>
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
                                    Please send any enquires to <a href="mailto:admin@algowolf.com"><span id='sp_bold'>admin@algowolf.com</span></a>
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