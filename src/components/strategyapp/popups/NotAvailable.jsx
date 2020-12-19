import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSadTear } from '@fortawesome/pro-regular-svg-icons';
class NotAvailable extends Component
{

    render()
    {
        return(
            <React.Fragment>
            
            <div className='popup header'>
                <span>Not Available</span>
            </div>
            <div className='popup content'>
                <div className='popup main'>
                    <div className='popup main-list'>
                        <div className='not-available body'>
                            <div className='not-available message'>
                                Sorry this feature isn't available on the demo.
                            </div>
                            <div>
                                <FontAwesomeIcon icon={faSadTear} className='not-available icon' />
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