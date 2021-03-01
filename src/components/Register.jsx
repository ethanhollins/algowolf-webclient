import React, { Component } from 'react';
import { ReactSVG } from 'react-svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser, faLock, faEnvelope
} from '@fortawesome/pro-regular-svg-icons';
import { withRouter } from 'react-router-dom';

class Register extends Component
{
    constructor(props)
    {
        super(props);

        this.setFirstNameRef = elem => {
            this.firstName = elem;
        }
        this.setLastNameRef = elem => {
            this.lastName = elem;
        }
        this.setEmailRef = elem => {
            this.email = elem;
        }
        this.setPasswordRef = elem => {
            this.password = elem;
        }
        this.setConfirmPasswordRef = elem => {
            this.confirmPassword = elem;
        }
        this.setErrorMsgRef = elem => {
            this.errorMsg = elem;
        }
    }

    state = {
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirm_password: '',
        notify_me: true
    }

    async componentDidMount()
    {
        console.log(this.props.history.location.search);
    }

    render()
    {
        return (
            <div className="register container">
                <div>
                    <a className='login logo' id='register_logo' href='/'>
                        <ReactSVG src={process.env.PUBLIC_URL + "/algowolf.svg"} />
                    </a>
                    <form className="login form" onSubmit={this.handleSubmit.bind(this)}>
                        <div className="login header">
                            Sign Up
                        </div>

                        <div className="login field">
                            <div className="login field-header">Name</div>
                            <div className="login input-group">
                                <input 
                                    ref={this.setFirstNameRef}
                                    type="text" className="login input" 
                                    name="first_name" id="first_name" 
                                    placeholder="First Name"
                                    autoComplete="given-name" required 
                                    onChange={this.handleChange} 
                                />
                                <input 
                                    ref={this.setLastNameRef}
                                    type="text" className="login input" 
                                    name="last_name" id="last_name" 
                                    placeholder="Last Name"
                                    autoComplete="family-name" required 
                                    onChange={this.handleChange} 
                                />
                            </div>
                        </div>
    
                        <div className="login field">
                            <div className="login field-header">Email</div>
                            <div className="login input-parent">
                                <input 
                                    ref={this.setEmailRef}
                                    type="email" className="login input" 
                                    name="email" id="email" 
                                    placeholder="Email"
                                    required onChange={this.handleChange} 
                                />
                                <span className='login icon' id="email_icon">
                                    <FontAwesomeIcon icon={faEnvelope} />
                                </span>
                            </div>
                        </div>

                        <div className="login field">
                            <div className="login field-header">Password</div>
                            <div className="login input-parent">
                                <input 
                                    ref={this.setPasswordRef}
                                    type="password" className="login input" 
                                    name="password" id="password" 
                                    placeholder="Password"
                                    required onChange={this.handleChange} 
                                />
                                <span className='login icon'>
                                    <FontAwesomeIcon icon={faLock} />
                                </span>
                            </div>
                        </div>

                        <div className="login field">
                            <div className="login field-header">Confirm Password</div>
                            <div className="login input-parent">
                                <input 
                                    ref={this.setConfirmPasswordRef}
                                    type="password" className="login input" 
                                    name="confirm_password" id="password" 
                                    placeholder="Confirm Password"
                                    required onChange={this.handleChange} 
                                />
                                <span className='login icon'>
                                    <FontAwesomeIcon icon={faLock} />
                                </span>
                            </div>
                        </div>

                        <div className="login horiz field">
                            <label className='login checkbox'>
                                <input 
                                    type='checkbox' 
                                    defaultChecked={true}
                                    onChange={this.onCheckboxInputChange.bind(this)}
                                />
                                <div className='login checkmark'></div>
                            </label>
                            <div className="login small-text">Notify me by email about AlgoWolf updates.</div>
                        </div>
    
                        {/* <div className="login field">
                            <span className="login small-text">
                                By continuing you indicate that you have read and agree to AlgoWolf's <a href="/terms-of-service" target="_blank">Terms of Service</a> and <a href="/privacy-policy" target="_blank">Privacy Policy</a>
                            </span>
                        </div> */}

                        <div className="login field">
                            <input type="submit" id="submit" className="login input" value="SIGN UP"/>
                        </div>
    
                        <div className="login field center">
                            <span className='error' ref={this.setErrorMsgRef}></span>
                        </div>

                    </form>
                </div>

            </div>
        )
    }

