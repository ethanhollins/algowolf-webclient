import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

class AccountSettings extends Component
{
    render()
    {
        const current_url = this.props.location.pathname;

        return (
            <React.Fragment>

            <div className='profile sub-nav'>
                <a href={current_url + '#settings-brokers'}>Brokers</a>
                <a href={current_url + '#settings-account'} className='selected'>Account</a>
            </div>
            <div>
            </div>

            </React.Fragment>
        );
    }
}

export default withRouter(AccountSettings);