import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocketLaunch } from '@fortawesome/pro-regular-svg-icons';
class SignUpPrompt extends Component
{

    render()
    {
        return(
            <React.Fragment>
            
            {/* <div className='popup header'>
                <span>Sign Up</span>
            </div> */}
            <div className='popup content'>
                <div className='popup main'>
                    <div className='popup main-list'>
                        <div className='sign-up-prompt body'>
                            <div>
                                <div>
                                    <img className='sign-up-prompt icon' src={process.env.PUBLIC_URL + '/holygrail_request_access_icon.jpg'} />
                                </div>
                            </div>
                            {/* <span className='sign-up-prompt message'>
                                Get live trading demos, insights, statistics, daily results and more. 
                                Contact us at <a id="email_link" href="mailto:admin@algowolf.com">admin@algowolf.com</a> to find out more about live trading with your broker and general info.
                            </span> */}
                            <span className='sign-up-prompt message'>
                            As a subscriber to Scott Phillips trading course <br/>you have been granted exclusive use of the<br/><span id="sp_bold">Prison Paycheck Algorithmic Demo & Training Platform</span> (aka Holy Grail).
                            </span>
                            <div className='sign-up-prompt column'>
                                <div className="login field">
                                    <div id="submit" className="login input" onClick={this.onSignUp.bind(this)}>
                                        SIGN UP
                                    </div>
                                </div>
                                <div className='sign-up-prompt message'>
                                    OR
                                </div>
                                <div className='sign-up-prompt message'>
                                    <a href={this.getDemoLoginUrl()}>Sign in with an existing account</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            </React.Fragment>
        );
    }

    getDemoRegisterUrl = () =>
    {
        const { REACT_APP_FRONT_BASE_URL, REACT_APP_APP_BASE_URL } = process.env;
        return REACT_APP_FRONT_BASE_URL + "/register?redirect=" + encodeURIComponent(REACT_APP_APP_BASE_URL + "/holygrail/demo");
    }

    getDemoLoginUrl = () =>
    {
        const { REACT_APP_FRONT_BASE_URL, REACT_APP_APP_BASE_URL } = process.env;
        return REACT_APP_FRONT_BASE_URL + "/login?redirect=" + encodeURIComponent(REACT_APP_APP_BASE_URL + "/holygrail/demo");
    }

    onSignUp(e)
    {
        window.location.href = this.getDemoRegisterUrl();
    }

}

export default SignUpPrompt;