import React, { Component } from 'react';

class HeaderBlock extends Component
{
    constructor(props)
    {
        super(props);
    }

    render()
    {
        return (
            <div 
                ref={this.setBackgroundRef}
                className="header-block background"
            >
                <div className="header-block header">{this.props.title}</div>
                <div className="header-block description">{this.props.description}</div>
            </div>
        );
    }

}

export default HeaderBlock;