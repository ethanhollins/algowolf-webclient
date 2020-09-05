import React, { Component } from 'react';
import Camera from '../../Camera';
import Candlesticks from './Candlesticks';
import Overlay from './Overlay';
import Study from './Study';
import _ from 'underscore';
import moment from "moment-timezone";
import Drawings from '../../paths/Paths';
import Indicators from '../../Indicators';


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
        intervals: {
            x: 0, y: 0
        },
        future_timestamps: [],
        overlays: [],
        studies: [],
        is_down: false,
        is_move: false,
        trans_x: 0,
        limit: [null,null],
        first_load: true,
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

        this._ismounted = true;

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = _.throttle(this.onMouseMove.bind(this), 1);
        this.onCrosshairMove = _.throttle(this.onCrosshairMove.bind(this), 20);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onScroll = _.throttle(this.onScroll.bind(this), 20);
    }

    async componentDidMount() 
    {
        window.addEventListener("mousedown", this.onMouseDown);
        window.addEventListener("mousemove", this.onMouseMove);
        window.addEventListener("mousemove", this.onCrosshairMove);

        window.addEventListener("mouseup", this.onMouseUp);
        // window.addEventListener("resize", this.update.bind(this));

        window.addEventListener(
            "onwheel" in document ? "wheel" : "mousewheel",
            this.onScroll
        );

        this.updateCanvas();

        /* Initialize Chart */
        if (this.getChart() === undefined)
            await this.addChart();
        
        /* Initialize Indicators */
        const properties = this.getProperties();
        let { overlays, studies } = this.state;

        // Overlays
        for (let i = 0; i < properties.overlays.length; i++)
        {
            const ind = properties.overlays[i];
            this.calculateIndicator(ind);
            overlays.push({
                ind: ind
            });
        }

        // Studies
        for (let i = 0; i < properties.studies.length; i++)
        {
            const ind = properties.studies[i];
            this.calculateIndicator(ind);

            studies.push({
                portion: properties.studies[i].portion,
                ind: ind
            });
        }
        this.setState({ overlays, studies });

        this.setFutureTimestamps();
        this.setPriceInterval();
        this.setTimeInterval();
    }

    async componentDidUpdate() 
    {
        let { pos, scale, first_load, trans_x } = this.state;

        if (this.getChart() !== undefined)
        {
            const bids = this.getBids();
            const chart_properties = this.getChartProperties(bids, Math.floor(pos.x));
            if (first_load)
            {
                first_load = false;
                pos = chart_properties.pos;
                scale = chart_properties.scale;
                this.setState({ pos, scale, first_load });
            }
            else if (trans_x === 0)
            {
                const num_steps = 16;
                const c = scale.y;
                const m = (chart_properties.scale.y - c) / Math.pow(num_steps, 2);
                this.transitionScaleY(num_steps, m, c, 0);
            }
    
        }

        this.update(); 
    }

    componentWillUnmount()
    {
        this._ismounted = false;
        window.removeEventListener("mousedown", this.onMouseDown);
        window.removeEventListener("mousemove", this.onMouseMove);
        window.removeEventListener("mousemove", this.onCrosshairMove);

        window.removeEventListener("mouseup", this.onMouseUp);
        // window.addEventListener("resize", this.update.bind(this));

        window.removeEventListener(
            "onwheel" in document ? "wheel" : "mousewheel",
            this.onScroll
        );
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
        let { mouse_pos } = this.state;
        
        let update_pos = false;
        if (Math.abs(mouse_pos.x - e.clientX) >= 1 || 
            Math.abs(mouse_pos.y - e.clientY) >= 1)
        {
            update_pos = true;
            mouse_pos = { x: e.clientX, y: e.clientY };
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
                        if (this._ismounted)
                        {
                            let { scale } = this.state;
                            scale.y = m * Math.pow(trans_x, 2) + c
                            this.setState({ scale });
                            this.setPriceInterval();
                            this.setTimeInterval();
                            this.transitionScaleY(num_steps, m, c, i+1);
                        }
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
                    getProperties={this.getOverlayProperties}
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
                    getProperties={this.getStudyProperties}
                    getTimestamps={this.getTimestamps}
                    getAllTimestamps={this.getAllTimestamps}
                    getNumZeroDecimals={this.getNumZeroDecimals}
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
        const ts = this.getTimestamps();
        const ohlc = this.getBids();

        if (!is_loading && pos.x + scale.x > ohlc.length)
        {
            // Prevent consecutive loads
            is_loading = true;
            this.setState({ is_loading });

            // Set time range to 1000 bars before earliest loaded date
            const to_dt = moment(ts[0] * 1000);
            const from_dt = this.props.getCountDateFromDate(
                this.getPeriod(), 1000, to_dt.clone(), -1
            );
            
            // Retrieve all available data
            let data = await this.props.retrieveChartData(
                this.getProduct(), this.getPeriod(), from_dt, to_dt
            );

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
        canvas.setAttribute('width', Math.round(chart_size.width-1));
        canvas.setAttribute('height', Math.round(chart_size.height+this.getBottomOff()-1));
    }

    updateItems()
    {
        const canvas = this.getCanvas();
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let start_pos = this.getSegmentStartPos(0);
        let segment_size = this.getSegmentSize(0);
       
        this.defineClip(ctx, start_pos, segment_size);

        // Draw Grid
        const price_data = this.drawPriceGrid(ctx);
        const time_data = this.drawTimeGrid(ctx);
        
        // Draw Candlesticks
        this.getCandlesticks().draw();

        const overlays = this.getOverlays();
        for (let i = 0; i < overlays.length; i++)
        {
            this.calculateIndicator(this.state.overlays[i].ind);
            overlays[i].draw();
        }

        // Handle Open Positions
        // this.handlePositions(ctx);

        // Handle Price Line
        this.handlePriceLine(ctx);

        // Handle Drawings
        // this.handleDrawings(ctx);

        const studies = this.getStudies();
        this.drawPrices(ctx, price_data);

        // Restore context
        ctx.restore();

        // Reset Transform
        ctx.setTransform(1.0, 0, 0, 1.0, 0, 0);
        
        for (let i = 0; i < studies.length; i++)
        {
            let study = studies[i];
            this.calculateIndicator(this.state.studies[i].ind);

            start_pos = this.getSegmentStartPos(study.getWindowIndex());
            segment_size = this.getSegmentSize(study.getWindowIndex());
            
            this.defineClip(ctx, start_pos, segment_size);
            // Draw Study
            study.drawTimeGrid(ctx, time_data);
            const study_price_data = study.drawPriceGrid(ctx);
            study.draw();
            study.drawPrices(ctx, study_price_data); 
            study.drawSeparator(ctx);

            // Restore context
            ctx.restore(); 
        }

        this.drawTimes(ctx, time_data);
        // Handle Cross Segment Drawings
        // this.handleUniversalDrawings(ctx);
        // Handle Crosshairs
        this.handleCrosshairs(ctx);
    }

    getNumZeroDecimals(x)
    {
        const decimals = String(x).split('.')[1];
        for (let i = 0; i < decimals.length; i++)
        {
            if (decimals[i] !== '0') return i;
        }
        return -1;
    }

    setPriceInterval()
    {
        const camera = this.getCamera();
        const seg_size = this.getSegmentSize(0);
        const { scale, intervals } = this.state;
        const min_dist = 100;
        const possible_intervals = [1, 2, 5, 10];

        const min_world_dist = camera.convertScreenUnitToWorldUnit(
            { x: 0, y: min_dist }, seg_size, scale
        );
        const decimals = this.getNumZeroDecimals(min_world_dist.y);
        
        let start = Math.ceil(min_world_dist.y * Math.pow(10, decimals+1));
        intervals.y = possible_intervals.filter((x) => x >= start)[0] / Math.pow(10, decimals+1);

        this.setState({ intervals }); 
    }

    setTimeInterval()
    {
        const camera = this.getCamera();
        const seg_size = this.getSegmentSize(0);
        const { scale, intervals } = this.state;
        const timestamps = this.getTimestamps().concat(this.state.future_timestamps);

        const min_dist = 100;
        const min_world_dist = camera.convertScreenUnitToWorldUnit(
            { x: min_dist, y: 0 }, seg_size, scale
        );

        const target_interval = timestamps[Math.ceil(min_world_dist.x)] - timestamps[0];
        let interval_x = 0;
        
        let i = 0;
        while (interval_x < target_interval)
        {
            interval_x = this.getPeriodOffsetSeconds(i)
            i += 1;
        }
        intervals.x = interval_x;
        this.setState({ intervals });
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
        return this.props.getPeriodOffsetSeconds(period);
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

    getPriceFormat(offset)
    {
        if (offset < this.props.getPeriodOffsetSeconds("D"))
            return 'HH:mm';
        else if (offset < this.props.getPeriodOffsetSeconds("W"))
            return 'ddd d';
        else if (offset < this.props.getPeriodOffsetSeconds("Y"))
            return 'MMM';
        else
            return 'YYYY';
    }

    drawPriceGrid(ctx)
    {
        
        const camera = this.getCamera();
        const seg_size = this.getSegmentSize(0);
        const { pos, scale, intervals } = this.state;

        const start_pos = camera.convertScreenPosToWorldPos(
            { x: 0, y: -seg_size.height }, pos, seg_size, scale
        );
        const end_pos = camera.convertScreenPosToWorldPos(
            { x: 0, y: seg_size.height }, pos, seg_size, scale
        );

        if (intervals.y === 0) return;
        let y = start_pos.y;

        if (intervals.y < 1.0)
        {
            const decimals = intervals.y.toString().split('.')[1].length;
            const multi = Math.pow(10, (decimals-1));
            y = Math.round(y * multi) / multi;
            
        }
        else
        {
            
        }
        
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
            y -= intervals.y;
        }
        return data;
    }

    drawTimeGrid(ctx)
    {
        const camera = this.getCamera();
        const seg_size = this.getSegmentSize(0);

        const off = this.getPeriodOffsetSeconds(this.getPeriod());
        const ohlc = this.getBids();
        const timestamps = this.getTimestamps().concat(this.state.future_timestamps);

        const { pos, scale, intervals } = this.state;

        if (intervals.x === 0) return;

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


        const tz = 'Australia/Melbourne';
        let time = this.getWeekendDates(
            moment(ts*1000).subtract(7, 'd').unix()
        )[1].tz(tz);

        let x_off = Math.ceil((ts - time.unix()) / off);

        let data = [];
        for (let i = x + x_off; i >= pos.x; i-=parseInt(intervals.x/off))
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
                data.push(i);
            }
        }
        return data;
    }

    drawPrices(ctx, data)
    {
        if (data === undefined) return;

        const camera = this.getCamera();
        const { pos, scale } = this.state;
        const seg_size = this.getSegmentSize(0);

        // Font settings
        const font_size = 10;
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
            
            ctx.strokeText(c_y.toFixed(5), seg_size.width - 5, screen_y + (3/4 * (font_size/2)));
            ctx.fillText(c_y.toFixed(5), seg_size.width - 5, screen_y + (3/4 * (font_size/2)));
        }
    }

    drawTimes(ctx, data)
    {
        if (data === undefined) return;

        const camera = this.getCamera();
        const { pos, scale } = this.state;
        const timestamps = this.getTimestamps();
        const all_timestamps = this.getAllTimestamps();
        const tz = 'Australia/Melbourne';

        const chart_size = this.getChartSize();
        const start_pos = { x: 0, y: chart_size.height }
        const seg_size = { width: chart_size.width, height: this.getBottomOff()}

        // Font settings
        const font_size = 10;
        ctx.font = String(font_size) + 'pt trebuchet ms'; //Consolas
        ctx.fillStyle = 'rgb(80, 80, 80)';
        ctx.textAlign = 'left';


        const num_extra = all_timestamps.length - timestamps.length;
        // Draw grid

        for (let i = 0; i < data.length; i++)
        {
            const c_x = data[i];
            const idx = (all_timestamps.length) - (c_x + num_extra);
            let time = undefined;
            if (c_x >= -num_extra)
            {
                time = moment(all_timestamps[idx]*1000).tz(tz);
            }

            let screen_x = camera.convertWorldPosToScreenPos(
                { x: c_x+0.5, y: 0 }, pos, seg_size, scale
            ).x;

            ctx.strokeStyle = `rgb(240, 240, 240)`;
            ctx.lineWidth = 0.9;

            ctx.beginPath();
            ctx.moveTo(screen_x, start_pos.y); 
            ctx.lineTo(screen_x, start_pos.y + seg_size.height);
            ctx.stroke();

            if (time !== undefined)
            {
                ctx.strokeStyle = 'rgb(255, 255, 255)';
                ctx.lineWidth = 2.0;
                ctx.strokeText(
                    time.format(this.getCurrentPriceFormat()), 
                    screen_x, 
                    start_pos.y + seg_size.height - 4
                );
                ctx.fillText(
                    time.format(this.getCurrentPriceFormat()), 
                    screen_x, 
                    start_pos.y + seg_size.height - 4
                );
            }
        }

        ctx.fillRect(0, start_pos.y, seg_size.width, 1); 
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
            // Skip if x doesn't exist
            if (x === undefined) continue;

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

    drawVerticalLine(ctx, pos, properties)
    {
        const chart_size = this.getChartSize();

        // Handle properties
        ctx.fillStyle = properties.colors[0];
        ctx.fillRect(Math.round(pos.x - properties.scale/2), 0, properties.scale, chart_size.height);
    }

    drawHorizontalLine(ctx, pos, properties)
    {
        const chart_size = this.getChartSize();

        // Handle properties
        ctx.fillStyle = properties.colors[0];
        ctx.fillRect(0, Math.round(pos.y - properties.scale/2), chart_size.width, properties.scale);
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

            // Get Position
            const x = this.getPosFromAllTimestamps(d_props.timestamps[0]);
            // Skip if x doesn't exist
            if (x === undefined) continue

            const y = d_props.prices[0];
            const screen_pos = camera.convertWorldPosToScreenPos(
                { x: x+0.5, y: y }, 
                pos, 
                seg_size,
                scale
            )
            
            // Handle Vertical Line
            if (d_props.type === 'verticalLine')
                continue
            // Handle Horizontal Line
            else if (d_props.type === 'horizontalLine')
                this.drawHorizontalLine(ctx, screen_pos, d_props.properties);
            // Handle Misc Drawings
            else
            {
                if (!(d_props.type in Drawings)) continue;
                const drawing = Drawings[d_props.type]();

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
    }

    handleUniversalDrawings(ctx)
    {
        const camera = this.getCamera();
        const { pos, scale } = this.state;
        const seg_size = this.getSegmentSize(0);

        const drawings = this.getDrawingsProperties();

        for (let i = 0; i < drawings.length; i++)
        {
            const d_props = drawings[i];

            // Get Position
            const x = this.getPosFromAllTimestamps(d_props.timestamps[0]);
            // Skip if x doesn't exist
            if (x === undefined) continue

            const y = d_props.prices[0];
            const screen_pos = camera.convertWorldPosToScreenPos(
                { x: x+0.5, y: y }, 
                pos, 
                seg_size,
                scale
            )
            
            // Handle Vertical Line
            if (d_props.type === 'verticalLine')
                this.drawVerticalLine(ctx, screen_pos, d_props.properties);
        }
    }

    handlePriceLine(ctx)
    {
        const { pos, scale } = this.state;
        const seg_size = this.getSegmentSize(0);
        const camera = this.getCamera();
        const bids = this.getBids();

        let c_bid = 0;
        for (let i = bids.length-1; i >= 0; i--)
        {
            c_bid = bids[i][3];
            if (c_bid !== 0) break;
        }

        const screen_pos = camera.convertWorldPosToScreenPos(
            { x: 0, y: c_bid }, pos, seg_size, scale
        );

        // Box Settings
        ctx.fillStyle = '#3498db';
        ctx.fillRect(0, Math.round(screen_pos.y), seg_size.width, 1);

        // Font settings
        const font_size = 10;
        ctx.font = String(font_size) + 'pt trebuchet ms'; //Consolas
        ctx.textAlign = 'right';

        const text_size = ctx.measureText(String(c_bid.toFixed(5)));
        const box_height = Math.round(3/4 * (font_size) + 12);
        const box_width = Math.round(text_size.width + 12);
        ctx.fillRect(
            Math.round(seg_size.width - box_width), 
            Math.round(screen_pos.y - box_height/2),
            seg_size.width,
            box_height
        );

        ctx.fillStyle = 'rgb(255, 255, 255)';

        ctx.fillText(
            c_bid.toFixed(5), 
            seg_size.width - 7, 
            Math.round(screen_pos.y + (3/4 * (font_size/2)))
        );
    }

    handleCrosshairs(ctx)
    {
        let { mouse_pos } = this.state;
        const camera = this.getCamera();
        const chart_size = this.getChartSize();
        const seg_idx = this.getSegment(mouse_pos);
        const seg_size = this.getSegmentSize(seg_idx);
        const seg_start = this.getSegmentStartPos(seg_idx);

        let pos, scale = undefined;
        if (seg_idx > 0)
        {
            const study = this.getStudies()[seg_idx-1];
            pos = { x: this.state.pos.x, y: study.getPos().y};
            scale = { x: this.state.scale.x, y: study.getScale().y};
        }
        else
        {
            pos = this.state.pos;
            scale = this.state.scale;
        }
        
        const screen_pos = this.props.getScreenPos();
        const top_offset = this.props.getTopOffset() + screen_pos.y;
        const mouse_world_pos = camera.convertScreenPosToWorldPos(
            { x: mouse_pos.x, y: mouse_pos.y - seg_start.y - top_offset }, pos, seg_size, scale
        );
            
        const left_offset = screen_pos.x;
        if (mouse_pos.x < left_offset ||
            mouse_pos.x > chart_size.width + left_offset ||
            mouse_pos.y < top_offset ||
            mouse_pos.y > chart_size.height + top_offset)
            return
        
        ctx.fillStyle = '#787878';
        let c_x = 0;

        const snap_x = camera.convertWorldPosToScreenPos(
            { x: Math.floor(mouse_world_pos.x)+0.5, y:0 }, pos, seg_size, scale
        ).x;

        const line_width = 5;
        const line_space = 4;
        while (c_x < chart_size.width)
        {
            ctx.fillRect(c_x, Math.round(mouse_pos.y - top_offset), line_width, 1);
            c_x += line_width + line_space;
        }

        let c_y = 0;
        while (c_y < chart_size.height + this.getBottomOff())
        {
            ctx.fillRect(Math.round(snap_x - left_offset), c_y, 1, line_width);
            c_y += line_width + line_space;
        }

        // Box Settings
        ctx.fillStyle = 'rgb(80,80,80)';

        // Font settings
        const font_size = 10;
        ctx.font = String(font_size) + 'pt trebuchet ms'; //Consolas
        ctx.textAlign = 'right';

        const text_size = ctx.measureText(String(mouse_world_pos.y.toFixed(5)));
        const box_height = Math.round(3/4 * (font_size) + 12);
        const box_width = Math.round(text_size.width + 12);
        ctx.fillRect(
            Math.round(chart_size.width - box_width), 
            Math.round(mouse_pos.y - top_offset - box_height/2),
            chart_size.width,
            box_height
        );

        ctx.fillStyle = 'rgb(255, 255, 255)';

        ctx.fillText(
            mouse_world_pos.y.toFixed(5), 
            chart_size.width - 7, 
            Math.round(mouse_pos.y - top_offset + (3/4 * (font_size/2)))
        );
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
        // Return undefined if timestamp is greater than latest existing timestamp
        if (ts > timestamps[timestamps.length-1])
            return undefined

        const indicies = [...Array(timestamps.length).keys()]
        const idx = indicies.reduce(function(prev, curr) {
            return (
                Math.abs(timestamps[curr] - ts) < Math.abs(timestamps[prev] - ts) ? curr : prev
            );
        });

        return idx;
    }

    getAllTimestampsIdx = (ts) =>
    {
        const timestamps = this.getAllTimestamps();
        // Return undefined if timestamp is greater than latest existing timestamp
        if (ts > timestamps[timestamps.length-1])
            return undefined

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
        if (idx !== undefined) return this.getTimestamps().length - idx;
        else return undefined;
    }

    getPosFromAllTimestamps = (ts) =>
    {
        const idx = this.getAllTimestampsIdx(ts);
        if (idx !== undefined) return this.getTimestamps().length - idx;
        else return undefined;
        
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

            if (ts >= c_weekend[0].unix())
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

    getSegment = (pos) =>
    {
        const portions = this.getPortions();

        for (let i=0; i < portions.length; i++)
        {
            const seg_size = this.getSegmentSize(i);
            const seg_start = this.getSegmentStartPos(i);
            if (pos.y >= seg_start.y + this.props.getTopOffset() && 
                    pos.y < seg_start.y + this.props.getTopOffset() + seg_size.height)
                return i;
        }

        return null;
    }

    getBottomOff = () =>
    {
        return 20;
    }

    getChartSize = () =>
    {
        const container_size = this.getSize();

        return {
            width: container_size.width,
            height: container_size.height - this.getBottomOff()
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

    getCurrentPriceFormat = () =>
    {
        return this.getPriceFormat(this.state.intervals.x);
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

    getWindowInfo = () =>
    {
        return this.props.getWindowInfo();
    }

    windowExists = () =>
    {
        return this.props.windowExists(this.props.strategy_id, this.props.item_id);
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

    getOverlayProperties = (idx) =>
    {
        return this.getProperties().overlays[idx].properties;
    }

    getOverlayValues = (idx) =>
    {
        const { overlays } = this.state;
        let result = [];
        for (let i = 0; i < overlays[idx].ind.properties.periods.length; i++)
        {
            result.push(
                Indicators
                [overlays[idx].ind.type]
                [this.getPrice()]
                [overlays[idx].ind.properties.periods[i]]
            );
        }
        return result;
    }

    getStudyProperties = (idx) =>
    {
        return this.getProperties().studies[idx].properties;
    }

    getStudyValues = (idx) =>
    {
        const { studies } = this.state;
        let result = [];
        for (let i = 0; i < studies[idx].ind.properties.periods.length; i++)
        {
            result.push(
                Indicators
                [studies[idx].ind.type]
                [this.getPrice()]
                [studies[idx].ind.properties.periods[i]]
            );
        }
        return result;
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
            this.getPeriod(),
            this.props.getCountDateFromDate(this.getPeriod(), 1000, moment(), -1),
            moment()
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

    getAllTimestamps = () =>
    {
        return this.getTimestamps().concat(this.state.future_timestamps);
    }

    getAsks = () =>
    {
        return this.getChart().asks;
    }

    getBids = ()  =>
    {
        return this.getChart().bids;
    }

    calculateIndicator = (ind) =>
    {
        this.props.calculateIndicator(
            this.getChart(),
            this.getPrice(),
            ind
        );
    }

}

const SPACEBAR = 32;






export default Chart;