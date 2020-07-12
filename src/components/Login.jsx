import React, { Component } from 'react';
import Cookies from 'universal-cookie';

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
            <div>
                <form style={{padding: "10px"}} onSubmit={this.handleSubmit.bind(this)}>
                    <label htmlFor="username">Username:</label><br/>
                    <input type="text" id="username" name="username" onChange={this.handleChange} /><br/>
                    <label htmlFor="password">Password:</label><br/>
                    <input type="password" id="password" name="password" onChange={this.handleChange} /><br/><br/>
                    <input type="submit" value="Submit"/>
                </form> 
                <p ref={this.setErrorMsgRef} style={{ 'color': '#F00' }} ></p>
            </div>
        )
    }

    handleChange = (event) =>
    {
        let { username, password } = this.state;
        if (event.target.name === 'username')
        {
            username = event.target.value;
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
            method: 'POST'
        }

        let res = await fetch(
            `http://127.0.0.1/login?username=${this.state.username}&password=${this.state.password}`,
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

export default Login;