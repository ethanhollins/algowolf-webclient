import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

class Logout extends Component
{   
    state = {
        completed: false
    }

    render()
    {
        return (
            <React.Fragment></React.Fragment>
        );
    }

    componentDidMount()
    {
        this.handleLogout();
    }

    async handleLogout()
    {
        const reqOptions = {
            method: 'POST',
            credentials: 'include'
        }
        let res = await fetch(
            `${URI}/logout`,
            reqOptions
        );
        
        const status = res.status;
        res = await res.json(); 

        if (status === 200)
        {
            this.props.setUserId(null);
        }

        this.props.history.push('/');
    }
}

const URI = 'http://127.0.0.1:5000'

export default withRouter(Logout);