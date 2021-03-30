import React, { Component } from 'react';

class StartFailed extends Component
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
                                Failed to start strategy. It appears the script is running on another broker account. You must first stop all running scripts before starting a new one.
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            </React.Fragment>
        );
    }
}

export default StartFailed;