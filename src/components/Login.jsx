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

        this.setEmailRef = elem => {
            this.email = elem;
        }
        this.setPasswordRef = elem => {
            this.password = elem;
        }
        this.setErrorMsgRef = elem => {
            this.errorMsg = elem;
        }
    }

    state = {
        email: '',
        password: '',
        remember_me: false,
        loginCheck: false
    }

    async componentDidMount()
    {
        const user_id = await this.props.checkAuthorization();
        console.log(user_id);
        // if (user_id === null)
        // {
        //     const { REACT_APP_FRONT_BASE_URL } = process.env;
        //     let query_string = this.props.queryString;

        //     if (query_string)
        //     {
        //         window.location.href = REACT_APP_FRONT_BASE_URL + this.props.url + query_string;
        //     }
        //     else
        //     {
        //         query_string = "?redirect=" + encodeURIComponent(window.location.href)
        //         window.location.href = REACT_APP_FRONT_BASE_URL + this.props.url + query_string;
        //     }
        // }
        // else
        // {
        //     window.location = '/app';
        // }
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
                                        ref={this.setEmailRef}
                                        type="email" className="login input" 
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

                            <div className="login horiz field">
                                <label className='login checkbox'>
                                    <input 
                                        type='checkbox' 
                                        defaultChecked={false}
                                        onChange={this.onCheckboxInputChange.bind(this)}
                                    />
                                    <div className='login checkmark'></div>
                                </label>
                                <div className="login small-text">Remember Me</div>
                            </div>
        
                            <div className="login field">
                                <input type="submit" id="submit" className="login input" value="SIGN IN"/>
                            </div>
        
                            <div className="login field center">
                                <span><a href='/send-reset'>Forgot Password?</a></span>
                            </div>
        
                            <div className="login field center">
                                <span className='error' ref={this.setErrorMsgRef}></span>
                            </div>

                        </form>
                        <div className="login field separator">
                            <span>OR</span>
                        </div>
                        <div className="login field create-account">
                            <span><a href={'/register'+ window.location.search}>Create a free account</a> to get started with AlgoWolf</span>
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

    onCheckboxInputChange(e)
    {
        let { remember_me } = this.state;
        remember_me = e.target.checked;
        this.setState({ remember_me });
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

    resetErrors()
    {
        this.email.style.borderColor = 'rgb(220,220,220)';
        this.email.style.borderWidth = '1px';
        this.password.style.borderColor = 'rgb(220,220,220)';
        this.password.style.borderWidth = '1px';
        this.errorMsg.textContent = "";
    }

    async handleSubmit(event)
    {
        this.resetErrors();

        const { REACT_APP_API_URL } = process.env;
        event.preventDefault();
        const raw = JSON.stringify({
            'email': this.state.email,
            'password': this.state.password,
            'remember_me': this.state.remember_me
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
            this.props.getCookies().set('Authorization', data.token, {
                path: '/'
            })
            this.props.setUserId(data.user_id);
        }
        else
        {
            this.errorMsg.textContent = data.message;
            this.password.value = "";

            if (data.message === "Incorrect email.")
            {
                this.email.style.borderColor = '#e74c3c';
                this.email.style.borderWidth = '2px';
            }
            else if (data.message === "Incorrect password.")
            {
                this.password.style.borderColor = '#e74c3c';
                this.password.style.borderWidth = '2px';
            }
        }
    }
}

export default Login;