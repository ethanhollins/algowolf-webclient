import React, { Component } from 'react';

class Dockable extends Component
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
            <div className='dockable background'>
                <div className='dockable header'>
                    <span>{this.generateTitle()}</span>
                </div>
                {this.generateWindow()}
            </div>
        );
    }

    generateTitle()
    {
        return this.props.window.props.title;
    }

    generateWindow()
    {
        return this.props.window;
    }
}

export default Dockable;