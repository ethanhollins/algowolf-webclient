import React, { Component } from 'react';
import ProfileIcon from '../../ProfileIcon';

class StrategyItem extends Component
{
    render()
    {
        return (
            <React.Fragment>

            <div className='list-item body'>
                <div className='list-item left'>
                    <ProfileIcon />
                    <div>
                        <div className='list-item name'>Name (Lock)</div>
                        <div id='username' className='list-item user'>@username</div>
                    </div>
                </div>
                <div className='list-item right'>
                    <div className='list-item btns'>
                        Btns
                    </div>
                    <div className='list-item date'>Added</div>
                </div>
            </div>
            <div id='separator'></div>

            </React.Fragment>
        );
    }
}

export default StrategyItem;