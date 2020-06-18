import React, { Component } from 'react';

class Candlesticks extends Component
{
    render()
    {
        return <React.Fragment/>;
    }

    async draw()
    {   
        const camera = this.props.getCamera();
        const canvas = this.props.getCanvas();
        const ctx = canvas.getContext("2d");

        const pos = this.props.getPos();
        const scale = this.props.getScale();
        const size = this.props.getSegmentSize(0);
        
        const ohlc = this.props.getBids();
        const limit = this.props.getLimit();

        for (let i = 0; i < ohlc.length; i++) 
        {
            let x_pos = (ohlc.length - i)+0.5;
            if (limit[0] != null && (i < limit[0] || i > limit[1])) continue;
            if (x_pos > pos.x + scale.x+1 || x_pos < pos.x-1 ) continue;
            let candle = ohlc[i];

            // Calc Body
            let body_pos = (candle[0] + candle[3]) / 2
            body_pos = camera.convertWorldPosToScreenPos(
                { x: x_pos, y: body_pos },
                pos, size, scale
            );
            let body_size = Math.abs(candle[0] - candle[3]);
            body_size = camera.convertWorldUnitToScreenUnit(
                { x: 0.8, y: body_size },
                size, scale
            );

            // Calc Wicks
            let wick_up_size;
            let wick_down_size;
            
            if (candle[0] > candle[3]) 
            {
                ctx.fillStyle = "rgb(235, 59, 90)";
                ctx.strokeStyle = "rgb(235, 59, 90)";
                ctx.lineWidth = 0.5;

                wick_up_size = candle[1] - candle[0];
                wick_up_size = camera.convertWorldUnitToScreenUnit(
                    { x: 0, y: wick_up_size },
                    size, scale
                );

                wick_down_size = candle[3] - candle[2];
                wick_down_size = camera.convertWorldUnitToScreenUnit(
                    { x: 0, y: wick_down_size },
                    size, scale
                );

            }
            else 
            {
                ctx.fillStyle = "rgb(32, 191, 107)";
                ctx.strokeStyle = "rgb(32, 191, 107)";
                ctx.lineWidth = 0.5;

                wick_up_size = candle[1] - candle[3];
                wick_up_size = camera.convertWorldUnitToScreenUnit(
                    { x: 0, y: wick_up_size },
                    size, scale
                );

                wick_down_size = candle[0] - candle[2];
                wick_down_size = camera.convertWorldUnitToScreenUnit(
                    { x: 0, y: wick_down_size },
                    size, scale
                );
            }

            const c_x = Math.round(body_pos.x - body_size.x / 2);
            const c_y = Math.round(body_pos.y - body_size.y / 2);
            
            const w_x = Math.round(body_pos.x);
            const w_width = 1.0;
            
            // Draw Body
            ctx.fillRect(
                c_x, c_y,
                Math.round(body_size.x),
                Math.round(body_size.y)
            );
                
            // Draw Wick Up
            const w_up_y = Math.round(body_pos.y - body_size.y/2)+1;
            ctx.fillRect(
                w_x, w_up_y - Math.round(wick_up_size.y),
                w_width, Math.round(wick_up_size.y)
            );

            // Draw Wick Down
            const w_down_y = Math.round(body_pos.y + body_size.y / 2)-1;
            ctx.fillRect(
                w_x, w_down_y,
                w_width, Math.round(wick_down_size.y)
            );
        }
    }
}

export default Candlesticks;