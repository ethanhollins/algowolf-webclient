import React, { Component } from 'react';

class StartFailed extends Component
{

    render()
    {
        return(
            <React.Fragment>
            
            <div className='popup header'>
                <span>Account Limit Exceeded</span>
            </div>
            <div className='popup content'>
                <div className='popup main'>
                    <div className='popup main-list'>
                        <div className='not-available body'>
                            <div className='start-failed message'>
                                You can only <strong>Start</strong> on {this.props.getPopup().account_limit} account(s) at a time.
                                Please <strong>Stop</strong> a running account before starting a new one.
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