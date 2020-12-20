import React, { Component } from 'react';

class EmailSubscribe extends Component
{

    state = {
        email: '',
        error: ''
    }

    render()
    {
        return(
            <React.Fragment>
            
            <div className='popup header'>
                <span>Get Notified!</span>
            </div>
            <div className='popup content'>
                <div className='popup main'>
                    <div className='popup main-list'>
                        <div className='email-subscribe body'>
                            <div className='email-subscribe message'>
                                Subscribe for email updates on the progress and availability of our services.
                            </div>
                            <div className='popup input'>
                                <input 
                                    className='popup text-input' placeholder='e.g. johndoe@example.com'
                                    onChange={this.onTextInputChange.bind(this)}
                                />
                            </div>
                            <div className='popup center' onClick={this.onSubscribe.bind(this)}>
                                <div className='popup broker-btn'>Subscribe</div>
                            </div>
                            <div className='popup center'>
                                <div className='email-subscribe message error'>{this.state.error}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            </React.Fragment>
        );
    }

    validateEmail(email) 
    {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    onTextInputChange(e)
    {
        const email = e.target.value;
        this.setState({ email });
    }

    onSubscribe()
    {
        let { email, error } = this.state;
        if (this.validateEmail(email))
        {
            this.props.subscribeEmail(email);
            this.props.close();

            const popup = {
                type: 'email-subscribe-complete',
                size: {
                    width: 30,
                    height: 25
                },
                fade: true,
                email: email
            }
            this.props.setPopup(popup);
        }
        else
        {
            error = 'This is not a valid email address.';
            this.setState({ error });
        }
    }
}

export default EmailSubscribe;