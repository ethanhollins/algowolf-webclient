import React, { Component } from 'react';

class SpreadSheet extends Component
{

    render()
    {   
        const data = this.getData();
        if (data !== null)
        {
            return (
                <div className='spreadsheet background'>
                    <div 
                        className='spreadsheet body header'
                    >
                        {this.generateColumnHeaders(data)}
                    </div>
                    <div className='spreadsheet body'>
                        {this.generateRows(data)}
                    </div>
                </div>
            );
        }
        else
        {
            return <React.Fragment />
        }
    }

    generateColumnHeaders(data)
    {
        let result = [];
        for (let i = 0; i < Object.keys(data).length+1; i++)
        {
            if (i === 0)
            {
                result.push(
                    <div key={i} className='spreadsheet cell index'></div>
                );
            }
            else
            {
                const header = Object.keys(data)[i-1];
                result.push(
                    <div key={i} className='spreadsheet cell header'>{header}</div>
                );
            }
        }
        return (
            <div className='spreadsheet row'>
                {result}
            </div>
        );
    }

    generateRows(data)
    {
        const num_cols = Object.keys(data).length+1;
        const num_rows = data[Object.keys(data)[0]].length;

        let result = [];
        for (let i = 0; i < num_rows; i++)
        {
            let row_result = [];
            for (let j = 0; j < num_cols; j++)
            {
                if (j === 0)
                {
                    row_result.push(
                        <div key={j} className='spreadsheet cell index'>{i+1}</div>
                    );
                }
                else
                {
                    const cell = data[Object.keys(data)[j-1]][i];
                    row_result.push(
                    <div key={j} className='spreadsheet cell item'>{cell}</div>
                    );
                }
            }
            result.push(
                <div key={i} className='spreadsheet row'>
                    {row_result}
                </div>
            );
        }

        return result;
    }
   
    getData = () =>
    {
        return this.props.data;
    }

}

export default SpreadSheet;