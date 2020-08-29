import React, { Component } from 'react';
import '../Login.css';
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
        'username': '',
        'password': '',
    }

    render()
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

    async componentDidMount()
    {
        const user_id = await this.props.checkAuthorization();
        this.props.setUserId(user_id);
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
        event.preventDefault();
        const reqOptions = {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({
                'username': this.state.username,
                'password': this.state.password
            })
        }
        let res = await fetch(
            `${URI}/login`,
            reqOptions
        );
        
        const status = res.status;
        res = await res.json(); 

        if (status === 200)
        {
            this.props.setUserId(res.user_id);
        }
        else
        {
            this.errorMsg.textContent = res.message;
        }
    }
}

const URI = 'http://127.0.0.1:5000';

export default Login;