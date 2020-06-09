import React, { Component } from 'react';
import Camera from './Camera';
import Candlesticks from './chart/Candlesticks';
import Overlay from './chart/Overlay';
import Study from './chart/Study';
import _ from 'underscore';
import moment from "moment-timezone";

/**
 * TODO:
 *  - draw drawings
 */

class Chart extends Component 
{
    state = {
        pos: {
            x: 0, y: 0,
        },
        scale: {
            x: 30.0, y:1.0,
        },
        portions: [0.7, 0.15, 0.15],
        is_down: false,
        is_move: false,
        trans_x: 0,
        limit: [null,null],
        is_scrolling: null,
        is_loading: false
    }

    constructor(props)
    {
        super(props);

        // Overlays
        this.overlays = [];

        // Studies
        this.studies = [];

        // Refs Setters
        this.setCanvasRef = elem => {
            this.canvas = elem;
        }
        this.setCameraRef = elem => {
            this.camera = elem;
        };
        this.setChartCanvasRef = elem => {
            this.chartCanvas = elem;
        };
        this.setCandlesticksRef = elem => {
            this.candlesticks = elem;
        };
        this.addOverlayRef = elem => {
            this.overlays.push(elem);
        }
        this.addStudyRef = elem => {
            this.studies.push(elem);
        }
    }

    componentDidMount() 
    {
        window.addEventListener("mousedown", this.onMouseDown.bind(this));
        window.addEventListener("mousemove", this.onMouseMove.bind(this));
        window.addEventListener("mouseup", this.onMouseUp.bind(this));
        
        const throttled_scroll = _.throttle(this.onScroll.bind(this), 20);
        window.addEventListener(
            "onwheel" in document ? "wheel" : "mousewheel",
            throttled_scroll
        );

        // const ohlc = this.getBids();
        const padding_x = 5.0;

        const chart_properties = this.getChartProperties(-padding_x);
        const pos = chart_properties.pos;
        
        const scale = chart_properties.scale;
        const transition_y = scale.y; 

        this.setState({ pos, scale, transition_y });
    }

    componentDidUpdate() 
    {
        const { pos, scale, trans_x } = this.state;

        if (trans_x === 0)
        {
            const chart_properties = this.getChartProperties(Math.floor(pos.x));
    
            const num_steps = 16;
            const c = scale.y;
            const m = (chart_properties.scale.y - c) / Math.pow(num_steps, 2);
            this.transitionScaleY(num_steps, m, c, 0);
        }

        this.update();
    }

    render() {
        return (
            <React.Fragment>
                <canvas
                    id='chart_canvas'
                    ref={this.setCanvasRef}
                />
                <Camera
                    ref={this.setCameraRef}
                    getCanvas={this.getCanvas}
                    getScale={this.getScale}
                />
                <Candlesticks
                    ref={this.setCandlesticksRef}
                    getAsks={this.getAsks}
                    getBids={this.getBids}
                    getCamera={this.getCamera}
                    getCanvas={this.getCanvas}
                    getPos={this.getPos}
                    getScale={this.getScale}
                    getSegmentSize={this.getSegmentSize}
                    getPortions={this.getPortions}
                    getLimit={this.getLimit}
                />
                {this.generateOverlays()}
                {this.generateStudies()}
            </React.Fragment>
        );
    }

    onMouseDown(e)
    {

        const mouse_pos = {
            x: e.clientX, y: e.clientY
        }
        let { is_down, is_move } = this.state;

        // Check mouse within main segment bounds
        let start_pos = this.getSegmentStartPos(0);
        let segment_size = this.getSegmentSize(0);
        let rect = {
            x: start_pos.x,
            y: start_pos.y,
            width: segment_size.width,
            height: segment_size.height
        }

        if (this.isWithinBounds(rect, mouse_pos))
        {
            e.preventDefault();
            is_down = true;
            is_move = true;
            this.setState({ is_down, is_move });
            return
        }

        // Check mouse within study bounds
        const studies = this.getStudies();
        for (let i = 0; i < studies.length; i++)
        {
            let study = studies[i];
            start_pos = this.getSegmentStartPos(study.getWindowIndex());
            segment_size = this.getSegmentSize(study.getWindowIndex());
            rect = {
                x: start_pos.x,
                y: start_pos.y,
                width: segment_size.width,
                height: segment_size.height
            }

            if (this.isWithinBounds(rect, mouse_pos)) 
            {
                e.preventDefault();
                is_down = true;
                study.setIsMove(true);
                this.setState({ is_down });
                return
            }
        }
    }

