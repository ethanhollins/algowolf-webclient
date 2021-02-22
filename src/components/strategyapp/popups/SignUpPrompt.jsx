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
                                    <FontAwesomeIcon icon={faRocketLaunch} className='sign-up-prompt icon' />
                                </div>
                                <div className='sign-up-prompt header'>
                                    Sign Up for FREE to access the demo platform
                                </div>
                            </div>
                            <div className='sign-up-prompt message'>
                                Get live trading demos, insights, statistics, daily results and more. 
                                Contact us at admin@algowolf.com to find out more about live trading with your broker and general info.
                            </div>
                            <div className="login field">
                                <div id="submit" className="login input" onClick={this.onSignUp.bind(this)}>
                                    SIGN UP
                                </div>
                            </div>
                            <div className='sign-up-prompt message'>
                                OR <a href='/login?redirect=demo'>Sign in with an existing account</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            </React.Fragment>
        );
    }

    onSignUp(e)
    {
        this.props.history.push('/register?redirect=demo');
    }

}

export default SignUpPrompt;