import React, { Component } from 'react';

class Notice extends Component
{

    render()
    {
        return(
            <React.Fragment>
            
            <div className='popup header'>
                <span>Important Notice</span>
            </div>
            <div className='popup content'>
                <div className='popup main'>
                    <div className='popup main-list'>
                        <div className='welcome body'>
                            <div className='welcome message'>
                                <h2>Hi there.</h2>
                                <p>
                                    The server has undergone some upgrades to fix some of the issues we were having with saving System Results, and improve your overall experience.
                                </p>
                                <p>
                                    Unfortunately this means you may need to reconnect your broker and restart the script.
                                </p>
                                
                                <p>
                                    To do this, simply click on <span id='sp_bold'>My Brokers</span> in the main menu and click <span id='sp_bold'>Add Broker</span> to connect your broker again.
                                </p>
                                <p>
                                    Sorry for the inconvenience. 
                                </p>
                                <p>
                                    <span id='sp_bold'>The AlgoWolf Team.</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            </React.Fragment>
        );
    }
}

export default Notice;