    onMouseMove(e)
    {
        const { is_down, is_move } = this.state;

        if (is_down)
        {
            let { pos, scale } = this.state;
            const camera = this.getCamera();

            const screen_move = { x: e.movementX, y: e.movementY };
            let move = camera.convertScreenUnitToWorldUnit(
                screen_move, this.getSegmentSize(0), scale
            );
            
            pos.x += move.x;
            // pos.x = this.clampMove(pos.x);

            if (is_move)
                pos.y += move.y;

            this.setState({ pos });
        }
    }

    onMouseUp(e)
    {
        const studies = this.getStudies();
        for (let i = 0; i < studies.length; i++) 
        {
            studies[i].setIsMove(false);
        }

        let { is_down, is_move, trans_x } = this.state;
        is_down = false;

        if (is_move)
        {
            is_move = false;
            trans_x = 0;
        }

        // this.limit(
        //     this.getTimestamps()[this.getTimestamps().length-100],
        //     this.getTimestamps()[this.getTimestamps().length-1]
        // );

        this.setState({ is_down, is_move, trans_x });
    }

    onScroll(e)
    {
        let { pos, scale, trans_x, is_scrolling } = this.state;
        const dz = e.deltaY;
        const speed = 0.1;

        const camera = this.getCamera();
        const chart_size = this.getChartSize();
        const num_candles = camera.convertScreenUnitToWorldUnit(
            { x: chart_size.width, y: 0 }, chart_size, scale
        ).x;

        scale.x += (num_candles * speed * (dz / 100.0));
        scale.x = this.clampScale(scale.x);
        // pos.x = this.clampMove(pos.x);
        
        clearTimeout(is_scrolling);
        is_scrolling = setTimeout(() => {
            trans_x = 0;
            this.setState({ trans_x });
        }, 100);

        this.setState({ pos, scale, is_scrolling });
    }

    clampScale = (x) =>
    {
        const min = 10, max = 1000;
        return Math.min(Math.max(x, min), max);
    }

    clampMove = (x) =>
    {
        const { scale } = this.state;
        return Math.max(x, scale.x);
    }

    runTransition(num_steps, m, c, i) 
    {
        let { trans_x } = this.state;

        if (trans_x < num_steps && i === trans_x)
        {
            trans_x += 1;
            this.setState({ trans_x });
            return new Promise(
                function (resolve) 
                {
                    setTimeout(() => 
                    {
                        let { scale } = this.state;
                        scale.y = m * Math.pow(trans_x, 2) + c
                        this.setState({ scale });
                        this.transitionScaleY(num_steps, m, c, i+1);
                    }, 10);
                }.bind(this)
            );
        }
    }
    
    async transitionScaleY(num_steps, m, c, i)
    {
        await this.runTransition(num_steps, m, c, i);
    }

    generateOverlays() 
    {
        const overlays = this.props.getOverlays(this.props.chart_idx);
        let gen_overlays = [];
        for (let i = 0; i < overlays.length; i++) {
            gen_overlays.push(
                <Overlay
                    key={'overlay_'+i}
                    ref={this.addOverlayRef}
                    index={i}
                    getValues={this.getOverlayValues}
                    getCamera={this.getCamera}
                    getCanvas={this.getCanvas}
                    getPos={this.getPos}
                    getScale={this.getScale}
                    getSegmentSize={this.getSegmentSize}
                    getLimit={this.getLimit}
                />
            );
        }

        return gen_overlays;
    }

    generateStudies()
    {
        const studies = this.props.getStudies(this.props.chart_idx);
        let gen_studies = [];
        for (let i = 0; i < studies.length; i++) 
        {
            gen_studies.push(
                <Study
                    key={'study_'+i}
                    ref={this.addStudyRef}
                    index={i}
                    getValues={this.getStudyValues}
                    getCamera={this.getCamera}
                    getCanvas={this.getCanvas}
                    getPos={this.getPos}
                    getScale={this.getScale}
                    getSegmentStartPos={this.getSegmentStartPos}
                    getSegmentSize={this.getSegmentSize}
                    getLimit={this.getLimit}
                />
            );
        }

        return gen_studies;
    }

