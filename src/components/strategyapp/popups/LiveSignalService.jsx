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
                                Watch the Prison Paycheck setups in <span id="sp_bold">REAL TIME</span> with the <span id="sp_bold">LIVE Signal Charts</span> available <br/><span id="sp_bold">RIGHT HERE on WEDNESDAY!</span>
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