    onCheckboxInputChange(e)
    {
        let { notify_me } = this.state;
        notify_me = e.target.checked;
        this.setState({ notify_me });
    }

    handleChange = (event) =>
    {
        let { first_name, last_name, email, password, confirm_password } = this.state;
        if (event.target.name === 'first_name')
        {
            first_name = event.target.value;
        }
        else if (event.target.name === 'last_name')
        {
            last_name = event.target.value;
        }
        else if (event.target.name === 'email')
        {
            email = event.target.value.toLowerCase();
        }
        else if (event.target.name === 'password')
        {
            password = event.target.value;
        }
        else if (event.target.name === 'confirm_password')
        {
            confirm_password = event.target.value;
        }
        this.setState({ first_name, last_name, email, password, confirm_password });
    }

    resetErrors()
    {
        this.firstName.style.borderColor = 'rgb(220,220,220)';
        this.firstName.style.borderWidth = '1px';
        this.lastName.style.borderColor = 'rgb(220,220,220)';
        this.lastName.style.borderWidth = '1px';
        this.email.style.borderColor = 'rgb(220,220,220)';
        this.email.style.borderWidth = '1px';
        this.password.style.borderColor = 'rgb(220,220,220)';
        this.password.style.borderWidth = '1px';
        this.confirmPassword.style.borderColor = 'rgb(220,220,220)';
        this.confirmPassword.style.borderWidth = '1px';
        this.errorMsg.textContent = "";
    }

    async handleSubmit(event)
    {
        this.resetErrors();
    
        const { first_name, last_name, email, password, confirm_password, notify_me } = this.state;
        const { REACT_APP_API_URL } = process.env;
        event.preventDefault();

        if (!this.validateEmail(email))
        {
            this.errorMsg.textContent = "Invalid email.";
            this.email.style['borderColor'] = '#e74c3c';
            this.email.style['borderWidth'] = '2px';

            this.confirmPassword.value = '';
        }
        else if (!this.passwordStrengthCheck(password))
        {
            this.errorMsg.textContent = "Password isn't strong enough.";
            this.password.style['borderColor'] = '#e74c3c';
            this.password.style['borderWidth'] = '2px';

            this.password.value = '';
            this.confirmPassword.value = '';
        }
        else if (password !== confirm_password)
        {
            this.errorMsg.textContent = "Passwords do not match.";
            this.password.style['borderColor'] = '#e74c3c';
            this.password.style['borderWidth'] = '2px';
            this.confirmPassword.style['borderColor'] = '#e74c3c';
            this.confirmPassword.style['borderWidth'] = '2px';

            this.confirmPassword.value = '';
        }
        else
        {
            const raw = JSON.stringify({
                'first_name': first_name,
                'last_name': last_name,
                'email': email,
                'password': password,
                'notify_me': notify_me
            });

            var requestOptions = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include',
                body: raw
            };
    
            const res = await fetch(`${REACT_APP_API_URL}/register`, requestOptions);
    
            const status = res.status;
            const data = await res.json();
    
            if (status === 200)
            {
                this.props.getCookies().remove('Authorization');
                this.props.setUserId(null);
                if (this.props.history.location.search)
                {
                    this.props.history.push('/login' + this.props.history.location.search);
                }
                else
                {
                    this.props.history.push('/login');
                }
            }
            else
            {
                this.errorMsg.textContent = data.message;
            }
        }
    }

    validateEmail(email) 
    {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
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
}

export default withRouter(Register);