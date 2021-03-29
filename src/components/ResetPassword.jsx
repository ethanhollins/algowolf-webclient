import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faArrowAltCircleRight, faLock
} from '@fortawesome/pro-regular-svg-icons';

class ResetPassword extends Component
{
    constructor(props)
    {
        super(props);

        this.setNewPasswordRef = elem => {
            this.newPasswordElem = elem;
        }
        this.setConfirmPasswordRef = elem => {
            this.confirmPasswordElem = elem;
        }

        this.setMsgRef = elem => {
            this.msg = elem;
        }
        
    }

    state = {
        new_password: '',
        confirm_password: ''
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
                        <a className='account-settings btn' href='/login'>
                            <FontAwesomeIcon className='account-settings icon' icon={faArrowAltCircleRight} />
                            <span>Login</span>
                        </a>
                    </div>
                </nav>
    
                <div className='account-settings container'>
                    <div className='account-settings main'>
                    <div className="account-settings field-header">Enter your new password</div>
                        <div className="login input-parent">
                            <input 
                                ref={this.setNewPasswordRef}
                                type="password" className="account-settings input" 
                                name="new_password" id="new_password" 
                                placeholder="New Password"
                                required onChange={this.handleChange} 
                            />
                            <span className='login icon'>
                                <FontAwesomeIcon icon={faLock} />
                            </span>
                        </div>
                        <div className="login input-parent">
                            <input 
                                ref={this.setConfirmPasswordRef}
                                type="password" className="account-settings input" 
                                name="confirm_password" id="confirm_password" 
                                placeholder="Confirm New Password"
                                required onChange={this.handleChange} 
                            />
                            <span className='login icon'>
                                <FontAwesomeIcon icon={faLock} />
                            </span>
                        </div>
                        <div className="account-settings sub-field">
                            <span 
                                className="account-settings link-text"
                                name='email'
                                onClick={this.onSetPassword.bind(this)}
                            >
                                Set Password
                            </span>
                        </div>
                        <div className="account-settings sub-field">
                            <span
                                ref={this.setMsgRef}
                                className="account-settings error-text"
                            />
                        </div>
                    </div>
                </div>
    
                </React.Fragment>
        );
    }

    async onSend(body)
    {
        const { REACT_APP_API_URL } = process.env;

        const reqOptions = {
            method: 'POST',
            headers: this.props.getHeaders(),
            credentials: 'include',
            body: JSON.stringify(body)
        }

        const queryString = this.props.location.search;
        const res = await fetch(
            `${REACT_APP_API_URL}/v1/reset-password` + queryString,
            reqOptions
        );
         
        console.log(res);
        console.log(res.status);

        if (res.status === 200)
        {
            this.msg.textContent = 'Successfully set new password.';
            this.msg.style.color = '#2ecc71';
            this.msg.style.fontWeight = '500';
            return true;
        }
        else
        {
            this.msg.textContent = 'Failed to set new password.';
            this.msg.style.color = '#e74c3c';
            this.msg.style.fontWeight = '500';
            return false;
        }
    }

    async onSetPassword(e)
    {
        this.newPasswordElem.style.borderColor = 'rgb(220,220,220)';
        this.newPasswordElem.style.borderWidth = '1px';
        this.confirmPasswordElem.style.borderColor = 'rgb(220,220,220)';
        this.confirmPasswordElem.style.borderWidth = '1px';

        let { new_password, confirm_password } = this.state;

        if (this.passwordStrengthCheck(new_password))
        {
            if (new_password === confirm_password)
            {
                await this.onSend({
                    password: new_password
                });
            }
            else
            {
                this.newPasswordElem.value = '';
                this.newPasswordElem.style.borderColor = '#e74c3c';
                this.newPasswordElem.style.borderWidth = '2px';
                this.confirmPasswordElem.value = '';
                this.confirmPasswordElem.style.borderColor = '#e74c3c';
                this.confirmPasswordElem.style.borderWidth = '2px';
                this.msg.textContent = 'Passwords do not match.';
            }
        }
        else
        {
            this.confirmPasswordElem.value = '';
            this.newPasswordElem.value = '';
            this.newPasswordElem.style.borderColor = '#e74c3c';
            this.newPasswordElem.style.borderWidth = '2px';
            this.msg.textContent = 'New password not strong enough.';
        }
        
        new_password = '';
        confirm_password = '';
        this.setState({ new_password, confirm_password });
    }

    passwordStrengthCheck(password) {
        var strongRegex = new RegExp("^(?=.{14,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$", "g");
        var mediumRegex = new RegExp("^(?=.{10,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$", "g");
        var enoughRegex = new RegExp("(?=.{8,}).*", "g");

        if (password.length == 0) 
        {
            // Type password
            return false;
        } 
        else if (false == enoughRegex.test(password)) 
        {
            // More Characters
            return false;
        } 
        else if (strongRegex.test(password)) 
        {
            // Strong
            return true;
        } 
        else if (mediumRegex.test(password)) 
        {
            // Medium
            return true;
        } 
        else 
        {
            // Weak
            return true;
        }
    }

    handleChange = (e) => 
    {
        const name = e.target.getAttribute('name');
        let { new_password, confirm_password } = this.state;

        if (name === 'new_password')
        {
            new_password = e.target.value;
        }
        else if (name === 'confirm_password')
        {
            confirm_password = e.target.value;
        }

        this.setState({ new_password, confirm_password });
    }

}

export default withRouter(ResetPassword);