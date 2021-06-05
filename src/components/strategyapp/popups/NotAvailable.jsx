import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSadTear } from '@fortawesome/pro-regular-svg-icons';
class NotAvailable extends Component
{

    render()
    {
        return(
            <React.Fragment>
            
            {/* <div className='popup header'>
                <span>Not Available</span>
            </div> */}
            <div className='popup content'>
                <div className='popup main'>
                    <div className='popup main-list'>
                        <div className='not-available body'>
                            <div>
                                <img className='not-available icon' src={process.env.PUBLIC_URL + '/disabled_icon.jpg'} />
                            </div>
                            <div className='not-available message'>
                                This feature has been disabled by the strategy owner.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            </React.Fragment>
        );
    }
}

export default NotAvailable;