    update()
    {   
        this.updateChart();
        this.updateCanvas();
        this.updateItems();
    }

    async updateChart()
    {
        let { pos, scale, is_loading } = this.state;
        const ts = this.getTimestamps();
        const ohlc = this.getBids();

        if (!is_loading && pos.x + scale.x > ohlc.length)
        {
            // Prevent consecutive loads
            is_loading = true;
            this.setState({ is_loading });

            let count = 1000;
            // Account for weekend
            count += (
                Math.floor(count 
                / this.getNumWeeklyBars(this.getPeriod()))
                * this.getNumWeekendBars(this.getPeriod())
            );

            // Set time range to 1000 bars before earliest loaded date
            const to_dt = moment(ts[0] * 1000);
            const from_dt = to_dt.clone().subtract(
                moment.duration(this.getPeriodOffsetSeconds(this.getPeriod()) * 1000 * count)
            );
            
            // Retrieve all available data
            let data = await this.props.retrieveChartData(
                this.getProduct(), this.getPeriod(), from_dt, to_dt
            );
            if (data.metadata.page_amount > 1)
            {
                while (data.metadata.page_number < data.metadata.page_amount-1)
                {
                    const new_data = await this.props.retrieveChartData(
                        this.getProduct(), this.getPeriod(), 
                        from_dt, to_dt, 
                        data.metadata.page_number + 1
                    );
                    data.metadata = new_data.metadata;
                    data.ohlc.timestamps = [...data.ohlc.timestamps, ...new_data.ohlc.timestamps];
                    data.ohlc.asks = [...data.ohlc.asks, ...new_data.ohlc.asks];
                    data.ohlc.bids = [...data.ohlc.bids, ...new_data.ohlc.bids];
                }
            }

            // Update chart with new data
            this.props.updateChart(this.props.getStrategyId(), this.props.chart_idx, data.ohlc);

            // Allow new data loading
            is_loading = false;
            this.setState({ is_loading });
        }
    }

    updateCanvas()
    {
        const chart_size = this.getChartSize();
        const canvas = this.getCanvas();
        
        canvas.setAttribute('width', chart_size.width);
        canvas.setAttribute('height', chart_size.height);
    }

    updateItems()
    {
        const canvas = this.getCanvas();
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (this.getBids().length <= 0) return;

        let start_pos = this.getSegmentStartPos(0);
        let segment_size = this.getSegmentSize(0);
       
        this.defineClip(ctx, start_pos, segment_size);
        
        // Draw Grid
        const price_interval = this.getPriceInterval();
        const price_data = this.drawPriceGrid(ctx, price_interval);
        const time_data = this.drawTimeGrid(ctx);
        
        // Draw Candlesticks
        this.getCandlesticks().draw();

        const overlays = this.getOverlays();
        for (let i = 0; i < overlays.length; i++)
        {
            overlays[i].draw();
        }
    
        const studies = this.getStudies();
        if (studies.length === 0) this.drawTimes(ctx, time_data);
        this.drawPrices(ctx, price_data);

        // Restore context
        ctx.restore();

        for (let i = 0; i < studies.length; i++)
        {
            let study = studies[i];
            start_pos = this.getSegmentStartPos(study.getWindowIndex());
            segment_size = this.getSegmentSize(study.getWindowIndex());

            this.defineClip(ctx, start_pos, segment_size);
            // Draw Study
            study.drawGrid(ctx, time_data, i === studies.length-1);
            study.draw(); 

            // Restore context
            ctx.restore(); 
        }
    }

    getPriceInterval()
    {
        const camera = this.getCamera();
        const seg_size = this.getSegmentSize(0);
        const { scale } = this.state;
        const min_dist = 100;
        const intervals = [0.00001, 0.00002, 0.00005];
        let multi = 1;

        while (true)
        {
            for (let x = 0; x < intervals.length; x++)
            {
                let i = intervals[x] * multi;
                
                let start_y = camera.convertWorldUnitToScreenUnit(
                    { x: 0, y: i }, seg_size, scale
                ).y;

                let end_y = camera.convertWorldUnitToScreenUnit(
                    { x: 0, y: 0 }, seg_size, scale
                ).y;

                
                if (start_y - end_y >= min_dist) return i;
            }

            multi *= 10;
        }
    }

