import React, { Component } from 'react';

class UrlRedirect extends Component
{
    componentDidMount()
    {
        const { REACT_APP_FRONT_BASE_URL } = process.env;
        let query_string = this.props.queryString;

        if (query_string)
        {
            window.location.href = REACT_APP_FRONT_BASE_URL + this.props.url + query_string;
        }
        else
        {
            query_string = "?redirect=" + encodeURIComponent(window.location.href)
            window.location.href = REACT_APP_FRONT_BASE_URL + this.props.url + query_string;
        }
    }

    render()
    {
        return (
            <React.Fragment/>
        );
    }
    
}

export default UrlRedirect;