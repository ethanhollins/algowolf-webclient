import React, { Component } from 'react';
import { ReactSVG } from 'react-svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser, faLock, faEnvelope
} from '@fortawesome/pro-regular-svg-icons';

class Login extends Component
{
    constructor(props)
    {
        super(props);

        this.setErrorMsgRef = elem => {
            this.errorMsg = elem;
        }
    }

    state = {
        email: '',
        password: '',
        loginCheck: false

    }

    async componentDidMount()
    {
        let { loginCheck } = this.state;
        const user_id = await this.props.checkAuthorization();
        console.log(user_id);
        if (user_id === null)
        {
            loginCheck = true;
            this.setState({ loginCheck });
        }
    }

    render()
    {
        const { loginCheck } = this.state;
        if (loginCheck)
        {
            return (
                <div className="login container">
                    <div>
                        <a className='login logo' href='/'>
                            <ReactSVG src={process.env.PUBLIC_URL + "/algowolf.svg"} />
                        </a>
                        <form className="login form" onSubmit={this.handleSubmit.bind(this)}>
                            <div className="login header">
                                Sign In
                            </div>

                            <div className="login field">
                                <div className="login field-header">Email</div>
                                <div className="login input-parent">
                                    <input 
                                        type="text" className="login input" 
                                        name="email" id="email" 
                                        placeholder="Email"
                                        autoComplete="email" required 
                                        onChange={this.handleChange} 
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
                                <input type="submit" id="submit" className="login input" value="SIGN IN"/>
                            </div>
        
                            <div className="login field center">
                                <span>Forgot <a href='/login#'>Username/Password</a>?</span>
                            </div>
        
                            <div className="login field center">
                                <span className='error' ref={this.setErrorMsgRef}></span>
                            </div>

                        </form>
                        <div className="login field create-account">
                            <span><a href='/register'>Create a free account</a> to get started with AlgoWolf</span>
                        </div>
                    </div>

                </div>
            )
        }
        else
        {
            return <React.Fragment />;
        }
    }

    handleChange = (event) =>
    {
        let { email, password } = this.state;
        if (event.target.name === 'email')
        {
            email = event.target.value.toLowerCase();
        }
        else if (event.target.name === 'password')
        {
            password = event.target.value;
        }
        this.setState({ email, password });
    }

    async handleSubmit(event)
    {
        const { REACT_APP_API_URL } = process.env;
        event.preventDefault();
        const raw = JSON.stringify({
            'username': this.state.email,
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

export default Login;