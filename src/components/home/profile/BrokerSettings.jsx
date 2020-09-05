import React, { Component } from 'react';
import BrokerSettingsItem from './settings/BrokerSettingsItem';
import { withRouter } from 'react-router-dom';

class BrokerSettings extends Component
{
    render()
    {
        const current_url = this.props.location.pathname;
        
        return (
            <React.Fragment>

            <div className='profile sub-nav'>
                <a href={current_url + '#settings-brokers'} className='selected'>Brokers</a>
                <a href={current_url + '#settings-account'}>Account</a>
            </div>
            <div>
                <BrokerSettingsItem />
                <BrokerSettingsItem />
            </div>

            </React.Fragment>
        );
    }
}

export default withRouter(BrokerSettings);