    getWeekendDates(ts)
    {
        const dow = [...Array(7).keys(),...Array(7).keys()];
        const fri = 5;
        const sun = 0;
        ts *= 1000;
        
        const dt = moment(ts).tz("America/New_York");
        const fri_dist = dow.slice(dt.day()).indexOf(fri);
        const sun_dist = dow.slice(dt.day()).slice(fri_dist).indexOf(sun) + fri_dist;

        const weekend = dt.clone().add(fri_dist, "d");
        const weekstart = dt.clone().add(sun_dist, "d");
        return [
            weekend.hour(17).minute(0).second(0).millisecond(0),
            weekstart.hour(17).minute(0).second(0).millisecond(0),
        ];
    }

    isWrapTime(ts)
    {
        ts *= 1000;
        const dt = moment(ts).tz("America/New_York");
        return dt.day() > 5 || (dt.day() === 5 && dt.hour() >= 17);
    }

    wrapTime(ts)
    {
        ts *= 1000;
        const dt = moment(ts).tz("America/New_York");
        if (dt.day() > 5 || (dt.day() === 5 && dt.hour() >= 17))
        {
            const open_off = moment.duration(7 % dt.day(), "d");
            const open = dt.clone().add(open_off)
                .hour(17).minute(0).second(0).millisecond(0);
            return open
        }
        else return dt;
    }

    getPeriodOffsetSeconds(period)
    {
        if (period === "M1" || period === 0) 
            return 60;
        else if (period === "M2" || period === 1) 
            return 60 * 2;
        else if (period === "M3" || period === 2) 
            return 60 * 3;
        else if (period === "M5" || period === 3) 
            return 60 * 5;
        else if (period === "M10" || period === 4) 
            return 60 * 10;
        else if (period === "M15" || period === 5) 
            return 60 * 15;
        else if (period === "M30" || period === 6) 
            return 60 * 30;
        else if (period === "H1" || period === 7) 
            return 60 * 60;
        else if (period === "H2" || period === 8) 
            return 60 * 60 * 2;
        else if (period === "H3" || period === 9) 
            return 60 * 60 * 3;
        else if (period === "H4" || period === 10) 
            return 60 * 60 * 4;
        else if (period === "H12" || period === 11) 
            return 60 * 60 * 12;
        else if (period === "D" || period === 12) 
            return 60 * 60 * 24;
        else if (period === "D2" || period === 13) 
            return 60 * 60 * 24 * 2;
        else if (period === "W" || period === 14) 
            return 60 * 60 * 24 * 7;
        else if (period === "W2" || period === 15) 
            return 60 * 60 * 24 * 7 * 2;
        else if (period === "M" || period === 16) 
            return 60 * 60 * 24 * 7 * 4;
        else if (period === "Y1" || period === 17) 
            return 60 * 60 * 24 * 7 * 4 * 12;
        else if (period === "Y2" || period === 18) 
            return 60 * 60 * 24 * 7 * 4 * 12 * 2;
        else if (period === "Y3" || period === 19) 
            return 60 * 60 * 24 * 7 * 4 * 12 * 2;
        else
            return null;
    }

    getNumWeeklyBars(period)
    {
        if (period === "M1") 
            return 7 * 24 * 60;
        else if (period === "M2") 
            return 7 * 24 * (60 / 2);
        else if (period === "M3") 
            return 7 * 24 * (60 / 3);
        else if (period === "M5") 
            return 7 * 24 * (60 / 5);
        else if (period === "M10") 
            return 7 * 24 * (60 / 10);
        else if (period === "M15") 
            return 7 * 24 * (60 / 15);
        else if (period === "M30") 
            return 7 * 24 * (60 / 30);
        else if (period === "H1") 
            return 7 * 24;
        else if (period === "H2") 
            return 7 * (24 / 2);
        else if (period === "H3") 
            return 7 * (24 / 3);
        else if (period === "H4") 
            return 7 * (24 / 4);
        else if (period === "D") 
            return 7;
        else if (period === "W") 
            return 0;
        else if (period === "M") 
            return 0;
        else
            return null;
    }

