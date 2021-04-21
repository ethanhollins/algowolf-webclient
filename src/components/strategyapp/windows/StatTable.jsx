import React, { Component } from 'react';

class StatTable extends Component
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
                className="stat-table background"
            >
                {this.generateStatTable()}
            </div>
        );
    }

    generateStatTable()
    {
        let result = [];
        for (let i=0; i < this.props.datasets.length; i++)
        {
            const data = this.props.datasets[i];
            result.push(
                <div key={i} className="stat-table row">
                    <div className="stat-table cell left">{data.title}</div>
                    <div className="stat-table cell right">{data.value}</div>
                </div>
            );
        }

        return (
            <div className="stat-table parent">
                <div className="stat-table body">
                    {result}
                </div>
            </div>
        );
    }

}

export default StatTable;