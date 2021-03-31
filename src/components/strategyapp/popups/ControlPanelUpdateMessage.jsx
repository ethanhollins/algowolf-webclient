import React, { Component } from 'react';

class ControlPanelUpdateMessage extends Component
{

    render()
    {
        return(
            <React.Fragment>
            
            <div className='popup header'>
                <span>{this.props.getPopup().title}</span>
            </div>
            <div className='popup content'>
                <div className='popup main'>
                    <div className='popup main-list'>
                        <div className='not-available body'>
                            <div className='start-failed message'>
                                {this.props.getPopup().message}
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

export default ControlPanelUpdateMessage;