    getNumWeekendBars(period)
    {
        if (period === "M1") 
            return 2 * 24 * 60;
        else if (period === "M2") 
            return 2 * 24 * (60 / 2);
        else if (period === "M3") 
            return 2 * 24 * (60 / 3);
        else if (period === "M5") 
            return 2 * 24 * (60 / 5);
        else if (period === "M10") 
            return 2 * 24 * (60 / 10);
        else if (period === "M15") 
            return 2 * 24 * (60 / 15);
        else if (period === "M30") 
            return 2 * 24 * (60 / 30);
        else if (period === "H1") 
            return 2 * 24;
        else if (period === "H2") 
            return 2 * (24 / 2);
        else if (period === "H3") 
            return 2 * (24 / 3);
        else if (period === "H4") 
            return 2 * (24 / 4);
        else if (period === "D") 
            return 2;
        else if (period === "W") 
            return 0;
        else if (period === "M") 
            return 0;
        else
            return null;
    }

    drawPriceGrid(ctx, interval)
    {
        
        const camera = this.getCamera();
        const seg_size = this.getSegmentSize(0);
        const { pos, scale } = this.state;

        const start_pos = camera.convertScreenPosToWorldPos(
            { x: 0, y: -seg_size.height }, pos, seg_size, scale
        );
        const end_pos = camera.convertScreenPosToWorldPos(
            { x: 0, y: seg_size.height }, pos, seg_size, scale
        );
        let y = start_pos.y;
        
        if (interval < 1.0)
        {
            const decimals = interval.toString().split('.')[1].length;
            const multi = Math.pow(10, (decimals-1));
            y = Math.round(y * multi) / multi;
        }
        else
        {
            
        }
        
        const font_size = 10;
        ctx.font = String(font_size) + 'pt trebuchet ms'; //Consolas
        ctx.fillStyle = 'rgb(80, 80, 80)';
        
        let data = [];
        while (y > end_pos.y)
        {
            let screen_y = camera.convertWorldPosToScreenPos(
                { x: 0, y: y }, pos, seg_size, scale
            ).y;

            ctx.strokeStyle = `rgb(240, 240, 240)`;
            ctx.lineWidth = 0.9;

            ctx.beginPath();
            ctx.moveTo(
                0, screen_y
                
            ); 
            ctx.lineTo(
                seg_size.width,
                screen_y
            );
            ctx.stroke();

            data.push(y);
            y -= interval;
        }
        return data;
    }

    drawTimeGrid(ctx)
    {
        const camera = this.getCamera();
        const seg_size = this.getSegmentSize(0);

        const off = this.getPeriodOffsetSeconds(this.getPeriod());
        const ohlc = this.getBids();
        const timestamps = this.getTimestamps();

        const { pos, scale } = this.state;
        let ts = 0;
        let x = 0;

        if (pos.x + scale.x > 0 && pos.x + scale.x < ohlc.length)
        {
            x = Math.ceil(pos.x + scale.x);
            ts = timestamps[ohlc.length - x];
        }
        else if (pos.x + scale.x < 0) 
        {
            x = 0;
            ts = timestamps[ohlc.length - x];
        }
        else
        {
            x = ohlc.length;
            ts = timestamps[ohlc.length - x];
        }

        const min_dist = 100;
        let interval_off = null;
        let i = 0;
        while (true)
        {
            interval_off = this.getPeriodOffsetSeconds(i);
            if (interval_off === null) break;
            i += 1;

            let x_len = interval_off / off;
            if (x_len < 1) continue;

            let start_x = camera.convertWorldUnitToScreenUnit(
                { x: x_len, y: 0 }, seg_size, scale
            ).x;
            
            if (start_x >= min_dist) break;
        }

        const tz = 'Australia/Melbourne';
        let time = this.getWeekendDates(
            moment(ts*1000).subtract(7, 'd').unix()
        )[1].tz(tz);

        let x_off = Math.ceil((ts - time.unix()) / off);

        let data = [];
        for (let i = x + x_off; i >= pos.x; i-=parseInt(interval_off/off))
        {
            if (i <= pos.x + scale.x + 1)
            {
                let screen_x = camera.convertWorldPosToScreenPos(
                    { x: i+0.5, y: 0 }, pos, seg_size, scale
                ).x;

                ctx.strokeStyle = `rgb(240, 240, 240)`;
                ctx.lineWidth = 0.9;

                ctx.beginPath();
                ctx.moveTo(
                    screen_x, 0
                    
                ); 
                ctx.lineTo(
                    screen_x,
                    seg_size.height
                );
                ctx.stroke();
            }
            data.push([i, time]);

            const weekend_times = this.getWeekendDates(time.unix());
            const weekend = weekend_times[0].unix();
            const next_time = time.unix() + interval_off;

            if (
                next_time >= weekend && 
                interval_off < this.getPeriodOffsetSeconds("W")
            )
            {
                if (interval_off !== off)
                {
                    const t_duration = weekend - time.unix();
                    const x_off = Math.ceil(t_duration / off);

                    i += (parseInt(interval_off/off) - (x_off));
                }
                time = weekend_times[1].tz(tz);
            }
            else
            {
                time = moment((time.unix() + interval_off) * 1000).tz(tz);
            }
        }
        return data;
    }

