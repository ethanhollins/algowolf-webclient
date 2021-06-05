import React, { Component } from 'react';
import { withRouter, Redirect } from 'react-router-dom';
import io from 'socket.io-client';

class AuthLogin extends Component
{
    constructor(props)
    {
        super(props);
    }

    state = {
        sio: null,
        is_login_pressed: false
    }

    componentDidMount()
    {
        let { sio } = this.state;
        sio = this.handleSocket();
        this.setState({ sio });
    }

    render()
    {
        return (
            <div className='auth-login background'>
                {this.getLoginGUI()}
            </div>
        );
        
    }

    reconnect = (socket) =>
    {
        socket.connect();
        setTimeout(() => {
            if (!socket.connected)
            {
                this.reconnect(socket);
            }
        }, 5*1000);
    }

    subscribe()
    {
        const { sio } = this.state;
        const queryString = this.props.location.search;
        const params = new URLSearchParams(queryString);
        const strategy_id = params.get('sid');
        sio.emit(
            'subscribe', 
            {
                'broker_id': strategy_id,
                'field': 'ontrade'
            }
        );
    }

    handleSocket()
    {
        const { REACT_APP_STREAM_URL } = process.env;
        const endpoint = `${REACT_APP_STREAM_URL}/user`
        const socket = io(endpoint, {
            reconnection: false,
            transportOptions: {
                polling: {
                    extraHeaders: {
                        Authorization: `Bearer ${this.props.getCookies().get('Authorization')}`
                    }
                }
            }
        });

        socket.on('connect', () =>
        {
            this.subscribe();
            console.log('Connected.');
        });

        socket.on('disconnect', () =>
        {
            this.reconnect(socket);
            console.log('Disconnected.');
        });

        socket.on('ongui', (data) =>
        {
            console.log(data);
            if (data.type === 'logged_in')
            {
                const queryString = this.props.location.search;
                window.location = '/auth/ib' + queryString;
            }
        });

        return socket;
    }

    getLoginGUI()
    {
        const paths = this.props.location.pathname.split('/');
        const provider = paths[paths.length-2];
        
        if (provider === 'oanda')
        {
            return (
                <div className='auth-login body oanda'>
                    <a href='https://www.oanda.com/account/login' target="_blank">
                        <img className='auth-login logo oanda' src={process.env.PUBLIC_URL + '/oanda_logo_large.png'} />
                    </a>
                    <div className='auth-login account-type'>
                        <div className='auth-login account-button'>Live</div>
                        <div className='auth-login account-button selected'>Demo</div>
                    </div>
                    <div className='auth-login field-header'>Access Token</div>
                    <input className='auth-login field' placeholder='Enter Access Token' />
                    <div className='auth-login info'>
                        <span>Instructions to find your access token, or <a href="https://www.oanda.com/demo-account/tpa/personal_token" target="_blank">Click Here</a></span>
                        <ol>
                            <li>Log into your Oanda account <a href="https://www.oanda.com/account/login" target="_blank">here</a>.</li>
                            <li>Scroll down to <strong>My Services</strong> and navigate to <strong>Manage API Acess</strong>.</li>
                            <li>Click on the <strong>Generate</strong> button.</li>
                            <li>Copy the token and paste it into the above text box.</li>
                        </ol>
                    </div>
                    <div className='auth-login submit-button'>Connect to Oanda</div>
                </div>
            );
        }
        else if (provider === 'ib')
        {
            return (
                <div className='auth-login body ib'>
                    <a href='#' target="_blank">
                        <img className='auth-login logo ib' src={process.env.PUBLIC_URL + '/interactive_brokers_logo_large.png'} />
                    </a>
                    {this.getConditionalIbGui()}
                </div>
            );
        }
        else if (provider === 'fxcm')
        {
            return (
                <div className='auth-login body fxcm'>
                    <a href='https://www.oanda.com/account/login' target="_blank">
                        <img className='auth-login logo fxcm' src={process.env.PUBLIC_URL + '/fxcm_logo_large.png'} />
                    </a>
                    <div className='auth-login account-type'>
                        <div className='auth-login account-button'>Live</div>
                        <div className='auth-login account-button selected'>Demo</div>
                    </div>
                    <div className='auth-login field-header'>Username</div>
                    <input className='auth-login field' placeholder='Enter Username' />
                    <div className='auth-login field-header'>Password</div>
                    <input className='auth-login field' placeholder='Enter Password' type="password" />
                    <div className='auth-login submit-button fxcm'>Connect to FXCM</div>
                </div>
            );
        }
    }

    getConditionalIbGui = () =>
    {
        const { is_login_pressed } = this.state;
        if (is_login_pressed)
        {
            return (
                <React.Fragment>
    
                <div className='auth-login message'>Waiting for login completion...</div>
                <div className="dot-flashing"></div>
    
                </React.Fragment>
            );
        }
        else
        {
            return (
                <React.Fragment>
    
                <div className='auth-login submit-button ib' onClick={this.onLoginPressed.bind(this)}>Login</div>
    
                </React.Fragment>
            );
        }
    }

    onLoginPressed = (e) =>
    {
        let { is_login_pressed } = this.state;
        is_login_pressed = true;
        this.setState({ is_login_pressed });

        this.loadIbLogin();
    }

    loadIbLogin = () =>
    {
        const queryString = this.props.location.search;
        const params = new URLSearchParams(queryString);
        const { REACT_APP_IB_REDIRECT_BASE } = process.env;
        const port = params.get('uid');
        const token = params.get('token');
        const url = `${REACT_APP_IB_REDIRECT_BASE}/?port=${port}&token=${token}`;
        console.log(url);

        window.open(url);
    }
}

export default withRouter(AuthLogin);