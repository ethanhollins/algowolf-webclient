import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUnlockAlt } from '@fortawesome/pro-regular-svg-icons';
class RequestDemoAccess extends Component
{

    constructor(props)
    {
        super(props);

        this.state = {
            hasRequested: this.props.getPopup().properties.hasRequested
        }
    }

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
                            {this.generateRequestAccessBtn()}
                        </div>
                    </div>
                </div>
            </div>

            </React.Fragment>
        );
    }

    async requestAccess()
    {
        const { REACT_APP_API_URL } = process.env;

        var requestOptions = {
            method: 'POST',
            headers: this.props.getHeaders(),
            credentials: 'include'
        };

        const res = await fetch(`${REACT_APP_API_URL}/v1/holygrail/${this.props.getUserId()}`, requestOptions);

        if (res.status === 200)
        {
            let { hasRequested } = this.state;
            hasRequested = true;
            this.setState({ hasRequested });
        }
    }

    generateRequestAccessBtn()
    {
        const { hasRequested } = this.state;
        if (hasRequested)
        {
            return (
                <div>
                    <div>
                        <img className='beta-unavailable icon' src={process.env.PUBLIC_URL + this.props.getPopup().image} />
                    </div>
                    <div className='sign-up-prompt message'>
                        <span id="sp_bold">Your request has been received.</span><br/>Please allow up to 24 hours for your request to be processed. Contact <a id="email_popup" href="mailto:admin@algowolf.com">admin@algowolf.com</a> if you're having any difficulties.
                    </div>
                </div>

            );
        }
        else
        {
            return (
                <React.Fragment>

                <div>
                    <div>
                        <img className='beta-unavailable icon' src={process.env.PUBLIC_URL + this.props.getPopup().image} />
                    </div>
                </div>

                <span className='sign-up-prompt message'>
                    To see the demo, click <span id="sp_bold">REQUEST ACCESS</span> once you've purchased the <span id="sp_bold">Prison Paycheck</span> course.
                </span>
                <div className="request-demo-access login field">
                    <div id="submit" className="login input" onClick={this.requestAccess.bind(this)}>
                        REQUEST ACCESS
                    </div>
                </div>

                </React.Fragment>
            );
        }
    }
}

export default RequestDemoAccess;