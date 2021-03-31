import React, { Component } from 'react';

class StartFailed extends Component
{

    render()
    {
        return(
            <React.Fragment>
            
            <div className='popup header'>
                <span>Strategy Already Running</span>
            </div>
            <div className='popup content'>
                <div className='popup main'>
                    <div className='popup main-list'>
                        <div className='not-available body'>
                            <div className='start-failed message'>
                                You can only run this strategy on one account. Please stop all running accounts before starting the script.
                            </div>
                            <div className='info close-btn' onClick={this.props.close}>
                                OK
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            </React.Fragment>
        );
    }
}

export default StartFailed;