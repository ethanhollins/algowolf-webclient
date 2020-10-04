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
        
        const current_timestamp = this.props.getCurrentTimestamp();
        const ohlc = this.props.getBids();
        const timestamps = this.props.getTimestamps();
        const info = this.props.getWindowInfo();

        for (let i = 0; i < ohlc.length; i++) 
        {
            let x_pos = (ohlc.length - i)+0.5;
            if (x_pos > pos.x + scale.x+1 || x_pos < pos.x-1 ) continue;
            
            let candle = ohlc[i];
            if (candle.every((x) => x===0)) continue;

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
            
            // Colors
            let opacity;
            if (current_timestamp !== null && timestamps[i] > current_timestamp)
            {
                opacity = 0.2;
            }
            else
            {
                opacity = 1.0;
            }
            
            let body_color;
            let outline_color;
            let wick_color;

            if (candle[0] > candle[3]) 
            {
                body_color = info.properties.bars.bodyShort;
                body_color = `rgba(${body_color[0]}, ${body_color[1]}, ${body_color[2]}, ${opacity})`
                outline_color = info.properties.bars.outlineShort;
                outline_color = `rgba(${outline_color[0]}, ${outline_color[1]}, ${outline_color[2]}, ${opacity})`
                wick_color = info.properties.bars.wickShort;
                wick_color = `rgba(${wick_color[0]}, ${wick_color[1]}, ${wick_color[2]}, ${opacity})`
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
                body_color = info.properties.bars.bodyLong;
                body_color = `rgba(${body_color[0]}, ${body_color[1]}, ${body_color[2]}, ${opacity})`
                outline_color = info.properties.bars.outlineLong;
                outline_color = `rgba(${outline_color[0]}, ${outline_color[1]}, ${outline_color[2]}, ${opacity})`
                wick_color = info.properties.bars.wickLong;
                wick_color = `rgba(${wick_color[0]}, ${wick_color[1]}, ${wick_color[2]}, ${opacity})`
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
            const c_y = Math.max(body_pos.y - body_size.y / 2);
            
            const w_x = Math.round(body_pos.x);
            const w_width = 1.0;
            
            ctx.fillStyle = wick_color;
            // Draw Wick Up
            if (scale.x < 500)
            {
                const w_up_y = Math.round(body_pos.y - body_size.y/2)+1;
                ctx.fillRect(
                    w_x, w_up_y - Math.round(wick_up_size.y),
                    Math.max(w_width, 1), Math.max(Math.round(wick_up_size.y), 1)
                );
    
                // Draw Wick Down
                const w_down_y = Math.round(body_pos.y + body_size.y / 2)-1;
                ctx.fillRect(
                    w_x, w_down_y,
                    Math.max(w_width, 1), Math.max(Math.round(wick_down_size.y), 1)
                );
            }

            ctx.fillStyle = body_color;
            ctx.strokeStyle = outline_color;
            // Draw Body
            ctx.fillRect(
                Math.round(c_x), Math.round(c_y),
                Math.max(Math.round(body_size.x), 1),
                Math.max(Math.round(body_size.y), 1)
            );

            if (scale.x < 500)
            {
                ctx.strokeRect(
                    Math.round(c_x)+0.5, Math.round(c_y)-0.5,
                    Math.max(Math.round(body_size.x), 1),
                    Math.max(Math.round(body_size.y), 1)
                );
            }

        }
    }
}

export default Candlesticks;