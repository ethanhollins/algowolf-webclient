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
                            <div>
                                <div>
                                    <img className='beta-unavailable icon' src={process.env.PUBLIC_URL + this.props.getPopup().image} />
                                </div>
                            </div>
                            <span className='beta-unavailable message'>
                                <span id="sp_bold">LIVE</span> algo trading for this strategy is available to beta testers. Contact <a href="mailto:admin@algowolf.com">admin@algowolf.com</a> to apply for access.
                            </span>
                            <div className="login field">
                                <div id="submit" className="login input" onClick={this.onGotoDemo.bind(this)}>
                                    GOTO DEMO
                                </div>
                            </div>
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