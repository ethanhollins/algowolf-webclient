import React, { Component } from 'react';

class Overlay extends Component
{
    state = {
        values: [],
        x_pos: 1
    }

    componentDidMount()
    {
        this.setValues();
    }

    render()
    {
        return <React.Fragment/>;
    }

    setValues = () =>
    {
        const ohlc = this.props.getOhlcValues();
        const ind_values = this.props.getValues(this.props.index);

        let { values } = this.state;
        values = [];
        let c_idx = 0;
        for (let x = 0; x < ind_values.length; x++)
        {
            values.push([]);
            for (let i = 0; i < ohlc.length; i++)
            {
                if (ohlc[i][0] === null)
                {
                    values[x].push(Array.apply(null, Array(ind_values[0][0].length)).map(x => null));
                }
                else
                {
                    values[x].push(ind_values[x][c_idx]);
                    c_idx += 1;
                }
            }
        }

        this.setState({ values });
    }

    draw()
    {   
        const camera = this.props.getCamera();
        const canvas = this.props.getCanvas();
        const ctx = canvas.getContext("2d");
        
        const pos = this.props.getPos();
        const scale = this.props.getScale();
        const size = this.props.getSegmentSize(0);
        
        const current_timestamp = this.props.getCurrentTimestamp();
        const period_offset = this.props.getPeriodOffsetSeconds(this.props.getPeriod());
        const timestamps = this.props.getTimestamps();
        const ohlc = this.props.getOhlcValues();
        const ind_values = this.props.getValues(this.props.index);
        const properties = this.props.getProperties(this.props.index);

        let { values } = this.state;
        
        // If empty values list, cancel drawing
        if (ind_values.length === 0) return;
        
        values = [];

        let x_pos;
        // Iterate columns
        for (let i = 0; i < ind_values.length; i++)
        {
            ctx.lineWidth = 1.5;
            let current_pos = null;
            
            values.push([]);

            // Iterate rows
            if (ind_values[i].length > 0)
            {
                for (let y = 0; y < ind_values[i][0].length; y++)
                {
                    let c_x = -1;
                    const color = properties.colors[i][y];
                    let is_future = false;
    
                    ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1.0)`;
                    ctx.beginPath();
                    for (let x = 0; x < ohlc.length; x++) 
                    {
                        if (ohlc[x][0] !== null)
                        {
                            c_x += 1;
                            values[i].push(ind_values[i][c_x]);
                        } 
                        else
                        {
                            values[i].push(Array.apply(null, Array(ind_values[0][0].length)).map(x => null));
                        }
                        if (x === 0) c_x = 0;
    
                        x_pos = (ohlc.length - x)+0.5;
                        if (x_pos > pos.x + scale.x+1 || current_pos === null)
                        {
                            if (ohlc[x][0] !== null && ind_values[i][c_x][y] !== null) 
                            {
                                // Move to first position
                                current_pos = camera.convertWorldPosToScreenPos(
                                    { x: x_pos, y: ind_values[i][c_x][y] },
                                    pos, size, scale
                                );
                                ctx.moveTo(Math.floor(current_pos.x), Math.floor(current_pos.y));
                            }
                            continue
                        }
    
                        if (ind_values[i][c_x] === undefined) continue;
                        
                        let i_val = ind_values[i][c_x][y];
                        if (i_val === null || ohlc === undefined || ohlc[x][0] === null) continue;
    
                        if (!is_future && current_timestamp && timestamps[x] + period_offset > current_timestamp)
                        {
                            is_future = true;
                            ctx.stroke();
                            ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.2)`;
                            ctx.beginPath();
                            ctx.moveTo(current_pos.x, current_pos.y);
                        }
    
                        current_pos = camera.convertWorldPosToScreenPos(
                            { x: x_pos, y: Math.round(i_val * 100000) / 100000 },
                            pos, size, scale
                        );
                        ctx.lineTo(Math.floor(current_pos.x), Math.floor(current_pos.y));
    
                        if (x_pos < pos.x-1) break;
    
                    }
                    ctx.stroke();
                }
            }
        }

        this.setState({ values, x_pos });
    }

    getValue = (x) =>
    {
        const { values, x_pos } = this.state;
        const result = [];
        for (let i = 0; i < values.length; i++)
        {
            result.push(values[i][values[i].length-x+Math.max(Math.floor(x_pos)-1, 0)]);
        }
        return result;
    }
}

export default Overlay;