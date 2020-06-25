import React, { Component } from 'react';
import Camera from '../../Camera';
import Candlesticks from './Candlesticks';
import Overlay from './Overlay';
import Study from './Study';
import _ from 'underscore';
import moment from "moment-timezone";
import Drawings from '../../paths/Paths';

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
        mouse_pos: {
            x: -1, y: -1
        },
        scale: {
            x: 30.0, y:0.2,
        },
        future_timestamps: [],
        overlays: [],
        studies: [],
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

        // Drawings
        this.drawings = [];

        // Refs Setters
        this.setContainerRef = elem => {
            this.container = elem;
        }
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
        this.addDrawingRef = elem => {
            this.drawings.push(elem);
        }
    }

    async componentDidMount() 
    {
        window.addEventListener("mousedown", this.onMouseDown.bind(this));

        const throttled_mouse_move = _.throttle(this.onMouseMove.bind(this), 1);
        const throttled_crosshair_move = _.throttle(this.onCrosshairMove.bind(this), 20);
        window.addEventListener("mousemove", throttled_mouse_move);
        window.addEventListener("mousemove", throttled_crosshair_move);

        window.addEventListener("mouseup", this.onMouseUp.bind(this));
        // window.addEventListener("resize", this.update.bind(this));

        const throttled_scroll = _.throttle(this.onScroll.bind(this), 20);
        window.addEventListener(
            "onwheel" in document ? "wheel" : "mousewheel",
            throttled_scroll
        );

        this.updateCanvas();

        /* Initialize Chart */
        if (this.getChart() === undefined)
            await this.addChart();

        const padding_x = 5.0;

        const bids = this.getBids();
        const chart_properties = this.getChartProperties(bids, -padding_x);
        const pos = chart_properties.pos;
        
        const scale = chart_properties.scale;
        const transition_y = scale.y; 

        this.setState({ pos, scale, transition_y });

        /* Initialize Indicators */
        const properties = this.getProperties();
        let { overlays, studies } = this.state;

        // Overlays
        for (let i = 0; i < properties.overlays.length; i++)
        {
            const ind = properties.overlays[i];
            const values = await this.getIndicator(ind);
            
            overlays.push({
                values: values
            });
        }

        // Studies
        for (let i = 0; i < properties.studies.length; i++)
        {
            const ind = properties.studies[i];
            const values = await this.getIndicator(ind);

            studies.push({
                portion: properties.studies[i].portion,
                values: values
            });
        }
        this.setState({ overlays, studies });

        this.setFutureTimestamps();
    }

    async componentDidUpdate() 
    {
        const { pos, scale, trans_x } = this.state;

        if (trans_x === 0 && this.getChart() !== undefined)
        {
            const bids = await this.getBids();
            const chart_properties = this.getChartProperties(bids, Math.floor(pos.x));
    
            const num_steps = 16;
            const c = scale.y;
            const m = (chart_properties.scale.y - c) / Math.pow(num_steps, 2);
            this.transitionScaleY(num_steps, m, c, 0);
        }

        this.update(); 
    }

    render() {
        return (
            <div
                className='chart_container'
                ref={this.setContainerRef}
                style={{
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                }}
            >
                <canvas
                    id='chart_canvas'
                    ref={this.setCanvasRef}
                />
                <Camera
                    ref={this.setCameraRef}
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
            </div>
        );
    }

    onMouseDown(e)
    {

        const mouse_pos = {
            x: e.clientX, y: e.clientY
        }
        const keys = this.props.getKeys();
        let { is_down, is_move } = this.state;

        // Check mouse within main segment bounds
        const top_offset = this.props.getTopOffset() + this.props.getScreenPos().y;

        let start_pos = this.getSegmentStartPos(0);
        let segment_size = this.getSegmentSize(0);
        let rect = {
            x: start_pos.x,
            y: start_pos.y + top_offset,
            width: segment_size.width,
            height: segment_size.height
        }

        if (!keys.includes(SPACEBAR) && this.isWithinBounds(rect, mouse_pos))
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
                y: start_pos.y + top_offset,
                width: segment_size.width,
                height: segment_size.height
            }

            if (!keys.includes(SPACEBAR) && this.isWithinBounds(rect, mouse_pos)) 
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
        let { is_down, is_move } = this.state;
        
        // let update_pos = false;
        // if (Math.abs(mouse_pos.x - e.clientX) >= 2 || 
        //     Math.abs(mouse_pos.y - e.clientY) >= 2)
        // {
        //     update_pos = true;
        //     mouse_pos = {
        //         x: e.clientX, y: e.clientY
        //     }
        // }

        if (is_down)
        {
            let { pos, scale } = this.state;
            const camera = this.getCamera();

            const screen_move = { x: e.movementX, y: e.movementY };
            let move = camera.convertScreenUnitToWorldUnit(
                screen_move, this.getSegmentSize(0), scale
            );
            
            pos.x += move.x;

            if (is_move)
                pos.y += move.y;

            this.setState({ pos });
        }

        // if (update_pos)
        //     this.setState({ mouse_pos });
    }

    onCrosshairMove(e)
    {
        const camera = this.getCamera();
        const { pos, scale } = this.state;
        let { mouse_pos } = this.state;
        
        let update_pos = false;
        if (Math.abs(mouse_pos.x - e.clientX) >= 2 || 
            Math.abs(mouse_pos.y - e.clientY) >= 2)
        {
            update_pos = true;
            mouse_pos = camera.convertScreenPosToWorldPos(
                { x: e.clientX, y: e.clientY }, pos, this.getChartSize(), scale
            );
            mouse_pos.x = Math.floor(mouse_pos.x) + 0.5;
        }

        if (update_pos)
            this.setState({ mouse_pos });
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


        if (this.getChart()) this.setFutureTimestamps();
        
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

        this.onCrosshairMove(e);

        this.setState({ pos, scale, is_scrolling });
    }

    clampScale = (x) =>
    {
        const min = 10, max = 500;
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
        const overlays = this.state.overlays;
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
        const studies = this.state.studies;
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
        this.updateCanvas();
        if (this.getChart())
        {
            this.updateChart();
            this.updateItems();
        }
    }

    async updateChart()
    {
        let { pos, scale, is_loading } = this.state;
        const ts = await this.getTimestamps();
        const ohlc = await this.getBids();

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
            this.props.updateChart(this.getProduct(), this.getPeriod(), data.ohlc);

            // Allow new data loading
            is_loading = false;
            this.setState({ is_loading });
        }
    }

    updateCanvas()
    {
        const chart_size = this.getChartSize();
        const canvas = this.getCanvas();
        canvas.setAttribute('width', chart_size.width-1);
        canvas.setAttribute('height', chart_size.height-1);
    }

    updateItems()
    {
        const canvas = this.getCanvas();
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // if (this.getBids().length <= 0) return;

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

        // Handle Open Positions
        this.handlePositions(ctx);

        // Update Drawing Properties
        this.handleDrawings(ctx);

        const studies = this.getStudies();
        if (studies.length === 0) this.drawTimes(ctx, time_data);
        this.drawPrices(ctx, price_data);

        // Restore context
        ctx.restore();


        // Reset Transform
        ctx.setTransform(1.0, 0, 0, 1.0, 0, 0);
        
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

        this.handleCrosshairs(ctx);
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

    degsToRads(degs) { return degs / (180/Math.PI); }
    radsToDegs(rads) { return rads * (180/Math.PI); }

    handlePositions(ctx)
    {
        const camera = this.getCamera();
        const { pos, scale } = this.state;
        const seg_size = this.getSegmentSize(0);

        const positions = this.getPositions();

        for (let i = 0; i < positions.length; i++)
        {
            const c_pos = positions[i];
            if (!(c_pos.product === this.getProduct())) continue;

            // Get Position
            const x = this.getPosFromTimestamp(c_pos.open_time);
            const entry_pos = camera.convertWorldPosToScreenPos(
                { x: x+0.5, y: c_pos.entry_price }, pos, seg_size, scale
            )
            const sl_pos = camera.convertWorldPosToScreenPos(
                { x: x+0.5, y: c_pos.sl }, pos, seg_size, scale
            )
            const tp_pos = camera.convertWorldPosToScreenPos(
                { x: x+0.5, y: c_pos.tp }, pos, seg_size, scale
            )

            let color = undefined;
            if (c_pos.direction === 'long')
            {
                color = '#3498db';
            }
            else
            {
                color = '#f39c12';
            }
            
            /* Draw Entry, SL, TP lines */

            // Entry line
            ctx.fillStyle = '#FFF';
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;

            // Dashed line
            ctx.beginPath();
            ctx.moveTo(0, entry_pos.y);
            ctx.lineTo(entry_pos.x, entry_pos.y);
            ctx.setLineDash([8, 5]);
            ctx.stroke();

            // Solid line
            ctx.beginPath();
            ctx.moveTo(entry_pos.x, entry_pos.y);
            ctx.lineTo(seg_size.width, entry_pos.y);
            ctx.setLineDash([0, 0]);
            ctx.stroke();

            

            // Fill Circle
            ctx.beginPath();
            ctx.arc(
                entry_pos.x, entry_pos.y, 
                4, 0, 2 * Math.PI
            );
            ctx.fill();
            ctx.stroke();
            
            // SL Line
            ctx.strokeStyle = '#e74c3c';
            ctx.beginPath();
            ctx.moveTo(0, sl_pos.y);
            ctx.lineTo(seg_size.width, sl_pos.y);
            ctx.setLineDash([5, 3]);
            ctx.stroke();

            // TP Line
            ctx.strokeStyle = '#2ecc71';
            ctx.beginPath();
            ctx.moveTo(0, tp_pos.y);
            ctx.lineTo(seg_size.width, tp_pos.y);
            ctx.setLineDash([5, 3]);
            ctx.stroke();
            
        }
    }

    handleDrawings(ctx)
    {
        const camera = this.getCamera();
        const { pos, scale } = this.state;
        const seg_size = this.getSegmentSize(0);

        const drawings = this.getDrawingsProperties();

        for (let i = 0; i < drawings.length; i++)
        {
            const d_props = drawings[i];
            if (!(d_props.type in Drawings)) continue;
            const drawing = Drawings[d_props.type]();

            // Get Position
            const x = this.getPosFromTimestamp(d_props.timestamps[0]);
            const y = d_props.prices[0];
            const screen_pos = camera.convertWorldPosToScreenPos(
                { x: x+0.5, y: y }, 
                pos, 
                seg_size,
                scale
            )

            // Get Rotation and Scale
            const rotation = this.degsToRads(d_props.properties.rotation);
            const drawing_scale = ((drawing.scale + d_props.properties.scale) * (1/scale.x));

            const width = drawing.size.width;
            const height = drawing.size.height;

            // Move to position
            ctx.translate(
                screen_pos.x - (width*drawing_scale),
                screen_pos.y - (height*drawing_scale)
            );
            ctx.scale(drawing_scale, drawing_scale);

            // Rotate around center
            ctx.translate(width, height);
            ctx.rotate(rotation);
            ctx.translate(-width/2, -height/2);
            
            ctx.fillStyle = d_props.properties.colors[0];
            // Fill Path
            ctx.fill(new Path2D(drawing.path));
            // Reset Transform
            ctx.setTransform(1,0,0,1,0,0);
        }
    }

    handleCrosshairs(ctx)
    {
        const { mouse_pos, pos, scale } = this.state;
        const chart_size = this.getChartSize();
        const camera = this.getCamera();

        const mouse_screen_pos = camera.convertWorldPosToScreenPos(
            mouse_pos, pos, chart_size, scale
        );

        const screen_pos = this.props.getScreenPos();
        const top_offset = this.props.getTopOffset() + screen_pos.y;
        const left_offset = screen_pos.x;

        if (mouse_screen_pos.x < left_offset ||
            mouse_screen_pos.x > chart_size.width + left_offset ||
            mouse_screen_pos.y < top_offset ||
            mouse_screen_pos.y > chart_size.height + top_offset)
            return
        
        ctx.fillStyle = '#787878';
        let c_x = 0;

        const line_width = 5;
        const line_space = 4;
        while (c_x < chart_size.width)
        {
            ctx.fillRect(c_x, Math.round(mouse_screen_pos.y - top_offset), line_width, 1);
            c_x += line_width + line_space;
        }

        let c_y = 0;
        while (c_y < chart_size.height)
        {
            ctx.fillRect(Math.round(mouse_screen_pos.x - left_offset), c_y, 1, line_width);
            c_y += line_width + line_space;
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

    getPosFromTimestamp = (ts) =>
    {
        const idx = this.getTimestampIdx(ts);
        return this.getTimestamps().length - idx;
    }

    setFutureTimestamps = () =>
    {
        let { pos, future_timestamps } = this.state;
        const timestamps = this.getTimestamps();
        
        let last_ts = undefined;
        if (future_timestamps.length === 0)
            last_ts = timestamps[timestamps.length-1];
        else
            last_ts = future_timestamps[future_timestamps.length-1];

        const off = this.getPeriodOffsetSeconds(this.getPeriod());
        let ts = moment(last_ts*1000).unix();

        let i = future_timestamps.length;
        let c_weekend = this.getWeekendDates(ts);
        while (-(i+1) > pos.x-2)
        {
            ts += off;

            if (ts > c_weekend[0].unix())
            {
                ts = c_weekend[1].unix();
                c_weekend = this.getWeekendDates(ts);
            }

            future_timestamps.push(ts);
            i += 1;
        }

        this.setState({ future_timestamps });
    }

    getChartProperties(ohlc, idx)
    {
        let { pos, scale } = this.state;
        
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
            if (ohlc[c_x].every((x) => x===0)) continue;
            
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

    getContainer = () =>
    {
        return this.container;
    }

    getSize = () =>
    {
        const container = this.getContainer();
        return {
            width: container.clientWidth,
            height: container.clientHeight
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
        const portions = this.getPortions();
        const prev_portion = portions.slice(0,idx).reduce((a,b) => a + b, 0);
        

        const start_pos = {
            x: 0,
            y: chart_size.height * prev_portion
        }
        return start_pos;
    }
    
    getSegmentSize = (idx) =>
    {
        const chart_size = this.getChartSize();
        const portions = this.getPortions();
        const seg_portion = portions[idx];

        return {
            width: chart_size.width,
            height: chart_size.height * seg_portion
        }
    }

    getChartSize = () =>
    {
        const container_size = this.getSize();

        return {
            width: container_size.width,
            height: container_size.height
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

    getStudies = () => 
    {
        return this.studies;
    }

    getDrawings = () =>
    {
        return this.drawings;
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
        const { studies } = this.state;
        let portions = [this.getMainPortion()];
        for (let i = 0; i < studies.length; i++)
        {
            portions.push(studies[i].portion);
        }
         return portions;
    }

    getLimit = () =>
    {
        return this.state.limit;
    }

    getStrategy = () =>
    {
        return this.props.getStrategy(
            this.props.strategy_id
        );
    }

    getProperties = () =>
    {
        return this.props.getWindowInfo(
            this.props.strategy_id, this.props.item_id
        ).properties;
    }

    getProduct = () => 
    {
        return this.getProperties().product;
    }

    getPeriod = () => 
    {
        return this.getProperties().period;
    }

    getPositions = () =>
    {
        return this.getStrategy().positions;
    }

    getOrders = () =>
    {
        return this.getStrategy().orders;
    }

    getMainPortion = () =>
    {
        return this.getProperties().portion;
    }

    getPrice = () =>
    {
        return this.getProperties().price;
    }

    getOverlaysProperties = () =>
    {
        return this.getProperties().overlays;
    }

    getOverlayValues = (idx) =>
    {
        return this.state.overlays[idx].values;
    }

    getStudiesProperties = () =>
    {
        return this.getProperties().studies;
    }

    getStudyValues = (idx) =>
    {
        return this.state.studies[idx].values;
    }

    addDrawing = (name, timestamps, prices, properties) =>
    {
        this.getDrawingsProperties().push(
            Drawings.create(name, timestamps, prices, properties)
        );
    }

    getDrawingsProperties = () =>
    {
        return this.getProperties().drawings;
    }

    async addChart()
    {
        const ohlc_data = await this.props.retrieveChartData(
            this.getProduct(),
            this.getPeriod()
        );
        this.props.addChart(
            this.getProduct(),
            this.getPeriod(),
            ohlc_data
        );
    }

    getChart = () =>
    {
        return this.props.getChart(
            this.getProduct(),
            this.getPeriod()
        );
    }

    getTimestamps = () =>
    {
        return this.getChart().timestamps;
    }

    getAsks = () =>
    {
        return this.getChart().asks;
    }

    getBids = ()  =>
    {
        return this.getChart().bids;
    }

    getIndicator = (ind) =>
    {
        return this.props.getIndicator(
            this.getChart(),
            this.getPrice(),
            ind
        );
    }

}

const SPACEBAR = 32;






export default Chart;