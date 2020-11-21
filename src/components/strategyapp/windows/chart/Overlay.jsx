import React, { Component } from 'react';

class Overlay extends Component
{

    render()
    {
        return <React.Fragment/>;
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
        const values = this.props.getValues(this.props.index);
        const properties = this.props.getProperties(this.props.index);
        // If empty values list, cancel drawing
        if (values.length === 0) return;
        // Iterate columns

        try
        {
            for (let i = 0; i < values.length; i++)
            {
                ctx.lineWidth = 2;
                let current_pos = null;
    
                // Iterate rows
                for (let y = 0; y < values[i][0].length; y++)
                {
                    let c_x = -1;
                    const color = properties.colors[i][y];
                    let is_future = false;
    
                    ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1.0)`;
                    ctx.beginPath();
                    for (let x = 0; x < ohlc.length; x++) 
                    {
                        if (ohlc[x][0] !== null) c_x += 1;
                        if (x === 0) c_x = 0;
    
                        let x_pos = (ohlc.length - x)+0.5;
                        if (x_pos > pos.x + scale.x+1 || current_pos === null)
                        {
                            if (ohlc[x][0] !== null && values[i][c_x][y] !== null) 
                            {
                                // Move to first position
                                current_pos = camera.convertWorldPosToScreenPos(
                                    { x: x_pos, y: values[i][c_x][y] },
                                    pos, size, scale
                                );
                                ctx.moveTo(current_pos.x, current_pos.y);
                            }
                            continue
                        }
    
                        if (values[i][c_x] === undefined) continue;
                        
                        let i_val = values[i][c_x][y];
                        if (i_val === null || ohlc === undefined || ohlc[x][0] === null) continue;
    
                        if (!is_future && current_timestamp !== null && timestamps[x] + period_offset > current_timestamp)
                        {
                            is_future = true;
                            ctx.stroke();
                            ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.2)`;
                            ctx.beginPath();
                            ctx.moveTo(current_pos.x, current_pos.y);
                        }
    
                        current_pos = camera.convertWorldPosToScreenPos(
                            { x: x_pos, y: i_val },
                            pos, size, scale
                        );
                        ctx.lineTo(current_pos.x, current_pos.y);
    
                        if (x_pos < pos.x-1) break;
    
                    }
                    ctx.stroke();
                }
            }
        }
        catch (e) {}
    }
}

export default Overlay;