    drawPrices(ctx, data)
    {
        const camera = this.getCamera();
        const { pos, scale } = this.state;
        const seg_size = this.getSegmentSize(0);

        // Font settings
        const font_size = 10;
        ctx.font = String(font_size) + 'pt trebuchet ms'; //Consolas
        ctx.fillStyle = 'rgb(80, 80, 80)';
        ctx.strokeStyle = 'rgb(255, 255, 255)';
        ctx.lineWidth = 2.0;

        // Draw grid
        for (let i = 0; i < data.length; i++)
        {
            let c_y = data[i];

            let screen_y = camera.convertWorldPosToScreenPos(
                { x: 0, y: c_y }, pos, seg_size, scale
            ).y;
            
            ctx.strokeText(c_y.toFixed(5), seg_size.width - 50, screen_y + (3/4 * (font_size/2)));
            ctx.fillText(c_y.toFixed(5), seg_size.width - 50, screen_y + (3/4 * (font_size/2)));
        }
    }

    drawTimes(ctx, data)
    {
        const camera = this.getCamera();
        const { pos, scale } = this.state;
        const seg_size = this.getSegmentSize(0);

        // Font settings
        const font_size = 10;
        ctx.font = String(font_size) + 'pt trebuchet ms'; //Consolas
        ctx.fillStyle = 'rgb(80, 80, 80)';
        ctx.strokeStyle = 'rgb(255, 255, 255)';
        ctx.lineWidth = 2.0;

        // Draw grid
        for (let i = 0; i < data.length; i++)
        {
            let c_x = data[i][0];
            let time = data[i][1];

            let screen_x = camera.convertWorldPosToScreenPos(
                { x: c_x+0.5, y: 0 }, pos, seg_size, scale
            ).x;

            ctx.strokeText(
                time.format('ddd DD'), 
                screen_x, 
                seg_size.height - 4
            );
            ctx.fillText(
                time.format('ddd DD'), 
                screen_x, 
                seg_size.height - 4
            );
        }
    }

    defineClip(ctx, start_pos, segment_size)
    {
        ctx.save(); // Save context
            // Define new zone
            ctx.beginPath();
                // Define clipping area
                ctx.rect(
                    start_pos.x,
                    start_pos.y,
                    segment_size.width,
                    segment_size.height
                );
                ctx.clip();
    }

    isWithinBounds(rect, mouse_pos)
    {
        if (
            mouse_pos.x > rect.x &&
            mouse_pos.x < rect.x + rect.width &&
            mouse_pos.y > rect.y &&
            mouse_pos.y < rect.y + rect.height
        )
        {
            return true;
        }
        return false;
    }

    setScale = (x, y) =>
    {
        let { scale } = this.state;
        scale.x = x;
        scale.y = y;
        this.setState({ scale });
    }

