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
        const limit = this.props.getLimit();

        // If empty values list, cancel drawing
        if (values.length === 0) return;
        // Iterate columns
        for (let j = 0; j < values.length; j++)
        {
            if (this.props.index === 0) ctx.strokeStyle = `rgb(243, 156, 18)`;
            else ctx.strokeStyle = `rgb(46, 213, 115)`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();

            let first_pos = null;

            // Iterate rows
            for (let i = 0; i < values[j].length; i++) 
            {
                let x_pos = (values[j].length - i)+0.5;
                if (limit[0] != null && (i < limit[0] || i > limit[1])) continue;
                if (first_pos === null) 
                {
                    if (values[j][i] !== null) 
                    {
                        // Move to first position
                        first_pos = camera.convertWorldPosToScreenPos(
                            { x: x_pos, y: values[j][i] },
                            pos, size, scale
                        );
                        ctx.moveTo(first_pos.x, first_pos.y);
                    }
                    continue
                }

                if (x_pos > pos.x + scale.x+1 || x_pos < pos.x-1 ) continue;

                let i_val = values[j][i];
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

export default Overlay;