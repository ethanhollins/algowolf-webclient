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

            await fetch(
                `${REACT_APP_API_URL}/auth/spotware` + queryString,
                reqOptions
            )

            window.location = '/app';
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