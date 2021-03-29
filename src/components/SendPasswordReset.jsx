import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faArrowAltCircleRight, faEnvelope, faSignOut
} from '@fortawesome/pro-regular-svg-icons';

class SendPasswordReset extends Component
{
    constructor(props)
    {
        super(props);

        this.setEmailRef = elem => {
            this.email = elem;
        }

        this.setEmailMsgRef = elem => {
            this.emailMsg = elem;
        }
        
    }

    state = {
        email: ''
    }

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
                            <div className='account-settings header'>Reset Your Password</div>
                        </div>
                    </div>
                    <div className='account-settings nav-group'>
                        <a className='account-settings btn' href='/app'>
                            <FontAwesomeIcon className='account-settings icon' icon={faArrowAltCircleRight} />
                            <span>Goto App</span>
                        </a>
                    </div>
                </nav>
    
                <div className='account-settings container'>
                    <div className='account-settings main'>
                    <div className="account-settings field-header">Enter your email address</div>
                        <div className="account-settings sub-field">
                            <div className="login input-parent">
                                <input 
                                    ref={this.setEmailRef}
                                    type="email" className="account-settings input" 
                                    name="email" id="email" 
                                    placeholder="Email"
                                    required onChange={this.handleChange} 
                                />
                                <span className='login icon' id="email_icon">
                                    <FontAwesomeIcon icon={faEnvelope} />
                                </span>
                            </div>
                        </div>
                        <div className="account-settings sub-field">
                            <span 
                                className="account-settings link-text"
                                name='email'
                                onClick={this.onSend.bind(this)}
                            >
                                Send Reset
                            </span>
                        </div>
                        <div className="account-settings sub-field">
                            <span
                                ref={this.setEmailMsgRef}
                                className="account-settings error-text"
                            />
                        </div>
                    </div>
                </div>
    
                </React.Fragment>
        );
    }

    async onSend(e)
    {
        const { REACT_APP_API_URL } = process.env;
        const { email } = this.state;

        const reqOptions = {
            method: 'POST',
            headers: this.props.getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ email: email })
        }

        const res = await fetch(
            `${REACT_APP_API_URL}/v1/reset-password/send`,
            reqOptions
        );
         
        console.log(res);
        console.log(res.status);

        if (res.status === 200)
        {
            this.emailMsg.textContent = 'Successfully sent password reset email.';
            this.emailMsg.style.color = '#2ecc71';
            this.emailMsg.style.fontWeight = '500';
            return true;
        }
        else
        {
            this.emailMsg.textContent = 'Failed to send password reset email. Please make sure you are entering the same email as you signed up with.';
            this.emailMsg.style.color = '#e74c3c';
            this.emailMsg.style.fontWeight = '500';
            return false;
        }
    }

    handleChange = (e) => 
    {
        let { email } = this.state;
        email = e.target.value.toLowerCase();
        this.setState({ email });
    }

}

export default withRouter(SendPasswordReset);