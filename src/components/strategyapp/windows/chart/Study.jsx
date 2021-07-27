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
        trans_x: 0,
        is_move: false,
        is_resize: false,
        values: [],
        x_pos: 1
    }

    constructor(props)
    {
        super(props);

        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
    }

    componentDidMount()
    {
        window.addEventListener("mousemove", this.onMouseMove);
        window.addEventListener("mouseup", this.onMouseUp);

        this.setStudyProperties();
        this.setValues();
        // let { pos, scale } = this.state;
        // const study_properties = this.getStudyProperties();
        // pos = study_properties.pos;
        // scale = study_properties.scale;
        // this.setState({ pos, scale });
    }

    componentWillUnmount()
    {
        window.removeEventListener("mousemove", this.onMouseMove);
        window.removeEventListener("mouseup", this.onMouseUp);
    }

    render()
    {
        return <React.Fragment />;
    }

    onMouseMove(e)
    {
        const { is_move, is_resize } = this.state;
        const LOCK = true;
        if (is_resize)
        {
            const screen_move = { x: e.movementX, y: e.movementY };
            const chart_size = this.props.getChartSize();
            
            this.props.resizePortion(this.props.index, -screen_move.y / chart_size.height)
        }
        else if (is_move && !LOCK)
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

    onMouseUp(e)
    {
        let { trans_x, is_resize } = this.state;
        trans_x = 0;
        is_resize = false;
        this.setState({ trans_x, is_resize });
    }

    getStudyProperties()
    {
        const chart_pos = this.props.getPos();
        const chart_scale = this.props.getScale();
        let pos = { x: chart_pos.x, y: this.state.pos.y };
        let scale = { x: chart_scale.x, y: this.state.scale.y };

        let hl = [null, null];

        let values = this.props.getValues(this.props.index);
        for (let x = 0; x < values.length; x++)
        {
            let counted = 0;
            let y = parseInt(pos.x);
            while (counted < Math.max(scale.x, 10) && y < values[x].length)
            {
                let val = values[x][values[x].length-1-y];
                y++;
                if (val === undefined) continue;
                for (let z = 0; z < val.length; z++)
                {
                    if (val[z] === undefined || val[z] === null) continue;
                    if (hl[0] == null || val[z] > hl[0])
                        hl[0] = val[z];
                    if (hl[1] == null || val[z] < hl[1])
                        hl[1] = val[z];
                    
                    if (z === 0) counted += 1;
                }
            }
        }

        if (hl.every((x) => x !== null))
        {
            scale.y = (hl[0] - hl[1]);
            const scale_off = scale.y;
            scale.y += scale_off;
            const mid_point = Math.round(parseFloat(hl[0] + hl[1]) / 2 * 100000) / 100000;
            pos.y = mid_point;
        }

        return {
            pos: pos,
            scale: scale
        }
    }

    setStudyProperties()
    {
        const study_props = this.getStudyProperties();
        let { pos, scale } = this.state;
        pos = { y: study_props.pos.y };
        scale = { y: study_props.scale.y };

        this.setState({ pos, scale });
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
        this.setState({ pos });
    } 

    setPriceInterval()
    {
        const camera = this.props.getCamera();
        const seg_size = this.props.getSegmentSize(this.getWindowIndex());
        let { interval } = this.state;
        const chart_scale = this.props.getScale();
        const scale = { x: chart_scale.x, y: this.state.y };

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
        const camera = this.props.getCamera();
        const canvas = this.props.getCanvas();
        const ctx = canvas.getContext("2d");
        
        // Loop through portions and find
        
        const chart_pos = this.props.getPos();
        const start_pos = this.props.getSegmentStartPos(this.getWindowIndex());
        const pos = { x: chart_pos.x, y: this.state.pos.y };
        
        const chart_scale = this.props.getScale();
        const scale = { x: chart_scale.x, y: this.state.scale.y };

        const size = this.props.getSegmentSize(this.getWindowIndex());
        const current_timestamp = this.props.getCurrentTimestamp();
        const period_offset = this.props.getPeriodOffsetSeconds(this.props.getPeriod());
        const timestamps = this.props.getTimestamps();
        const ohlc = this.props.getOhlcValues();
        const ind_values = this.props.getValues(this.props.index);
        const appearance = this.props.getAppearance(this.props.index);
        const ind = this.props.getIndicator(this.props.index)

        let { values } = this.state;

        // If empty values list, cancel drawing
        if (ind_values.length === 0) return;

        values = [];
        // Iterate columns
        let x_pos;
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
                    const color = Object.values(appearance.colors)[y].value;
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
                                ctx.moveTo(
                                    Math.round((current_pos.x + start_pos.x) * window.devicePixelRatio),
                                    Math.round((current_pos.y + start_pos.y) * window.devicePixelRatio)
                                );
                            }
                            continue
                        }
                        
                        if (ind_values[i][c_x] === undefined) continue;

                        let i_val = ind_values[i][c_x][y];
                        if (i_val === null || ohlc === undefined || ohlc[x][0] === null)
                        {
                            continue;
                        }

                        if (!is_future && current_timestamp && timestamps[x] + period_offset > current_timestamp)
                        {
                            is_future = true;
                            ctx.stroke();
                            ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.2)`;
                            ctx.beginPath();
                            ctx.moveTo(
                                Math.round((current_pos.x + start_pos.x) * window.devicePixelRatio),
                                Math.round((current_pos.y + start_pos.y) * window.devicePixelRatio)
                            );
                        }

                        current_pos = camera.convertWorldPosToScreenPos(
                            { x: x_pos, y: Math.round(i_val * Math.pow(10, ind.precision)) / Math.pow(10, ind.precision) },
                            pos, size, scale
                        );

                        // current_pos = camera.convertWorldPosToScreenPos(
                        //     { x: x_pos, y: i_val },
                        //     pos, size, scale
                        // );

                        ctx.lineTo(
                            Math.round((current_pos.x + start_pos.x) * window.devicePixelRatio), 
                            Math.round((current_pos.y + start_pos.y) * window.devicePixelRatio)
                        );
                        if (x_pos < pos.x-1) break;

                    }
                    ctx.stroke();
                }
            }
        }
        
        this.setState({ values, x_pos });
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
                0, Math.round((start_pos.y + screen_point.y) * window.devicePixelRatio)
                
            ); 
            ctx.lineTo(
                Math.round(seg_size.width * window.devicePixelRatio),
                Math.round((start_pos.y + screen_point.y) * window.devicePixelRatio)
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
            
            if (start_pos.y + screen_y - (3/4 * (font_size)) > start_pos.y)
            {
                ctx.strokeText(
                    c_y.toFixed(5), 
                    Math.round((seg_size.width - 5) * window.devicePixelRatio), 
                    Math.round((start_pos.y + screen_y + (3/4 * (font_size/2))) * window.devicePixelRatio)
                );
                ctx.fillText(
                    c_y.toFixed(5), 
                    Math.round((seg_size.width - 5) * window.devicePixelRatio), 
                    Math.round((start_pos.y + screen_y + (3/4 * (font_size/2))) * window.devicePixelRatio)
                );
            }
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
                Math.round(screen_x * window.devicePixelRatio), 
                Math.round(start_pos.y * window.devicePixelRatio)
            ); 
            ctx.lineTo(
                Math.round(screen_x * window.devicePixelRatio),
                Math.round((start_pos.y + seg_size.height) * window.devicePixelRatio)
            );
            ctx.stroke();
        }
    }

    drawSeparator = (ctx) =>
    {
        const seg_size = this.props.getSegmentSize(this.getWindowIndex());
        const start_pos = this.props.getSegmentStartPos(this.getWindowIndex());

        // Separator Line
        ctx.fillStyle = `rgba(180, 180, 180, 1.0)`;
        ctx.fillRect(
            0, 
            Math.round(start_pos.y * window.devicePixelRatio), 
            Math.round(seg_size.width * window.devicePixelRatio), 
            1.0
        );
    }

    getPos = () =>
    {
        return this.state.pos;
    }

    getScale = () =>
    {
        return this.state.scale;
    }

    setScaleY = (y) =>
    {
        let { scale } = this.state;
        scale.y = y;
        this.setState({ scale });
    }

    setPosY = (y) =>
    {
        let { pos } = this.state;
        pos.y = y;
        this.setState({ pos });
    }

    getTransX = () =>
    {
        return this.state.trans_x;
    }

    setTransX = (trans_x) =>
    {
        this.setState({ trans_x });
    }

    getIsMove = () =>
    {
        return this.state.is_move;
    }

    getWindowIndex = () =>
    {
        return this.props.index + 1;
    }

    setIsMove = (is_move) =>
    {
        this.setState({ is_move });
    }

    setIsResize = (is_resize) =>
    {
        this.setState({ is_resize });
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

export default Study;