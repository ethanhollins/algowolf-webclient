import React, { Component } from 'react';
import moment from "moment-timezone";

class SpreadSheet extends Component
{

    constructor(props)
    {
        super(props);

        this.setBackgroundRef = elem => {
            this.background = elem;
        }
        this.setBodyRef = elem => {
            this.body = elem;
        }

        this.onMouseMoveThrottled = this.onMouseMoveThrottled.bind(this);
    }

    render()
    {   
        const data = this.getData();
        if (data !== null)
        {
            return (
                <div 
                    ref={this.setBackgroundRef}
                    className='spreadsheet background'
                >
                    <div className='spreadsheet body header'>
                        {this.generateColumnHeaders(data)}
                    </div>
                    <div 
                        ref={this.setBodyRef}
                        className='spreadsheet body'
                    >
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

    onMouseMoveThrottled(mouse_pos)
    {
        mouse_pos = { x: mouse_pos.x, y: mouse_pos.y - this.props.getTopOffset() };
        const is_top = this.props.isTopWindow(
            this.props.strategy_id, this.props.item_id, mouse_pos
        );

        if (
            is_top && this.props.getHeader() !== undefined && 
            this.body !== undefined && this.background !== undefined
        )
        {
            // Does Horizontal Scrollbar Exist
            const scroll_width = 5;
            if (this.body.clientWidth > this.background.clientWidth)
            {
                const scroll_y = this.props.getHeader().clientHeight + this.props.getWindowScreenPos().y + this.background.clientHeight + 1;
                if (mouse_pos.y > scroll_y && mouse_pos.y <= scroll_y + scroll_width)
                {
                    if (!this.props.getScrollbarHovered())
                    {
                        this.props.setScrollbarHovered(true);
                    }
                }
                else
                {
                    if (this.props.getScrollbarHovered())
                    {
                        this.props.setScrollbarHovered(false);
                    }
                }
            }
            
            if (this.body.clientHeight > this.background.clientHeight)
            {
                const scroll_y = this.props.getWindowScreenPos().y + this.props.getHeader().clientHeight;
                const scroll_x = this.props.getWindowScreenPos().x + this.background.clientWidth + 1;
                if (mouse_pos.y > scroll_y && mouse_pos.x >= scroll_x && mouse_pos.x <= scroll_x + scroll_width)
                {
                    if (!this.props.getScrollbarHovered())
                    {
                        this.props.setScrollbarHovered(true);
                    }
                }
                else
                {
                    if (this.props.getScrollbarHovered())
                    {
                        this.props.setScrollbarHovered(false);
                    }
                }
            }
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
        if (Object.keys(data).length > 0)
        {
            const num_cols = Object.keys(data).length+1;
            const num_rows = data[Object.keys(data)[0]].length+1;
    
            const format = this.props.format;
    
            let r_profit = 0;
            let old_exit = 0;
    
            let result = [];
            for (let i = 0; i < num_rows; i++)
            {
                let row_result = [];
                for (let j = 0; j < num_cols; j++)
                {
                    // TEMP
                    if (i === num_rows-1)
                    {
                        if (j === 0)
                        {
                            row_result.push(
                                <div key={j} className='spreadsheet cell index'>Totals</div>
                            );
                        }
                        else
                        {
                            const col_name = Object.keys(data)[j-1];
                            if (col_name === 'R Profit')
                            {
                                row_result.push(
                                    <div key={j} className='spreadsheet cell item'><div><strong>{r_profit.toFixed(2)}</strong></div></div>
                                );
                            }
                            else if (col_name === 'Old Exit Alg')
                            {
                                row_result.push(
                                    <div key={j} className='spreadsheet cell item'><div><strong>{old_exit.toFixed(2)}</strong></div></div>
                                );
                            }
                            else
                            {
                                row_result.push(
                                    <div key={j} className='spreadsheet cell item'><div></div></div>
                                );
                            }
                        }
                    }
                    else
                    {
                        if (j === 0)
                        {
                            row_result.push(
                                <div key={j} className='spreadsheet cell index'>{i+1}</div>
                            );
                        }
                        else
                        {
                            const col_name = Object.keys(data)[j-1];
                            const cell = data[col_name][i];
                            
                            // TEMP
                            if (col_name === 'R Profit')
                            {
                                r_profit += parseFloat(cell);
                            }
                            else if (col_name === 'Old Exit Alg')
                            {
                                old_exit += parseFloat(cell);
                            }
    
    
                            if (col_name in format)
                            {
                                if (format[col_name].type !== undefined)
                                {
                                    // Date Type
                                    if (format[col_name].type === 'date')
                                    {
                                        const time = moment(cell, moment.ISO_8601, true);
                                        if (time.isValid())
                                        {
                                            if (format[col_name].format !== undefined)
                                            {
                                                row_result.push(
                                                    <div 
                                                        key={j} name={cell}
                                                        className='spreadsheet cell item link'
                                                        onClick={this.onTime.bind(this)}
                                                    >
                                                        <div>{time.format(format[col_name].format)}</div>
                                                    </div>
                                                );
                                            }
                                            else
                                            {
                                                row_result.push(
                                                    <div 
                                                        key={j} name={cell}
                                                        className='spreadsheet cell item link' 
                                                        onClick={this.onTime.bind(this)}
                                                    >
                                                        <div>{time}</div>
                                                    </div>
                                                );
                                            }
        
                                            continue;
                                        }
                                    }
        
                                }
                            }
        
                            // Default Type
                            row_result.push(
                                <div key={j} className='spreadsheet cell item'><div>{String(cell)}</div></div>
                            );
                        }
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
    }
   
    getData = () =>
    {
        return this.props.data;
    }

    onTime = (e) =>
    {
        const time = moment(e.target.getAttribute('name'), moment.ISO_8601, true);
        this.props.setCurrentTimestamp(time.unix());
        this.props.setChartPositionsByTimestamp(time.unix());
    }

}

export default SpreadSheet;