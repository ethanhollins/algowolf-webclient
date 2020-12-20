import React, { Component } from 'react';

class EmailSubscribe extends Component
{

    render()
    {
        return(
            <React.Fragment>
            
            <div className='popup header'>
                <span>Thanks!</span>
            </div>
            <div className='popup content'>
                <div className='popup main'>
                    <div className='popup main-list'>
                        <div className='email-subscribe body'>
                            <div className='email-subscribe message'>
                                You have successfully subscribed {this.props.getPopup().email}.
                            </div>
                            <div className='popup center' onClick={this.onOk.bind(this)}>
                                <div className='popup broker-btn'>Ok</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            </React.Fragment>
        );
    }

    onOk()
    {
        this.props.close();
    }
    
}

export default EmailSubscribe;