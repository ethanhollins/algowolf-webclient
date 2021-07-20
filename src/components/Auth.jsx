import React, { Component } from 'react';
import { withRouter, Redirect } from 'react-router-dom';

class Auth extends Component
{
    constructor(props)
    {
        super(props);

        this.handleAuth = this.handleAuth.bind(this);
    }

    state = {
        auth_complete: false,
        message: ''
    }

    async componentDidMount()
    {
        await this.handleAuth();
    }

    async handleAuth()
    {
        const paths = this.props.location.pathname.split('/');
        const provider = paths[paths.length-1];

        const queryString = this.props.location.search;

        const { REACT_APP_API_URL } = process.env;
        let { message } = this.state;

        if (provider === 'spotware')
        {
            message = 'Connecting your broker...';
            this.setState({ message });

            const reqOptions = {
                method: 'GET',
                headers: this.props.getHeaders(),
                credentials: 'include'
            }

            const res = await fetch(
                `${REACT_APP_API_URL}/auth/spotware` + queryString,
                reqOptions
            )
            const data = await res.json();

            if (res.status === 200)
            {
                const broker_id = data.broker_id;
                window.location = `/app?broker=${broker_id}`;
            }
            else if (res.status === 400)
            {
                const msg = data.message;
                window.location = `/app`
            }
            else
            {
                window.location = `/app`
            }            
        }
        else if (provider === 'holygrail')
        {
            message = 'Redirecting you to Holy Grail...';
            this.setState({ message });

            const reqOptions = {
                method: 'GET',
                headers: this.props.getHeaders(),
                credentials: 'include'
            }

            await fetch(
                `${REACT_APP_API_URL}/v1/holygrail/auth/token` + queryString,
                reqOptions
            )

            window.location = '/holygrail/demo';
        }
        else if (provider === 'ib')
        {
            message = 'Connecting your broker...';
            this.setState({ message });

            let params = new URLSearchParams(queryString);
            let port = params.get('uid');
            const reqOptions = {
                method: 'POST',
                headers: this.props.getHeaders(),
                credentials: 'include',
                body: JSON.stringify({ port: port })
            }

            await fetch(
                `${REACT_APP_API_URL}/v1/ib/auth/confirmed`,
                reqOptions
            )

            window.location = `/app`
        }


        // let { auth_complete } = this.state;
        // auth_complete = true;
        // this.setState({ auth_complete });
    }

    render()
    {
        console.log('??');
        return (
            <div className='auth-login background'>
                {this.getLoadingGUI()}
            </div>
        );
        
    }

    getLoadingGUI()
    {
        const { message } = this.state;
        const paths = this.props.location.pathname.split('/');
        const provider = paths[paths.length-1];
        
        if (provider === 'oanda')
        {
            return (
                <div className='auth-login body oanda'>
                    <div>
                        <img class='auth-login logo oanda' src={process.env.PUBLIC_URL + '/oanda_logo_large.png'} />
                    </div>
                    <div className='auth-login message'>Connecting your broker...</div>
                    <div class="dot-flashing"></div>
                </div>
            );
        }
        else if (provider === 'ib')
        {
            return (
                <div className='auth-login body ib'>
                    <div>
                        <img class='auth-login logo ib' src={process.env.PUBLIC_URL + '/interactive_brokers_logo_large.png'} />
                    </div>
                    <div className='auth-login message'>Connecting your broker...</div>
                    <div class="dot-flashing"></div>
                </div>
            );
        }
        else if (provider === 'fxcm')
        {
            return (
                <div className='auth-login body fxcm'>
                    <div>
                        <img class='auth-login logo fxcm' src={process.env.PUBLIC_URL + '/fxcm_logo_large.png'} />
                    </div>
                    <div className='auth-login message'>Connecting your broker...</div>
                    <div class="dot-flashing"></div>
                </div>
            );
        }
        else if (provider === 'spotware')
        {
            return (
                <div className='auth-login body spotware'>
                    <div>
                        <img class='auth-login logo spotware' src={process.env.PUBLIC_URL + '/ctrader_logo_large.png'} />
                    </div>
                    <div className='auth-login message'>Connecting your broker...</div>
                    <div class="dot-flashing"></div>
                </div>
            );
        }
        else if (provider === 'holygrail')
        {
            return (
                <div className='auth-login body holygrail'>
                    <div>
                        <img class='auth-login logo holygrail' src={process.env.PUBLIC_URL + '/holygrail_icon.jpg'} />
                    </div>
                    <div className='auth-login message'>Redirecting you to Holy Grail...</div>
                    <div class="dot-flashing"></div>
                </div>
            );
        }
        else if (provider === 'dukascopy')
        {
            return (
                <div className='auth-login body dukascopy'>
                    <div>
                        <img class='auth-login logo dukascopy' src={process.env.PUBLIC_URL + '/dukascopy_logo_large.png'} />
                    </div>
                    <div className='auth-login message'>Connecting your broker...</div>
                    <div class="dot-flashing"></div>
                </div>
            );
        }
    }
}

export default withRouter(Auth);