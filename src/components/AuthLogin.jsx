import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import io from 'socket.io-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faRedo, faInfoCircle
} from '@fortawesome/pro-regular-svg-icons';

class AuthLogin extends Component
{
    constructor(props)
    {
        super(props);

        this.retrieveDukascopyCaptcha = this.retrieveDukascopyCaptcha.bind(this);
    }

    state = {
        sio: null,
        is_login_pressed: false,
        key: '',
        web_api_id: '',
        web_api_secret: '',
        username: '',
        password: '',
        captcha: '',
        err_msg: '',
        is_demo: true,
        captcha_b64: null,
        complete_login: false
    }

    async componentDidMount()
    {
        let { sio } = this.state;
        sio = this.handleSocket();
        this.setState({ sio });

        const paths = this.props.location.pathname.split('/');
        const provider = paths[paths.length-2];

        if (provider === 'dukascopy')
        {
            await this.retrieveDukascopyCaptcha();
        }
    }

    render()
    {
        const { complete_login } = this.state;
        return (
            <div className='auth-login background'>
                { complete_login ? this.getCompleteLoginGUI() : this.getLoginGUI() }
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
        const { err_msg, is_demo } = this.state;
        const paths = this.props.location.pathname.split('/');
        const provider = paths[paths.length-2];

        if (provider === 'oanda')
        {
            return (
                <div className='auth-login body oanda'>
                    <div>
                        <img className='auth-login logo oanda' src={process.env.PUBLIC_URL + '/oanda_logo_large.png'} />
                    </div>
                    <div className='auth-login account-type'>
                        <div 
                            className={'auth-login account-button' + this.isAccountTypeSelected(false)}
                            onClick={this.setIsDemo.bind(this)}
                            name='live'
                        >
                            Live
                        </div>
                        <div 
                            className={'auth-login account-button' + this.isAccountTypeSelected(true)}
                            onClick={this.setIsDemo.bind(this)}
                            name='demo'
                        >
                            Demo
                        </div>
                    </div>
                    <div ref={this.setErrorRef} className="auth-login error" style={{display: this.isErrorMsg()}}>{err_msg}</div>
                    <div className='auth-login field-header'>Access Token</div>
                    <input 
                        className='auth-login field' placeholder='Enter Access Token' name='key' 
                        onChange={this.onFieldChange.bind(this)}
                    />
                    <div className='auth-login info'>
                        <span>Instructions to find your access token, or <a href="https://www.oanda.com/demo-account/tpa/personal_token" target="_blank">Click Here</a></span>
                        <ol>
                            <li>Log into your Oanda account <a href="https://www.oanda.com/account/login" target="_blank">here</a>.</li>
                            <li>Scroll down to <strong>My Services</strong> and navigate to <strong>Manage API Access</strong>.</li>
                            <li>Click on the <strong>Generate</strong> button.</li>
                            <li>Copy the token and paste it into the above text box.</li>
                        </ol>
                    </div>
                    <div 
                        className='auth-login submit-button'
                        onClick={this.completeLogin.bind(this)}
                    >
                        Connect to Oanda
                    </div>
                </div>
            );
        }
        else if (provider === 'ib')
        {
            return (
                <div className='auth-login body ib'>
                    <div>
                        <img className='auth-login logo ib' src={process.env.PUBLIC_URL + '/interactive_brokers_logo_large.png'} />
                    </div>
                    {this.getConditionalIbGui()}
                </div>
            );
        }
        else if (provider === 'fxcm')
        {
            return (
                <div className='auth-login body fxcm'>
                    <div>
                        <img className='auth-login logo fxcm' src={process.env.PUBLIC_URL + '/fxcm_logo_large.png'} />
                    </div>
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
        else if (provider === 'dukascopy')
        {
            return (
                <div className='auth-login body fxcm'>
                    <div>
                        <img className='auth-login logo dukascopy' src={process.env.PUBLIC_URL + '/dukascopy_logo_large.png'} />
                    </div>
                    <div className='auth-login account-type'>
                        <div 
                            className={'auth-login account-button' + this.isAccountTypeSelected(false)}
                            onClick={this.setIsDemo.bind(this)}
                            name='live'
                        >
                            Live
                        </div>
                        <div 
                            className={'auth-login account-button' + this.isAccountTypeSelected(true)}
                            onClick={this.setIsDemo.bind(this)}
                            name='demo'
                        >
                            Demo
                        </div>
                    </div>
                    <div ref={this.setErrorRef} className="auth-login error" style={{display: this.isErrorMsg()}}>{err_msg}</div>
                    <div className='auth-login field-header'>Username</div>
                    <input 
                        className='auth-login field' placeholder='Enter Username' 
                        onChange={this.onFieldChange.bind(this)}
                        name='username'
                    />
                    <div className='auth-login field-header'>Password</div>
                    <input 
                        className='auth-login field' placeholder='Enter Password' type="password" 
                        onChange={this.onFieldChange.bind(this)}
                        name='password'
                    />
                    { this.getDukascopyCaptchaElem()}

                    <div 
                        className='auth-login submit-button fxcm'
                        onClick={this.completeLogin.bind(this)}
                    >
                        Connect to Dukascopy
                    </div>
                </div>
            );
        }
        else if (provider === 'fxopen')
        {
            return (
                <div className='auth-login body fxopen'>
                    <div>
                        <div>
                            <img className='auth-login logo fxopen' src={process.env.PUBLIC_URL + '/fxopen_logo_large.png'} />
                        </div>
                        <div className='auth-login account-type'>
                            <div 
                                className={'auth-login account-button' + this.isAccountTypeSelected(false)}
                                onClick={this.setIsDemo.bind(this)}
                                name='live'
                            >
                                Live
                            </div>
                            <div 
                                className={'auth-login account-button' + this.isAccountTypeSelected(true)}
                                onClick={this.setIsDemo.bind(this)}
                                name='demo'
                            >
                                Demo
                            </div>
                        </div>
                        <div ref={this.setErrorRef} className="auth-login error" style={{display: this.isErrorMsg()}}>{err_msg}</div>
                        <div className='auth-login field-header'>Your API Details</div>
                        <input 
                            className='auth-login field' placeholder='Enter WebAPI Id' name='web_api_id' 
                            onChange={this.onFieldChange.bind(this)}
                        />
                        {/* <div className='auth-login field-header'>Web Api Key</div> */}
                        <input 
                            className='auth-login field' placeholder='Enter WebAPI Key' name='key' 
                            onChange={this.onFieldChange.bind(this)}
                        />
                        {/* <div className='auth-login field-header'>Web Api Secret</div> */}
                        <input 
                            className='auth-login field' placeholder='Enter WebAPI Secret' name='web_api_secret' 
                            onChange={this.onFieldChange.bind(this)}
                        />
                        <div 
                            className='auth-login submit-button'
                            onClick={this.completeLogin.bind(this)}
                        >
                            Connect to FX Open
                        </div>
                    </div>
                    <div className='auth-login fxopen info-parent'>
                        <div className='auth-login info'>
                            { is_demo ? 
                                <React.Fragment>
                                <div className='auth-login info-header'>Instructions to find your API details for Demo Accounts</div>
                                <ol>
                                    <li>Register an FX Open <strong>demo</strong> account <a href="https://demo.forex.game/registration?marginTradingTab=True" target="_blank">here</a>.</li>
                                    <li>Select <strong>Gross</strong> type and enter your details</li>
                                    {/* , then, enable <strong>Web Api Enabled</strong> option. On registration your details will be displayed.</li> */}
                                    <li>Use their <strong>Copy to Clipboard</strong> button to <strong>store this information and paste in a text file</strong>.<br/><strong>Note:</strong> You can only save this information once.</li>
                                    {/* <li>Copy your <strong>WebAPI Id</strong>, <strong>WebAPI Key</strong> and <strong>WebAPI Secret</strong> into the text boxes on the left.</li> */}
                                    <li>Once logged in, click on the <strong>settings cog</strong> on the top right and select <strong>Edit User Account</strong>.</li>
                                    <li>Enable <strong>WebAPI Enabled</strong> and click <strong>Save</strong>.</li>
                                    <li>Click <strong>Next</strong>, select <strong>Create new WebAPI Token</strong>, then, <strong>Copy to Clipboard</strong> and store this information in a text file.<br/><strong>Note:</strong> You can only save this information once.</li>
                                    <li>Copy your <strong>WebAPI Id</strong>, <strong>WebAPI Key</strong> and <strong>WebAPI Secret</strong> into the text boxes on the left.</li>
                                </ol>
                                </React.Fragment>
                                : <React.Fragment>
                                <div className='auth-login info-header'>Instructions to find your API details for Live Accounts</div>
                                <ol>
                                    <li>On your FX Open dashboard, under <strong>Add Account</strong> select <strong>TickTrader - ECN GROSS (TickTrader)</strong> and <strong>store your account details in a text file</strong>.</li>
                                    <li>Click on the <strong>red icon</strong> next to your new TickTrader account number on the left panel.</li>
                                    <li>Once loaded, click on the <strong>settings cog</strong> on the top right and select <strong>Edit User Account</strong>.</li>
                                    <li>Enable <strong>WebAPI Enabled</strong> and click <strong>Save</strong>.</li>
                                    <li>Click <strong>Next</strong>, select <strong>Create new WebAPI Token</strong>, then, <strong>Copy to Clipboard</strong> and store this information in a text file.<br/><strong>Note:</strong> You can only save this information once.</li>
                                    <li>Copy your <strong>WebAPI Id</strong>, <strong>WebAPI Key</strong> and <strong>WebAPI Secret</strong> into the text boxes on the left.</li>
                                </ol>
                                <div className='auth-login info-sub-header'><strong>Note:</strong> Australian TickTrader accounts are currently unavailable. According to FX Open Australian clients may setup a UK account.</div>
                                </React.Fragment>
                            }
                        </div>
                    </div>
                    
                </div>
            );
        }
    }

    getCompleteLoginGUI()
    {
        const paths = this.props.location.pathname.split('/');
        const provider = paths[paths.length-2];

        if (provider === 'oanda')
        {
            return (
                <div className='auth-login body oanda'>
                    <div>
                        <img className='auth-login logo oanda' src={process.env.PUBLIC_URL + '/oanda_logo_large.png'} />
                    </div>
                    <div className='auth-login message'>Connecting your broker...</div>
                    <div className="dot-flashing"></div>
                </div>
            );
        }
        else if (provider === 'fxopen')
        {
            return (
                <div className='auth-login body fxopen complete'>
                    <div>
                        <img className='auth-login logo fxopen' src={process.env.PUBLIC_URL + '/fxopen_logo_large.png'} />
                    </div>
                    <div className='auth-login message'>Connecting your broker...</div>
                    <div className="dot-flashing"></div>
                </div>
            );
        }
        else if (provider === 'dukascopy')
        {
            return (
                <div className='auth-login body dukascopy'>
                    <div>
                        <img className='auth-login logo dukascopy' src={process.env.PUBLIC_URL + '/dukascopy_logo_large.png'} />
                    </div>
                    <div className='auth-login message'>Connecting your broker...</div>
                    <div className="dot-flashing"></div>
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

    isAccountTypeSelected = (btn_is_demo) =>
    {
        const { is_demo } = this.state;
        if (is_demo === btn_is_demo)
        {
            return ' selected';
        }
        else
        {
            return '';
        }
    }

    setIsDemo = (e) =>
    {
        let { is_demo } = this.state;
        const account_type = e.target.getAttribute('name');
        if (account_type === 'demo')
        {
            is_demo = true;
        }
        else
        {
            is_demo = false;
        }
        this.setState({ is_demo });
    }

    onFieldChange = (e) =>
    {
        const value = e.target.value;
        const name = e.target.getAttribute('name');
        let { username, password, captcha, key, web_api_id, web_api_secret } = this.state;

        if (name === 'username')
        {
            username = value;
        }
        else if (name === 'password')
        {
            password = value;
        }
        else if (name === 'key')
        {
            key = value;
        }
        else if (name === 'captcha')
        {
            captcha = value;
        }
        else if (name === 'web_api_id')
        {
            web_api_id = value;
        }
        else if (name === 'web_api_secret')
        {
            web_api_secret = value;
        }

        this.setState({ username, password, captcha, key, web_api_id, web_api_secret });
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

        window.open(url);
    }



    getDukascopyCaptchaElem = () =>
    {
        const { is_demo, captcha_b64 } = this.state;
        
        if (!is_demo)
        {
            let captcha_img;
            if (captcha_b64)
            {
                captcha_img = (
                    <React.Fragment>

                    <img 
                        className="auth-login captcha-img" 
                        src={"data:image/png;base64, " + captcha_b64}
                        alt="Captcha Image"
                    />
                    <div className='auth-login captcha-reload' onClick={this.reloadCaptcha.bind(this)}>
                        <FontAwesomeIcon className='auth-login captcha-reload-icon' icon={faRedo} />
                    </div>
                    <a className='auth-login captcha-info' href="https://www.dukascopy.com/wiki/en/getting-started/login/pin-code" target="_blank">
                        <FontAwesomeIcon className='auth-login captcha-info-icon' icon={faInfoCircle} />
                    </a>

                    </React.Fragment>
                );
            }
            else
            {
                captcha_img = (
                    <div className="auth-login captcha-img" >
                        Loading Captcha...
                    </div>
                );
            }

            return (
                <React.Fragment>
                <div className='auth-login captcha-parent'>
                    {captcha_img}
                </div>
                <input 
                    className='auth-login field' placeholder='Enter Captcha' 
                    onChange={this.onFieldChange.bind(this)}
                    name='captcha'
                />

                </React.Fragment>
            );
        }
    }

    async retrieveDukascopyCaptcha()
    {
        const API_URL = this.props.getServerUrl();
        const queryString = this.props.location.search;
        const params = new URLSearchParams(queryString);
        const broker_id = params.get('bid');
        let { captcha_b64 } = this.state;
        
        const reqOptions = {
            method: 'GET',
            headers: this.props.getHeaders(),
            credentials: 'include'
        }

        const res = await fetch(
            `${API_URL}/v1/dukascopy/auth/captcha/${broker_id}`,
            reqOptions
        );

        if (res.status === 200)
        {
            const data = await res.json();
            console.log(data);
            captcha_b64 = data['image'];
            this.setState({ captcha_b64 });
        }
        else
        {
            return null;
        }
    }

    async completeLogin()
    {
        const API_URL = this.props.getServerUrl();
        let { username, password, key, web_api_id, web_api_secret, is_demo, captcha, captcha_b64, err_msg } = this.state;
        let { complete_login } = this.state;

        const paths = this.props.location.pathname.split('/');
        const provider = paths[paths.length-2];
        const queryString = this.props.location.search;
        const params = new URLSearchParams(queryString);
        const broker_id = params.get('bid');

        if (provider === 'dukascopy')
        {
            complete_login = true;
            this.setState({ complete_login });

            const reqOptions = {
                method: 'POST',
                headers: this.props.getHeaders(),
                credentials: 'include',
                body: JSON.stringify({
                    username: username, password: password, 
                    is_demo: is_demo, captcha_result: captcha
                })
            }
    
            const res = await fetch(
                `${API_URL}/v1/dukascopy/auth/complete/${broker_id}`,
                reqOptions
            );
    
            console.log(res.status);
            if (res.status === 200)
            {
                const data = await res.json();
                console.log(data);

                if (data.result)
                {
                    window.location = '/app';
                    return;
                }
            }

            complete_login = false;
            captcha_b64 = null;
            err_msg = 'Login Failed.';
            this.setState({ complete_login, captcha_b64, err_msg });
            
            this.retrieveDukascopyCaptcha();
        }
        else if (provider === 'oanda')
        {
            complete_login = true;
            this.setState({ complete_login });

            const reqOptions = {
                method: 'POST',
                headers: this.props.getHeaders(),
                credentials: 'include',
                body: JSON.stringify({
                    broker: provider, broker_id, broker_id,
                    name: "My Broker", key: key, key: key, key: key, is_demo: is_demo
                })
            }

            const res = await fetch(
                `${API_URL}/broker`,
                reqOptions
            );

            if (res.status === 200)
            {
                window.location = '/app';
                return;
            }

            complete_login = false;
            err_msg = 'Login Failed.';
            this.setState({ complete_login, err_msg });
        }
        else if (provider === 'fxopen')
        {
            complete_login = true;
            this.setState({ complete_login });

            const reqOptions = {
                method: 'POST',
                headers: this.props.getHeaders(),
                credentials: 'include',
                body: JSON.stringify({
                    broker: provider, broker_id, broker_id,
                    name: "My Broker", key: key, web_api_id: web_api_id, 
                    web_api_secret: web_api_secret, is_demo: is_demo
                })
            }

            const res = await fetch(
                `${API_URL}/broker`,
                reqOptions
            );

            if (res.status === 200)
            {
                window.location = '/app';
                return;
            }

            complete_login = false;
            err_msg = 'Login Failed.';
            this.setState({ complete_login, err_msg });
        }
    }

    reloadCaptcha = () =>
    {
        let { captcha_b64 } = this.state;
        captcha_b64 = null;
        this.setState({ captcha_b64 });

        this.retrieveDukascopyCaptcha();
    }

    isErrorMsg = () =>
    {
        const { err_msg } = this.state;
        if (err_msg.length > 0)
        {
            return 'block';
        }
        else
        {
            return 'none';
        }
    }
}

export default withRouter(AuthLogin);