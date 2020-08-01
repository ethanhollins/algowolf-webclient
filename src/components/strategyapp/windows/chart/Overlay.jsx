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
        
        const values = this.props.getValues(this.props.index);
        const properties = this.props.getProperties(this.props.index);
        const limit = this.props.getLimit();

        // If empty values list, cancel drawing
        if (values.length === 0) return;
        // Iterate columns
        for (let i = 0; i < values.length; i++)
        {
            ctx.lineWidth = 1.5;

            let first_pos = null;

            // Iterate rows
            for (let y = 0; y < values[i][0].length; y++)
            {
                ctx.strokeStyle = properties.colors[i][y];
                ctx.beginPath();
                for (let x = 0; x < values[i].length; x++) 
                {
                    let x_pos = (values[i].length - x)+0.5;
                    if (limit[0] != null && (x < limit[0] || x > limit[1])) continue;
                    if (first_pos === null) 
                    {
                        if (values[i][x][y] !== null) 
                        {
                            // Move to first position
                            first_pos = camera.convertWorldPosToScreenPos(
                                { x: x_pos, y: values[i][x][y] },
                                pos, size, scale
                            );
                            ctx.moveTo(first_pos.x, first_pos.y);
                        }
                        continue
                    }

                    if (x_pos > pos.x + scale.x+1 || x_pos < pos.x-1 ) continue;

                    let i_val = values[i][x][y];
                    if (i_val === null) continue;

                    let line_pos = camera.convertWorldPosToScreenPos(
                        { x: x_pos, y: i_val },
                        pos, size, scale
                    );
                    ctx.lineTo(line_pos.x, line_pos.y);
                }
                ctx.stroke();
            }
        }
    }
}

export default Overlay;