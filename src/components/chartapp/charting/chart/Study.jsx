import React, { Component } from 'react';

class Study extends Component 
{
    state = {
        pos: {
            y:0
        },
        scale: {
            y:0
        },
        is_move: false
    }

    componentDidMount()
    {
        window.addEventListener("mousemove", this.onMouseMove.bind(this));

        this.setStudyProperties();
    }

    render()
    {
        return <React.Fragment />;
    }

    onMouseMove(e)
    {
        const { is_move } = this.state;
        if (is_move)
        {
            const chart_scale = this.props.getScale();

            let { pos, scale } = this.state;
            const camera = this.props.getCamera();

            const screen_move = { x: -e.movementX, y: e.movementY };
            let move = camera.convertScreenUnitToWorldUnit(
                screen_move, this.props.getSegmentSize(this.getWindowIndex()),
                { x: chart_scale.x, y: scale.y }
            );
            
            pos.y += move.y;

            this.setState({ pos });
        }
    }

    setStudyProperties()
    {
        const values = this.props.getValues(this.props.index);
        let { pos, scale } = this.state;

        let hl = [null, null];
        for (let i = 0; i < values.length; i++)
        {
            for (let j = 0; j < values[0].length; j++)
            {
                let val = values[i][j];

                if (hl[0] == null || val > hl[0])
                    hl[0] = val;
                if (hl[1] == null || val < hl[1])
                    hl[1] = val;
            }
        }

        scale.y = (hl[0] - hl[1]);
        scale.y += scale.y * 0.1;
        const mid_point = Math.round((hl[0] + hl[1]) / 2 * 100000) / 100000;
        pos.y = mid_point;

        this.setState({ pos, scale });
    }

    move = (y) =>
    {
        let { pos } = this.state;
        
        // Check null params
        if (!y) y = pos.y;

        pos.y = y;
        this.setState({ pos });
    } 

    pan = (dy) => 
    {
        let { pos } = this.state;

        // Check null params
        if (!dy) dy = 0;

        pos.y += dy;
        // console.log(pos);
        this.setState({ pos });
    } 

    draw() 
    {
        let { pos, scale } = this.state;

        const camera = this.props.getCamera();
        const canvas = this.props.getCanvas();
        const ctx = canvas.getContext("2d");
        
        // Loop through portions and find
        
        const chart_pos = this.props.getPos();
        const start_pos = this.props.getSegmentStartPos(this.getWindowIndex());
        pos.x = chart_pos.x;
        
        const chart_scale = this.props.getScale();
        scale.x = chart_scale.x;
        
        const size = this.props.getSegmentSize(this.getWindowIndex());
        const values = this.props.getValues(this.props.index);
        const limit = this.props.getLimit();

        // If empty values list, cancel drawing
        if (values.length === 0) return;

        // Iterate columns
        for (let j = 0; j < values[0].length; j++) 
        {
            if (this.props.index === 0) ctx.strokeStyle = `rgb(30, 144, 255)`;
            else if (j === 0) ctx.strokeStyle = `rgb(142, 68, 173)`;
            else ctx.strokeStyle = `rgb(255, 71, 87)`;
            
            ctx.lineWidth = 1.5;
            ctx.beginPath();

            let first_pos = null;

            // Iterate rows
            for (let i = 0; i < values.length; i++) 
            {
                let x_pos = (values.length - i)+0.5;
                if (limit[0] != null && (i < limit[0] || i > limit[1])) continue;
                if (first_pos === null)
                {
                    if (values[i][j] !== null)
                    {
                        // Move to first position
                        first_pos = camera.convertWorldPosToScreenPos(
                            { x: x_pos, y: values[i][j] },
                            pos, size, scale
                        );
                        ctx.moveTo(
                            first_pos.x + start_pos.x,
                            first_pos.y + start_pos.y
                        );
                    }
                    continue
                }

                if (x_pos > pos.x + scale.x+1 || x_pos < pos.x-1 ) continue;
                
                let i_val = values[i][j];

                let line_pos = camera.convertWorldPosToScreenPos(
                    { x: x_pos, y: i_val },
                    pos, size, scale
                );

                ctx.lineTo(
                    line_pos.x + start_pos.x, 
                    line_pos.y + start_pos.y
                );
            }
            ctx.stroke();
        }

        // Separator Line
        ctx.clearRect(0, Math.round(start_pos.y)-1, size.width, 2.0);
        ctx.fillStyle = `rgba(160, 160, 160,1.0)`;
        ctx.fillRect(0, Math.round(start_pos.y), size.width, 1.0);
    }

    drawGrid(ctx, data, draw_times)
    {
        const camera = this.props.getCamera();
        const pos = this.props.getPos();
        const scale = this.props.getScale();
        const start_pos = this.props.getSegmentStartPos(this.getWindowIndex());
        const seg_size = this.props.getSegmentSize(this.getWindowIndex());

        // Font settings
        const font_size = 10;
        ctx.font = String(font_size) + 'pt trebuchet ms'; //Consolas
        ctx.fillStyle = 'rgb(80, 80, 80)';
        
        // Draw grid
        for (let i = 0; i < data.length; i++)
        {
            let c_x = data[i][0];
            let time = data[i][1];

            let screen_x = camera.convertWorldPosToScreenPos(
                { x: c_x+0.5, y: 0 }, pos, seg_size, scale
            ).x;

            ctx.strokeStyle = `rgb(240, 240, 240)`;
            ctx.lineWidth = 0.9;

            ctx.beginPath();
            ctx.moveTo(
                screen_x, start_pos.y
                
            ); 
            ctx.lineTo(
                screen_x,
                start_pos.y + seg_size.height
            );
            ctx.stroke();
            
            if (draw_times)
            {
                ctx.strokeStyle = 'rgb(255, 255, 255)';
                ctx.lineWidth = 2.0;
                ctx.strokeText(
                    time.format('ddd DD'), 
                    screen_x, 
                    (start_pos.y + seg_size.height) - 4
                );
                ctx.fillText(
                    time.format('ddd DD'), 
                    screen_x, 
                    (start_pos.y + seg_size.height) - 4
                );
            }
        }
    }

    getScale = () =>
    {
        return this.state.scale;
    }

    getIsMove = () =>
    {
        return this.state.is_move;
    }

    getWindowIndex = () =>
    {
        return this.props.index + 1;
    }

    setIsMove = (x) =>
    {
        let { is_move } = this.state;
        is_move = x;
        this.setState({ is_move });
    }

}

export default Study;