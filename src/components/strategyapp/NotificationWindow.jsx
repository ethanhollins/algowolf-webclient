import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faArrowAltCircleUp, faTimes
} from '@fortawesome/pro-regular-svg-icons';

class NotificationWindow extends Component
{
    constructor(props)
    {
        super(props);

        this.setNotifBody = elem => {
            this.notifBody = elem;
        };
    }

    render()
    {
        return(
            <React.Fragment>

            <div 
                ref={this.setNotifBody} className='notif body'
                style={{ top: (20 + this.props.idx * 130) + 'px' }}
            >
                <div className='notif header'>
                    {this.props.header}
                    <FontAwesomeIcon className='notif close-icon' icon={faTimes} />
                </div>
                <div className='notif description'>
                    {this.props.description}
                </div>
                <div className='notif timestamp'>
                    07-05-21 20:00
                </div>
            </div>

            </React.Fragment>
        );
    }

}

export default NotificationWindow;