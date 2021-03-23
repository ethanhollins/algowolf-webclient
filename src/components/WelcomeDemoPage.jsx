import React, { Component } from 'react';
import { ReactSVG } from 'react-svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretUp } from '@fortawesome/pro-solid-svg-icons';
import { 
    faArrowAltCircleRight, faArrowCircleUp, faArrowCircleDown, faTimesCircle, faQuestionCircle, faEnvelope,
    faInfoCircle
} from '@fortawesome/pro-regular-svg-icons';
import WelcomeDemo from './strategyapp/popups/WelcomeDemo';

class WelcomeDemoPage extends Component
{
    render()
    {
        return (
            <React.Fragment>

            <nav>
                <div className='account-settings nav-group'>
                    <a className='account-settings logo' href='/'>
                        <ReactSVG src={process.env.PUBLIC_URL + "/algowolf.svg"} />
                    </a>
                    <div>
                        <div className='account-settings header'>Welcome to the Prison Paycheck Demo</div>
                    </div>
                </div>
                <div className='account-settings nav-group'>
                    <a className='account-settings btn' href='/holygrail/demo'>
                        <FontAwesomeIcon className='account-settings icon' icon={faArrowAltCircleRight} />
                        <span>Goto Demo</span>
                    </a>
                </div>
            </nav>

            <div className='account-settings container'>
                <div className='invite main'>

                    <div className="account-settings field">

                        <div className='welcome-demo-page icon'>
                            <a href='/holygrail/demo'><img src={process.env.PUBLIC_URL + '/welcome_demo.png'} /></a>
                        </div>
                    </div>

                    <div className="account-settings field">
                        <div className='popup content'>
                            <div className='popup main'>
                                <div className='popup main-list'>
                                    <div className='welcome body'>
                                        <div className='welcome message'>

                                            <p id='sp_header'>
                                                <span id="sp_bold">WELCOME to the Prison Paycheck Algorithmic Demo & Training Platform</span> (aka Holy Grail)
                                            </p>

                                            <p>
                                                Developed by <span id="sp_bold">AlgoWolf</span>, this state of the art algorithmic Demo & Training Platform is exclusively for subscribers of Scott Phillip’s “Prison Paycheck” trading strategy.
                                            </p>

                                            <p>
                                                You'll find this an invaluable aid to your comprehension of the Prison Paycheck strategy and to your ultimate trading success.
                                            </p>

                                            {/* <h2 id="sp_blue">You Get</h2> */}
                                            <img className='welcome header-img'src={process.env.PUBLIC_URL + '/what_you_get.png'} />

                                            <p>
                                                <ul className='welcome circle-list'>
                                                    <li>The Latest Daily Trading Results</li>
                                                    <li>A Walkthrough of Each Day's Trading Setups With Pin Point Accuracy</li>
                                                    <li>Backtest Results Over Previous Months</li>
                                                    <li>The Previous Day’s Trading Session's Charts & Backtest Results Posted Daily So You Can Easily Follow Or Learn The Various RTV, RTC & DV Trading Setups.</li>
                                                    <li>Interactive Charts Showing You Step By Step How and Why Each Trade Is Entered & When Trend or DV Mode Is Switched On or Off</li>
                                                    <li>Shows the 5 & 10 Minute Confirming Evidence Is For Each Trade</li>
                                                    <li>See Exactly Where Entry, Stop, High & Tight and Targets etc. are Placed</li>
                                                    <li>Strategy Insights And More!</li>
                                                </ul>
                                            </p>

                                            <img className='welcome header-img'src={process.env.PUBLIC_URL + '/to_get_started.png'} />
                                            {/* <h2 id="sp_blue">To GET STARTED</h2> */}

                                            <p>
                                                Simply Sign In <span id="sp_bold"><a href='/login?redirect=holygrail%2Fdemo'>HERE</a></span> to open a FREE account with <span id="sp_bold">AlgoWolf</span> then click the “<span id="sp_bold">REQUEST ACCESS</span>”  button to proceed.<br/>
                                            </p>

                                            <p>
                                                Once there be sure to click on <FontAwesomeIcon className='welcome message-icon' icon={faQuestionCircle} /> <span id='sp_bold'>Help</span> to become acquainted with how the charts work.
                                            </p>

                                            <p>
                                                <span id="sp_bold">PLEASE NOTE:</span> Fully automated <span id="sp_bold">LIVE</span> trading of this strategy is currently only available for Beta testers.<br/>If you wish to participate in these tests please drop us a line at <span id="sp_bold"><a id="email_link" href="mailto:admin@algowolf.com">admin@algowolf.com</a></span> 
                                            </p>

                                            <p className='welcome footer'>
                                               <span id="sp_header">Wishing You the Very Best of Success,</span>
                                            </p>

                                            <p>
                                                <span id="sp_header">The AlgoWolf Team</span>
                                            </p>
                                            
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    
                </div>
            </div>

            </React.Fragment>
        );
    }

}

export default WelcomeDemoPage;