    getTimestampIdx = (ts) =>
    {
        const timestamps = this.getTimestamps();
        const indicies = [...Array(timestamps.length).keys()]

        const idx = indicies.reduce(function(prev, curr) {
            return (
                Math.abs(timestamps[curr] - ts) < Math.abs(timestamps[prev] - ts) ? curr : prev
            );
        });

        return idx;
    }

    limit = (start, end) =>
    {
        let { limit } = this.state;
        limit = [
            this.getTimestampIdx(start),
            this.getTimestampIdx(end)
        ];
        this.setState({ limit });
    }

    resetLimit = () =>
    {
        let { limit } = this.state;
        limit = [null,null];
        this.setState({ limit });
    }

    goto = (ts) =>
    {
        let { pos } = this.state;
        const idx = this.getTimestampIdx(ts);
        pos.x = this.getTimestamps().length - idx;
        this.setState({ pos });
    }

    getChartProperties = (idx) =>
    {
        let { pos, scale } = this.state;
        const ohlc = this.getBids();
        
        let hl = [null,null]; // highest/lowest prices

        const camera = this.getCamera();
        const chart_size = this.getChartSize();
        const num_candles = camera.convertScreenUnitToWorldUnit(
            { x: chart_size.width, y: 0 }, chart_size, scale
        ).x;

        for (let i = idx + parseInt(num_candles); i >= idx; i--)
        {
            let c_x = ohlc.length - i;
            if (ohlc[c_x] === undefined) continue;
            
            let high = ohlc[c_x][1];
            let low = ohlc[c_x][2];

            if (hl[0] == null || high > hl[0])
                hl[0] = high;
            if (hl[1] == null || low < hl[1])
                hl[1] = low;
        }
        
        if (hl.some((elem) => elem === null)) 
            return { pos: pos, scale: scale };

        let new_scale = (hl[0] - hl[1]);
        const padding_y = new_scale;
        new_scale += padding_y/2.0;

        let ref_point = Math.round((hl[0] + hl[1]) / 2 * 100000) / 100000;
        return { 
            pos: { x: pos.x, y: ref_point }, 
            scale: { x: scale.x, y: new_scale } 
        };
    }

    getCamera = () => 
    {
        return this.camera;
    }

    getCanvas = () =>
    {
        return this.canvas;
    }

    getSegmentStartPos = (idx) =>
    {
        const chart_size = this.getChartSize();
        let { portions } = this.state;
        const prev_portion = portions.slice(0,idx).reduce((a,b) => a + b, 0);
        

        const start_pos = {
            x: 0,
            y: chart_size.height * prev_portion
        }
        return start_pos;
    }
    
    getSegmentSize = (idx) =>
    {
        const { portions } = this.state;
        const chart_size = this.getChartSize();
        const seg_portion = portions[idx];

        return {
            width: chart_size.width,
            height: chart_size.height * seg_portion
        }
    }

    getChartSize = () =>
    {
        const chart_portion = this.props.getPortions()[this.props.chart_idx];
        const container_size = this.props.getSize();

        return {
            width: container_size.width * chart_portion.x,
            height: container_size.height * chart_portion.y
        }
    }

    getCandlesticks = () => 
    {
        return this.candlesticks;
    }

    getOverlays =  () =>
    {
        return this.overlays;
    }

    getStudies = () => {
        return this.studies;
    }

    getPos = () =>
    {
        return this.state.pos;
    }

    getScale = () =>
    {
        return this.state.scale;
    }

    getPortions = () => 
    {
        return this.state.portions;
    }

    getLimit = () =>
    {
        return this.state.limit;
    }

    getProduct = () => 
    {
        return this.props.getProduct(this.props.chart_idx);
    }

    getPeriod = () => 
    {
        return this.props.getPeriod(this.props.chart_idx);
    }

    getTimestamps = () =>
    {
        return this.props.getTimestamps(this.props.chart_idx);
    }

    getAsks = () =>
    {
        return this.props.getAsks(this.props.chart_idx);
    }

    getBids = () => {
        return this.props.getBids(this.props.chart_idx);
    }

    getOverlayValues = (idx) =>
    {
        return this.props.getOverlays(this.props.chart_idx)[idx];
    }

    getStudyValues = (idx) => 
    {
        return this.props.getStudies(this.props.chart_idx)[idx];
    }

}








export default Chart;