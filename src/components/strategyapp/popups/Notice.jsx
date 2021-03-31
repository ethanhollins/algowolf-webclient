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
                                    As we have been upgrading the server, you may need to reconnect your broker and restart the script.
                                </p>
                                {/* <p>
                                    We're working on various enchancements to the platform and improving the performance of our server, as well as fixing some of the issues we've come across such as not saving the System Results correctly.
                                </p> */}
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