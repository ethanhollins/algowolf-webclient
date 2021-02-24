import React, { Component } from 'react';

class AreYouSure extends Component
{

    render()
    {
        return(
            <React.Fragment>
            
            <div className='popup header'>
                <span>Are You Sure</span>
            </div>
            <div className='popup content'>
                <div className='popup main'>
                    <div className='popup main-list'>
                        <div className='are-you-sure body'>
                            <div className='are-you-sure message'>{this.props.getPopup().message}</div>
                            <div className='are-you-sure btn-group'>
                                <div className='are-you-sure btn' onClick={this.onYes.bind(this)}>Yes</div>
                                <div className='are-you-sure btn' onClick={this.onNo.bind(this)}>No</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            </React.Fragment>
        );
    }

    onYes()
    {
        this.props.getPopup().func();
        this.props.close();
        // console.log(this.props.getPopup());
    }

    onNo()
    {
        this.props.close();
    }
}

export default AreYouSure;