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
            message = 'Please wait while we connect your broker...';
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
                window.location = `/app?brokerSuccess=Successfully added broker to your account%2E&broker=${broker_id}`;
            }
            else if (res.status === 400)
            {
                const msg = data.message;
                window.location = `/app?brokerError=${encodeURIComponent(msg)}`
            }
            else
            {
                window.location = `/app?brokerError=Failed to add broker%2E`
            }            
        }
        else if (provider === 'holygrail')
        {
            message = 'Please wait while we redirect you to Holy Grail...';
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

        // let { auth_complete } = this.state;
        // auth_complete = true;
        // this.setState({ auth_complete });
    }

    render()
    {
        const { message } = this.state;

        // if (this.state.auth_complete)
        // {
        //     return <Redirect to="/app" />;
        // }
        // else
        // {
        return (
            <div className='auth'>
                {message}
            </div>
        );
        // }
        
    }
}

export default withRouter(Auth);