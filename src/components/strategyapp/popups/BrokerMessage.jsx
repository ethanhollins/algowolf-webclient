import React, { Component } from 'react';

class BrokerMessage extends Component
{

    render()
    {
        return(
            <React.Fragment>
            
            <div className='popup content'>
                <div className='popup main'>
                    <div className='popup main-list'>
                        <div className='beta-unavailable body'>
                            <div>
                                <div>
                                    <img className='beta-unavailable icon' src={process.env.PUBLIC_URL + this.props.getPopup().image} />
                                </div>
                            </div>
                            <span className='broker-message message'>
                                {this.props.getPopup().message}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            </React.Fragment>
        );
    }
}

export default BrokerMessage;