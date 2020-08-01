import React, { Component } from 'react';

class Study extends Component 
{
    state = {
        pos: {
            x:0, y:0
        },
        scale: {
            x:0, y:0
        },
        interval: 0,
        is_move: false
    }

    componentDidMount()
    {
        window.addEventListener("mousemove", this.onMouseMove.bind(this));

        this.setStudyProperties();
    }

    componentDidUpdate()
    {

    }

    render()
    {
        return <React.Fragment />;
    }

    onMouseMove(e)
    {
        const { is_move } = this.state;
        const LOCK = true;
        if (is_move && !LOCK)
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
            for (let j = 0; j < values[i].length; j++)
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

    setPriceInterval()
    {
        const camera = this.props.getCamera();
        const seg_size = this.props.getSegmentSize(this.getWindowIndex());
        let { scale, interval } = this.state;
        const chart_scale = this.props.getScale();
        scale.x = chart_scale.x;

        const min_dist = 100;
        const possible_intervals = [1, 2, 5, 10];

        const min_world_dist = camera.convertScreenUnitToWorldUnit(
            { x: 0, y: min_dist }, seg_size, scale
        );
        const decimals = this.props.getNumZeroDecimals(min_world_dist.y);
        
        let start = Math.ceil(min_world_dist.y * Math.pow(10, decimals+1));
        interval = possible_intervals.filter((x) => x >= start)[0] / Math.pow(10, decimals+1);

        this.setState({ interval }); 
    }

    draw() 
    {
        this.setPriceInterval();

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
                            ctx.moveTo(
                                first_pos.x + start_pos.x,
                                first_pos.y + start_pos.y
                            );
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

                    ctx.lineTo(
                        line_pos.x + start_pos.x, 
                        line_pos.y + start_pos.y
                    );
                }
                ctx.stroke();
            }
        }
    }

    drawPriceGrid(ctx)
    {
        const camera = this.props.getCamera();
        const { pos, scale } = this.state;
        const seg_size = this.props.getSegmentSize(this.getWindowIndex());
        const start_pos = this.props.getSegmentStartPos(this.getWindowIndex());
        const min_dist = 20;
        const possible_intervals = [1, 2, 5, 10];

        let min_world_dist = camera.convertScreenUnitToWorldUnit(
            { x:0, y:min_dist }, seg_size, scale
        ).y;
        const decimals = this.props.getNumZeroDecimals(min_world_dist);
        
        let start = Math.ceil(min_world_dist * Math.pow(10, decimals+1));
        const interval = possible_intervals.filter((x) => x >= start)[0] / Math.pow(10, decimals+1);

        // Calc start point
        let c_point = camera.convertScreenPosToWorldPos(
            { x:0, y:0 }, pos, seg_size, scale
        ).y + interval;
        c_point -= c_point % interval;

        // Calc end point
        const end_point = camera.convertScreenPosToWorldPos(
            { x:0, y:seg_size.height }, pos, seg_size, scale
        ).y;

        let data = [];
        while (c_point > end_point)
        {
            const screen_point = camera.convertWorldPosToScreenPos(
                { x:0, y: c_point }, pos, seg_size, scale
            );

            ctx.strokeStyle = `rgb(240, 240, 240)`;
            ctx.lineWidth = 0.9;

            ctx.beginPath();
            ctx.moveTo(
                0, start_pos.y + screen_point.y
                
            ); 
            ctx.lineTo(
                seg_size.width,
                start_pos.y + screen_point.y
            );
            ctx.stroke();

            data.push(c_point);

            c_point -= interval;
        }
        return data;
    }

    drawPrices(ctx, data)
    {
        if (data === undefined) return;

        const camera = this.props.getCamera();
        const { pos, scale } = this.state;
        const start_pos = this.props.getSegmentStartPos(this.getWindowIndex());
        const seg_size = this.props.getSegmentSize(this.getWindowIndex());

        // Font settings
        const font_size = 9;
        ctx.font = String(font_size) + 'pt trebuchet ms'; //Consolas
        ctx.fillStyle = 'rgb(80, 80, 80)';
        ctx.strokeStyle = 'rgb(255, 255, 255)';
        ctx.lineWidth = 2.0;
        ctx.textAlign = 'right';

        // Draw grid
        for (let i = 0; i < data.length; i++)
        {
            let c_y = data[i];

            let screen_y = camera.convertWorldPosToScreenPos(
                { x: 0, y: c_y }, pos, seg_size, scale
            ).y;
            
            ctx.strokeText(
                c_y.toFixed(5), 
                seg_size.width - 5, 
                start_pos.y + screen_y + (3/4 * (font_size/2))
            );
            ctx.fillText(
                c_y.toFixed(5), 
                seg_size.width - 5, 
                start_pos.y + screen_y + (3/4 * (font_size/2))
            );
        }

    }

    drawTimeGrid(ctx, data)
    {
        if (data === undefined) return;

        const camera = this.props.getCamera();
        const pos = this.props.getPos();
        const scale = this.props.getScale();
        const start_pos = this.props.getSegmentStartPos(this.getWindowIndex());
        const seg_size = this.props.getSegmentSize(this.getWindowIndex());

        // Draw grid
        for (let i = 0; i < data.length; i++)
        {
            const c_x = data[i];

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
        }
    }

    drawSeparator = (ctx) =>
    {
        const seg_size = this.props.getSegmentSize(this.getWindowIndex());
        const start_pos = this.props.getSegmentStartPos(this.getWindowIndex());

        // Separator Line
        ctx.clearRect(0, Math.round(start_pos.y)-1, seg_size.width, 2.0);
        ctx.fillStyle = `rgba(0, 0, 0,1.0)`;
        ctx.fillRect(0, Math.round(start_pos.y), seg_size.width, 1.0);
    }

    getPos = () =>
    {
        return this.state.pos;
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