import React, { Component } from 'react';
import moment from "moment-timezone";

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
            <div className='log background'>
                <div className='log header'>
                    <span>Info</span>
                </div>
                <div className='info body-background'>
                    <div ref={this.setInfoBodyRef} className='info body'>
                        {this.generateInfo()}
                    </div>
                </div>
            </div>
        );
    }

    generateInfo()
    {
        
    }
}

export default Info;