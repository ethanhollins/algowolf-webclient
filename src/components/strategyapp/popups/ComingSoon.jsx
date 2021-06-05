import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSadTear } from '@fortawesome/pro-regular-svg-icons';
class ComingSoon extends Component
{

    render()
    {
        return(
            <React.Fragment>
            
            {/* <div className='popup header'>
                <span>Not Available</span>
            </div> */}
            <div className='popup content'>
                <div className='popup main'>
                    <div className='popup main-list'>
                        <div className='coming-soon body'>
                            <div>
                                <img className='coming-soon icon' src={process.env.PUBLIC_URL + '/coming_soon_icon.jpg'} />
                            </div>
                            <div className='coming-soon list'>
                                <div className='coming-soon list-point'>
                                    <img className='coming-soon small-icon' src={process.env.PUBLIC_URL + '/build_icon.jpg'} />
                                    <span>Build, Test, Go Live with your own strategies within minutes!</span>
                                </div>
                                <div className='coming-soon list-point'>
                                    <img className='coming-soon small-icon' src={process.env.PUBLIC_URL + '/magnify_icon.jpg'} />
                                    <span>Get Access to backtesting and optimization tools to give you the Hedge Fund Edge.</span>
                                </div>
                                <div className='coming-soon list-point'>
                                    <img className='coming-soon small-icon' src={process.env.PUBLIC_URL + '/bulb_icon.jpg'} />
                                    <span>Learn how to easily write your own trading algorithms with our FREE learning resources.</span>
                                </div>
                                <div className='coming-soon list-point'>
                                    <img className='coming-soon small-icon' src={process.env.PUBLIC_URL + '/medal_icon.jpg'} />
                                    <span>Choose from Top Performing algorithms to trade Live on your favorite broker.</span>
                                </div>
                            </div>
                            <div className='coming-soon btn' onClick={this.props.close}>
                                Go Back
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            </React.Fragment>
        );
    }
}

export default ComingSoon;