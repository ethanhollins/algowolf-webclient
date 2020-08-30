import React, { Component } from 'react';
import BrokerSettingsItem from './settings/BrokerSettingsItem';

class BrokerSettings extends Component
{
    render()
    {
        return (
            <div>
                <BrokerSettingsItem />
                <BrokerSettingsItem />
            </div>
        );
    }
}

export default BrokerSettings;