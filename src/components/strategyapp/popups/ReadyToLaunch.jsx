import React, { Component } from 'react';
class ReadyToLaunch extends Component
{

    render()
    {
        return(
            <React.Fragment>
            
            {/* <div className='popup header'>
                <span>Join Closed Beta</span>
            </div> */}
            <div className='popup content'>
                <div className='popup main'>
                    <div className='popup main-list'>
                        <div className='beta-unavailable body'>
                            <div>
                                <div>
                                    <img className='beta-unavailable icon' src={process.env.PUBLIC_URL + this.props.getPopup().image} />
                                </div>
                            </div>
                            <span className='ready-to-launch message'>
                                You're ready to Start! After reviewing your <span id="sp_bold">Control Panel</span> settings on your <span id="sp_bold">broker's acccount</span>. Press the <span id="sp_bold">Start</span> button to begin.
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            </React.Fragment>
        );
    }

    onGotoDemo(e)
    {
        window.location = '/holygrail/demo';
    }
}

export default ReadyToLaunch;