import React, { Component } from 'react';

class Tos extends Component
{

    render()
    {
        const { REACT_APP_FRONT_BASE_URL } = process.env;
        return(
            <React.Fragment>
            
            <div className='popup header'>
                <span>Accept Terms of Use</span>
            </div>
            <div className='popup content'>
                <div className='popup tos main'>
                    <div>By continuing, you acknowledge you have read and agree to the <a href={REACT_APP_FRONT_BASE_URL + "/tos"} target="_blank">Terms of Use</a> as well as <a href={REACT_APP_FRONT_BASE_URL + "/risk-disclosure"} target="_blank">Risk Disclosure</a>, <a href={REACT_APP_FRONT_BASE_URL + "/privacy-policy"} target="_blank">Privacy Policy</a>, <a href={REACT_APP_FRONT_BASE_URL + "/cookies-policy"} target="_blank">Cookies Policy</a></div>
                    <div className='popup tos accept-btn' onClick={this.onAccept.bind(this)}>Accept & Continue</div>
                </div>
            </div>

            </React.Fragment>
        );
    }

    async onAccept()
    {
        await this.props.updateTos();
        
        this.props.close();
        // const popup = {
        //     type: 'getting-started',
        //     size: {
        //         pixelWidth: 740,
        //         pixelHeight: 600
        //     },
        //     fade: true
        // };
        // this.props.setPopup(popup);
    }
}

export default Tos;