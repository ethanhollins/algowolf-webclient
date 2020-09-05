import React, { Component } from 'react';
import ProfileIcon from '../../ProfileIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faArrowAltCircleRight, faCog, faTrashAlt, faClock
} from '@fortawesome/pro-regular-svg-icons';

class BrokerSettingsItem extends Component
{
    render()
    {
        return (
            <React.Fragment>

            <div className='list-item body'>
                <div className='list-item left'>
                    <ProfileIcon />
                    <div className='list-item info'>
                    <div className='list-item name'>Oanda Demo</div>
                        <div className='list-item live-tag'>Live</div>
                    </div>
                </div>
                <div className='list-item right'>
                    <div>
                        <FontAwesomeIcon className='list-item btn' icon={faCog} />
                        <FontAwesomeIcon id='trash-icon' className='list-item btn' icon={faTrashAlt} />
                    </div>
                </div>
            </div>
            <div id='separator'></div>

            </React.Fragment>
        );
    }
}

export default BrokerSettingsItem;