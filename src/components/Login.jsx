import React, { Component } from 'react';
import { ReactSVG } from 'react-svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser, faLock
} from '@fortawesome/pro-solid-svg-icons';

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
        username: '',
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
                    <form className="login form" onSubmit={this.handleSubmit.bind(this)}>
                        <a className='login logo' href='/'>
                            <ReactSVG src="./algowolf.svg" />
                        </a>
    
                        <div className="login field">
                            <input 
                                type="text" className="login input" 
                                name="username" id="username" 
                                placeholder="Username"
                                autoComplete="username" required 
                                onChange={this.handleChange} 
                            />
                            <span className='login icon'>
                                <FontAwesomeIcon icon={faUser} />
                            </span>
                        </div>
    
                        <div className="login field">
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
    
                        <div className="login field">
                            <input type="submit" id="submit" className="login input" value="LOGIN"/>
                        </div>
    
                        <div className="login field center">
                            <span>Forgot <a href='/login#'>Username/Password</a>?</span>
                        </div>
    
                        <div className="login field center">
                            <span className='error' ref={this.setErrorMsgRef}></span>
                        </div>
                    </form>
                    {/* <span>Create an Account</span> */}
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

export default Login;