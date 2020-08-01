import React, { Component } from 'react';
import Cookies from 'universal-cookie';
import '../Login.css';

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
            <div className="login-ui">
                <form className="login-form" onSubmit={this.handleSubmit.bind(this)}>
                    <div className="login-field login-logo">
                        <img id="logo_head" alt="" src={'./brokerlib_logo_brown.png'}/>
                        {/* <h3 id="logo_head_text">Brokerlib</h3> */}
                    </div>

                    <div className="login-field">
                        <label htmlFor="username" className='login-label'>Username</label>
                        <input type="text" className="login-input" name="username" id="username" autoComplete="off" required onChange={this.handleChange} />
                    </div>

                    <div className="login-field">
                        <label htmlFor="password" className='login-label'>Password</label>
                        <input type="password" className="login-input" name="password" id="password" required onChange={this.handleChange} />
                    </div>

                    <div className="login-field">
                        <input type="submit" className="login-input" value="Login"/>
                        <p ref={this.setErrorMsgRef} className="login-msg" ></p>
                    </div>
                </form>
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
        event.preventDefault();
        const reqOptions = {
            method: 'POST',
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
            let token = res.token;
            console.log(token);
            const cookies = new Cookies();
            cookies.set('token', {
                'username': this.state.username,
                'token': token
            }, {path: '/'});

            window.location.href = '/app';
        }
        else
        {
            this.errorMsg.textContent = res.error;
        }
        
    }
}

const URI = 'http://127.0.0.1:3000';

export default Login;