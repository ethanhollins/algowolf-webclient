import React, { Component } from 'react';
import AccountSettingsItem from './settings/AccountSettingsItem';

class AccountSettings extends Component
{
    render()
    {
        return (
            <div>
                <AccountSettingsItem />
                <AccountSettingsItem />
            </div>
        );
    }
}

export default AccountSettings;