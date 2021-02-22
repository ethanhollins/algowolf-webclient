import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUnlockAlt } from '@fortawesome/pro-regular-svg-icons';
class BetaUnavailable extends Component
{

    render()
    {
        return(
            <React.Fragment>
            
            {/* <div className='popup header'>
                <span>Join Closed Beta</span>
            </div> */}
            <div className='popup content'>
                <div className='popup main'>
                    <div className='popup main-list'>
                        <div className='beta-unavailable body'>
                            {/* <div className='beta-unavailable message'>
                                Live trading is currently closed to beta testers. Contact admin@algowolf.com to request access.
                            </div>
                            <div>
                                <FontAwesomeIcon icon={faUnlockAlt} className='beta-unavailable icon' />
                            </div> */}

                            <div>
                                <div>
                                    <FontAwesomeIcon icon={faUnlockAlt} className='beta-unavailable icon' />
                                </div>
                                <div className='beta-unavailable header'>
                                    Join the Closed Beta
                                </div>
                            </div>
                            <div className='beta-unavailable message'>
                                Live trading is currently only available to beta testers. Contact admin@algowolf.com to apply for access.
                            </div>
                            {this.generateGotoDemoBtn()}
                        </div>
                    </div>
                </div>
            </div>

            </React.Fragment>
        );
    }

    generateGotoDemoBtn()
    {
        if (!this.props.isDemo)
        {
            return (
                <div className="login field">
                    <div id="submit" className="login input" onClick={this.onGotoDemo.bind(this)}>
                        GOTO DEMO
                    </div>
                </div>
            );
        }
    }

    onGotoDemo(e)
    {
        window.location = '/holygrail/demo';
    }
}

export default BetaUnavailable;