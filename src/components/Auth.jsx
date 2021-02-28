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
        auth_complete: false
    }

    async componentDidMount()
    {
        console.log(this.props);
        await this.handleAuth();
    }

    async handleAuth()
    {
        const paths = this.props.location.pathname.split('/');
        const broker = paths[paths.length-1];

        if (broker === 'spotware')
        {
            const queryString = this.props.location.search;
            
            const { REACT_APP_API_URL } = process.env;
            const reqOptions = {
                method: 'GET',
                headers: this.props.getHeaders(),
                credentials: 'include'
            }

            console.log(`${REACT_APP_API_URL}/auth/spotware` + queryString);
            await fetch(
                `${REACT_APP_API_URL}/auth/spotware` + queryString,
                reqOptions
            )
        }

        let { auth_complete } = this.state;
        auth_complete = true;
        this.setState({ auth_complete });
    }

    render()
    {
        if (this.state.auth_complete)
        {
            return <Redirect to="/app" />;
        }
        else
        {
            return (
                <div className='auth'>
                    Please wait while we connect your broker...
                </div>
            );
        }
        
    }
}

export default withRouter(Auth);