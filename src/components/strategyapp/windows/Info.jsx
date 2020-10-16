import React, { Component } from 'react';

class Info extends Component
{
    constructor(props)
    {
        super(props);

        this.setInfoBodyRef = elem => {
            this.infoBody = elem;
        }
    }

    render()
    {
        return (
            <div className='info background'>
                <div ref={this.setInfoBodyRef} className='info body'>
                    {this.generateInfo()}
                </div>
            </div>
        );
    }

    generateInfo()
    {
        // Get current hovered timestamp

        // Generate default info, check settings for visible items

        // Check for info at timestamp
    }
}

export default Info;