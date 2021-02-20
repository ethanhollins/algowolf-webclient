import React, { Component } from 'react';
import { ReactSVG } from 'react-svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser, faLock, faEnvelope
} from '@fortawesome/pro-regular-svg-icons';

class Register extends Component
{
    constructor(props)
    {
        super(props);

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
        loginCheck: false

    }

    async componentDidMount()
    {
    }

    render()
    {
        return (
            <div className="login container">
                <div>
                    <a className='login logo' href='/'>
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
                                    type="text" className="login input" 
                                    name="first_name" id="first_name" 
                                    placeholder="First Name"
                                    autoComplete="given-name" required 
                                    onChange={this.handleChange} 
                                />
                                <input 
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

    handleChange = (event) =>
    {
        let { username, password } = this.state;
        if (event.target.name === 'username')
        {
            username = event.target.value.toLowerCase();
        }
        else if (event.target.name === 'password')
        {
            password = event.target.value;
        }
        this.setState({ username, password });
    }

    async handleSubmit(event)
    {
        const { REACT_APP_API_URL } = process.env;
        event.preventDefault();
        const raw = JSON.stringify({
            'username': this.state.username,
            'password': this.state.password
        });
        var requestOptions = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include',
            body: raw
        };

        const res = await fetch(`${REACT_APP_API_URL}/login`, requestOptions);

        const status = res.status;
        const data = await res.json();

        if (status === 200)
        {
            console.log(data);
            this.props.getCookies().set('Authorization', data.token, {
                path: '/'
            })
            this.props.setUserId(data.user_id);
        }
        else
        {
            this.errorMsg.textContent = data.message;
        }
    }
}

export default Register;