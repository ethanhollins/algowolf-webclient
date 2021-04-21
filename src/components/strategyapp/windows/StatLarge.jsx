import React, { Component } from 'react';

class StatLarge extends Component
{
    constructor(props)
    {
        super(props);

        this.update = this.update.bind(this);

        
    }

    componentDidMount()
    {
        window.addEventListener("resize", this.update);

        this.getStat();
    }

    componentDidUpdate()
    {
        this.update();
    }

    componentWillUnmount()
    {
        window.removeEventListener("resize", this.update);
    }

    render()
    {
        return (
            <div 
                ref={this.setBackgroundRef}
                className="stat-large background"
            >
                {this.generateStatLarge()}
            </div>
        );
    }

    update()
    {

    }

    getStat()
    {

    }

    generateStatLarge()
    {
        return (
            <div className="stat-large body">
                <div className="stat-large header">{this.props.title}</div>
                <div className="stat-large stat-text">{this.props.value}</div>
            </div>
        );
    }

}

export default StatLarge;