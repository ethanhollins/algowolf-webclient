import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faChevronRight
} from '@fortawesome/pro-regular-svg-icons';
import { 
    faChartBar, faChartLine, faDollarSign
} from '@fortawesome/pro-light-svg-icons';
import ColorSwatch from './ColorSwatch';

class AccountSettings extends Component
{

    render()
    {
        return(
            <React.Fragment>
            
            <div className='popup header'>
                <span>Account Settings</span>
            </div>
            <div className='popup content'>
                <div className='popup main'>
                    <div className='popup main-list'>
                    </div>
                </div>
            </div>

            </React.Fragment>
        );
    }

    getBarsItems()
    {
        return
    }

    getChartItems()
    {
        return
    }

    getTradingItems()
    {
        return
    }

    getItems()
    {
        const opened = this.props.getPopup().opened;

        if (opened === 'bars')
        {
            return this.getBarsItems();
        }
        else if (opened === 'chart')
        {
            return this.getChartItems();
        }
        else if (opened === 'trading')
        {
            return this.getTradingItems();
        }
    }

    isSelected(category)
    {
        const popup = this.props.getPopup();
        if (popup.opened === category)
            return ' selected';
        else
            return '';
    }
}

export default AccountSettings;