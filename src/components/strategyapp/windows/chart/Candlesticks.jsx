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
        const period_offset = this.props.getPeriodOffsetSeconds(this.props.getPeriod());
        const ohlc = this.props.getOhlc();
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
            if (current_timestamp !== null && timestamps[i] + period_offset > current_timestamp)
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
                body_color = this.getBodySettings()['short'] + parseInt(255 * opacity).toString(16);
                // console.log(body_color);
                outline_color = this.getOutlineSettings()['short'] + parseInt(255 * opacity).toString(16);
                wick_color = this.getWickSettings()['short'] + parseInt(255 * opacity).toString(16);
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
                body_color = this.getBodySettings()['long'] + parseInt(255 * opacity).toString(16);
                outline_color = this.getOutlineSettings()['long'] + parseInt(255 * opacity).toString(16);
                wick_color = this.getWickSettings()['long'] + parseInt(255 * opacity).toString(16);
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

            const c_x = body_pos.x - body_size.x / 2;
            const c_y = body_pos.y - body_size.y / 2;
            
            const w_x = body_pos.x;
            const w_width = 1.0;
            
            ctx.fillStyle = wick_color;
            // Draw Wick Up
            if (scale.x < 500)
            {
                const w_up_y = body_pos.y - body_size.y/2 + 1;
                ctx.fillRect(
                    Math.floor(w_x), Math.floor(w_up_y - wick_up_size.y),
                    Math.floor(Math.max(w_width, 1)), Math.floor(Math.max(wick_up_size.y, 1))
                );
    
                // Draw Wick Down
                const w_down_y = body_pos.y + body_size.y / 2 - 1;
                ctx.fillRect(
                    Math.floor(w_x), Math.floor(w_down_y),
                    Math.floor(Math.max(w_width, 1)), Math.floor(Math.max(wick_down_size.y, 1))
                );
            }

            ctx.fillStyle = body_color;
            ctx.strokeStyle = outline_color;
            // Draw Body
            ctx.fillRect(
                Math.floor(c_x), Math.floor(c_y),
                Math.floor(Math.max(body_size.x, 1)),
                Math.floor(Math.max(body_size.y, 1))
            );

            if (scale.x < 500)
            {
                ctx.strokeRect(
                    Math.floor(c_x)+0.5, Math.floor(c_y)-0.5,
                    Math.floor(Math.max(body_size.x, 1)),
                    Math.floor(Math.max(body_size.y, 1))
                );
            }

        }
    }

    getBodySettings = () =>
    {
        return this.props.getSettings()['chart-settings'].layouts[this.props.getChartSettingsLayout()].appearance['body'];
    }

    getOutlineSettings = () =>
    {
        return this.props.getSettings()['chart-settings'].layouts[this.props.getChartSettingsLayout()].appearance['outline'];
    }

    getWickSettings = () =>
    {
        return this.props.getSettings()['chart-settings'].layouts[this.props.getChartSettingsLayout()].appearance['wick'];
    }

}

export default Candlesticks;