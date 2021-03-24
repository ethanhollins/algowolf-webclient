import React, { Component } from 'react';

class LiveSignalService extends Component
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
                            <span className='beta-unavailable message'>
                                Watch the Prison Paycheck setups in real time with the <span id="sp_bold">LIVE Signal Service</span> available on this page early next week.
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            </React.Fragment>
        );
    }

    generateGotoDemoBtn()
    {
        if (!this.props.isDemo)
        {
            return (
                <div className="login field">
                    <div id="submit" className="login input" onClick={this.onGotoDemo.bind(this)}>
                        GOTO DEMO
                    </div>
                </div>
            );
        }
    }

    onGotoDemo(e)
    {
        window.location = '/holygrail/demo';
    }
}

export default LiveSignalService;