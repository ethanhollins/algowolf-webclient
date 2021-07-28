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
        const { REACT_APP_FRONT_BASE_URL } = process.env;
        this.props.getCookies().remove('Authorization');
        this.props.setUserId(null);

        const query_string = new URLSearchParams(window.location.search);
        if (query_string.get("redirect"))
        {
            window.location.href = query_string.get("redirect");
        }
        else
        {
            window.location.href = REACT_APP_FRONT_BASE_URL + "/logout";
        }
        
    }
}

export default withRouter(Logout);