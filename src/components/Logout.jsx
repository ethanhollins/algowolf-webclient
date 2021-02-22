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
        console.log('LOGOUT');
        this.handleLogout();
    }

    async handleLogout()
    {
        // const reqOptions = {
        //     method: 'POST',
        //     credentials: 'include'
        // }
        // let res = await fetch(
        //     `${this.props.getURI()}/logout`,
        //     reqOptions
        // );
        
        // const status = res.status;
        // res = await res.json(); 

        // if (status === 200)
        // {
        //     this.props.setUserId(null);
        // }

        console.log(this.props.getCookies().get('Authorization'));
        this.props.getCookies().remove('Authorization');
        console.log(this.props.getCookies().get('Authorization'));
        this.props.setUserId(null);
        this.props.history.push('/login');
    }
}

export default withRouter(Logout);