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
                                    The server is currently undergoing maintenance and won't be available for today's trading session.
                                </p>
                                <p>
                                    We're working on various enchancements to the platform and improving the performance of our server, as well as fixing some of the issues we've come across such as not saving the System Results correctly.
                                </p>
                                <p>
                                    Sorry for this inconvenience. Please check back in tomorrow, as we will be up and running again. You may need to reconnect your broker and restart the script.
                                </p>
                                <p>
                                    Thank you for your help.
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