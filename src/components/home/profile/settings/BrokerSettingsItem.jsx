import React, { Component } from 'react';
import ProfileIcon from '../../ProfileIcon';

class BrokerSettingsItem extends Component
{
    render()
    {
        return (
            <React.Fragment>

            <div className='list-item body'>
                <div className='list-item left'>
                    <ProfileIcon />
                    <div>
                    <div className='list-item name'>Oanda Demo</div>
                        <div className='list-item live-tag'>Live</div>
                    </div>
                </div>
                <div className='list-item right'>
                    <div className='list-item btns'>
                        Btns
                    </div>
                </div>
            </div>
            <div id='separator'></div>

            </React.Fragment>
        );
    }
}

export default BrokerSettingsItem;