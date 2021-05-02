import React, { Component } from 'react';

class BtnBlock extends Component
{
    render()
    {
        return (
            <div className="btn-block background">
                <a 
                    className="btn-block value" 
                    href={this.props.link}
                    target="_blank"
                >
                    {this.props.value}
                </a>
            </div>
        );
    }

}

export default BtnBlock;