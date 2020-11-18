import React, { Component } from 'react';
import Camera from '../Camera';
import Candlesticks from './chart/Candlesticks';
import Overlay from './chart/Overlay';
import Study from './chart/Study';
import _ from 'underscore';
import moment from "moment-timezone";
import Drawings from '../paths/Paths';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCoin, faEye, faUndo, faDollarSign, faCog
} from '@fortawesome/pro-light-svg-icons';


class Chart extends Component 
{
    state = {
        pos: {
            x: -50, y: 0,
        },
        scale: {
            x: 200.0, y:0.2,
        },
        intervals: {
            x: 0, y: 0
        },
        prices: undefined,
        future_timestamps: [],
        is_down: false,
        is_move: false,
        before_change: null,
        trans_x: 0,
        limit: [null,null],
        first_load: true,
        is_scrolling: null,
        is_loading: false,
        auto_zoom: true,
        cursor: 'inherit',
        hovered: {
            vert_axis: false,
            horiz_axis: false,
            bar: false
        }
    }

    constructor(props)
    {
        super(props);

        // Overlays
        this.overlays = [];
        this.overlayPrices = [];

        // Studies
        this.studies = [];
        this.studyPrices = [];

        // Refs Setters
        this.setContainerRef = elem => {
            this.container = elem;
        }
        this.setContextMenuRef = elem => {
            this.contextMenu = elem;
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
        this.addOverlayPriceRef = elem => {
            this.overlayPrices.push(elem);
        }
        this.addStudyPriceRef = elem => {
            this.studyPrices.push(elem);
        }

        this._ismounted = true;
        this._isinitialized = false;

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = _.throttle(this.onMouseMove.bind(this), 1);
        // this.onMoveThrottled = _.throttle(this.onMoveThrottled.bind(this), 20);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.update = this.update.bind(this);
        this.onScroll = _.throttle(this.onScroll.bind(this), 20);
    }

    async componentDidMount() 
    {
        window.addEventListener("mousedown", this.onMouseDown);
        window.addEventListener("mousemove", this.onMouseMove);
        // window.addEventListener("mousemove", this.onMoveThrottled);

        window.addEventListener("mouseup", this.onMouseUp);
        window.addEventListener("resize", this.update);

        window.addEventListener(
            "onwheel" in document ? "wheel" : "mousewheel",
            this.onScroll
        );

        this.updateCanvas();

        if (this.isBacktest())
        {
            const properties = this.getStrategy().properties;
            this.limit(properties.start, properties.end);
        }

        console.log('chart before');
        /* Initialize Chart */
        if (this.getChart() === undefined)
            await this.addChart();
        console.log('chart created');

        /* Initialize Indicators */
        const overlays = this.getOverlays();
        const studies = this.getStudies();

        // Overlays
        for (let i = 0; i < overlays.length; i++)
        {
            const ind = overlays[i];
            this.getIndicator(ind);
        }

        // Studies
        for (let i = 0; i < studies.length; i++)
        {
            const ind = studies[i];
            this.getIndicator(ind);
        }

        if (this._ismounted)
        {
            this.setFutureTimestamps();
            this.setPriceInterval();
            this.setTimeInterval();
        }

        this._isinitialized = true;
    }

    componentDidUpdate() 
    {
        let { pos, scale, first_load, trans_x, auto_zoom } = this.state;

        if (this.getChart() !== undefined)
        {
            const bids = this.getBids();
            const chart_properties = this.getChartProperties(bids, Math.floor(pos.x), scale);
            if (first_load)
            {
                first_load = false;
                pos = chart_properties.pos;
                scale = chart_properties.scale;
                this.setState({ pos, scale, first_load });
            }
            else if (auto_zoom)
            {
                if (trans_x === 0)
                {
                    const num_steps = 3;
                    const c_scale = scale.y;
                    const scale_interval = (chart_properties.scale.y - c_scale) / Math.pow(num_steps, 2);
                    this.transitionScaleY(num_steps, scale_interval, c_scale, null, null, 0, this);
                }
                
                for (let i = 0; i < this.studies.length; i++)
                {
                    const study = this.studies[i];
                    const study_properties = study.getStudyProperties();
                    if (study.getScale().y === 0)
                    {
                        study.setScaleY(study_properties.scale.y);
                    }
                    else if (study.getTransX() === 0)
                    {
                        const num_steps = 3;
                        const c_scale = study.getScale().y;
                        const scale_interval = (study_properties.scale.y - c_scale) / Math.pow(num_steps, 2);
                        const c_pos = study.getPos().y;
                        const pos_interval = (study_properties.pos.y - c_pos) / Math.pow(num_steps, 2);
                        this.transitionScaleY(num_steps, scale_interval, c_scale, pos_interval, c_pos, 0, study);
                    }
                }
            }
        }

        this.update(); 
    }

    componentWillUnmount()
    {
        this._ismounted = false;
        window.removeEventListener("mousedown", this.onMouseDown);
        window.removeEventListener("mousemove", this.onMouseMove);
        // window.removeEventListener("mousemove", this.onMoveThrottled);

        window.removeEventListener("mouseup", this.onMouseUp);
        window.removeEventListener("resize", this.update);

        window.removeEventListener(
            "onwheel" in document ? "wheel" : "mousewheel",
            this.onScroll
        );
    }

    render() {
        return (
            <div
                className='chart container'
                ref={this.setContainerRef}
                style={{
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                    cursor: this.state.cursor
                }}
                onContextMenu={this.onContextMenu.bind(this)}
                onDoubleClick={this.onDoubleClick.bind(this)}
            >
                <div ref={this.setContextMenuRef} className='context-menu body'>
                    <div className='context-menu item separator' onClick={this.onContextMenuItem.bind(this)} name={'trade'}>
                        <FontAwesomeIcon icon={faCoin} />
                        Trade
                    </div>
                    <div className='context-menu item left-space' onClick={this.onContextMenuItem.bind(this)} name={'bar-types'}>Bar Types</div>
                    <div className='context-menu item' onClick={this.onContextMenuItem.bind(this)} name={'price'}>
                        <FontAwesomeIcon icon={faDollarSign} />
                        Price
                    </div>
                    <div className='context-menu item' onClick={this.onContextMenuItem.bind(this)} name={'show'}>
                        <FontAwesomeIcon icon={faEye} />
                        Show
                    </div>
                    <div className='context-menu item left-space separator' onClick={this.onContextMenuItem.bind(this)} name={'layouts'}>Layouts</div>
                    <div className='context-menu item' onClick={this.onContextMenuItem.bind(this)} name={'reset'}>
                        <FontAwesomeIcon icon={faUndo} />
                        Reset
                    </div>
                    <div className='context-menu item' onClick={this.onContextMenuItem.bind(this)} name={'settings'}>
                        <FontAwesomeIcon icon={faCog} />
                        Settings
                    </div>
                </div>
                <div className='chart info'>
                    {this.generateInfo()}
                </div>
                <canvas
                    className='chart canvas'
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
                    getTimestamps={this.getTimestamps}
                    getCurrentTimestamp={this.getCurrentTimestamp}
                    getWindowInfo={this.getWindowInfo}
                />
                {this.generateOverlays()}
                {this.generateStudies()}
            </div>
        );
    }

    onDoubleClick(e)
    {
        e.preventDefault();

        let { auto_zoom } = this.state;
        auto_zoom = true;
        this.setState({ auto_zoom });
    }

    onMouseDown(e)
    {
        const keys = this.props.getKeys();
        if (keys.includes(SPACEBAR)) return;

        const mouse_pos = {
            x: e.clientX, y: e.clientY
        }
        const top_offset = this.props.getTopOffset();

        if (this.props.isTopWindow(
            this.getStrategyId(), this.getItemId(), 
            { x: mouse_pos.x, y: mouse_pos.y - top_offset }
        ))
        {
            let { is_down, is_move, pos, before_change, hovered } = this.state;
    
            // Check mouse within main segment bounds
    
            let start_pos = this.getWindowSegmentStartPos(0);
            let segment_size = this.getSegmentSize(0);
            let rect = {
                x: start_pos.x,
                y: start_pos.y + top_offset,
                width: segment_size.width,
                height: segment_size.height
            }
            
            if (!keys.includes(SPACEBAR))
            {
                is_down = true;
                if (!(hovered.horiz_axis || hovered.vert_axis))
                {
                    if (this.isWithinBounds(rect, mouse_pos))
                    {
                        e.preventDefault();
                        is_move = true;
                        before_change = { x: pos.x, y: pos.y };
                    }
                    else
                    {
                        // Check mouse within study bounds
                        const studies = this.getStudyComponents();
                        for (let i = 0; i < studies.length; i++)
                        {
                            let study = studies[i];
                            start_pos = this.getWindowSegmentStartPos(study.getWindowIndex());
                            segment_size = this.getSegmentSize(study.getWindowIndex());
                            rect = {
                                x: start_pos.x,
                                y: start_pos.y + top_offset,
                                width: segment_size.width,
                                height: segment_size.height
                            }
            
                            
                            const handle_rect = this.getHandleRect(start_pos, segment_size);
                            handle_rect.y += top_offset
                            if (this.isWithinBounds(handle_rect, mouse_pos))
                            {
                                is_down = false;
                                is_move = false;
                                
                                study.setIsResize(true);
                                return
                            }
                            else if (this.isWithinBounds(rect, mouse_pos)) 
                            {
                                e.preventDefault();
                                is_down = true;
                                study.setIsMove(true);
                                this.setState({ is_down });
                                return
                            }
                        }
                    }
                }
            }

            this.handleCursor(hovered, is_down);
            this.setState({ is_down, is_move, before_change });
        }
    }

    onMouseMove(e)
    {
        const keys = this.props.getKeys();
        if (keys.includes(SPACEBAR)) return;

        let { is_down, is_move, auto_zoom, hovered } = this.state;

        if (is_down)
        {
            e.preventDefault();

            let { pos, scale } = this.state;
            const camera = this.getCamera();
            const screen_move = { x: e.movementX, y: e.movementY };
            let move = camera.convertScreenUnitToWorldUnit(
                screen_move, this.getSegmentSize(0), scale
            );
            
            if (hovered.horiz_axis)
            {
                const speed = 0.5;
                scale.x += (scale.x * speed * (screen_move.x / 100.0));
                scale.x = this.clampScale(scale.x);
                this.setTimeInterval();

                auto_zoom = false;
            }
            else if (hovered.vert_axis)
            {
                const speed = 0.3;
                scale.y += (scale.y * speed * (screen_move.y / 100.0));
                this.setPriceInterval();

                auto_zoom = false;
            }
            else
            {
                pos.x += move.x;
                if (is_move)
                    pos.y += move.y;
            }

            this.setState({ pos, scale, auto_zoom });
        }
    }

    onMouseMoveThrottled(mouse_pos)
    {
        const { is_down } = this.state;
        const keys = this.props.getKeys();
        if (this.getChart() !== undefined && !keys.includes(SPACEBAR) && !is_down)
        {
            const top_offset = this.props.getTopOffset();
            const is_top = this.props.isTopWindow(
                this.getStrategyId(), this.getItemId(), 
                { x: mouse_pos.x, y: mouse_pos.y - top_offset }
            );
            let { hovered } = this.state;
            let isChanged = false;

            isChanged = isChanged || this.onBarHover(mouse_pos, is_top, hovered);
            isChanged = isChanged || this.onVertAxisHover(mouse_pos, is_top, hovered);
            isChanged = isChanged || this.onHorizAxisHover(mouse_pos, is_top, hovered);

            if (isChanged)
            {
                this.handleCursor(hovered, is_down);
            }

        }
    }

    onVertAxisHover(mouse_pos, is_top, hovered)
    {
        if (this.getChart() !== undefined && is_top)
        {
            const top_offset = this.props.getTopOffset();
            const seg_size = this.getSegmentSize(0);
            const start_pos = this.getWindowSegmentStartPos(0);

            const canvas = this.getCanvas();
            const ctx = canvas.getContext("2d");

            const font_size = 10;
            ctx.font = String(font_size) + 'pt trebuchet ms'; //Consolas
            const text_width = ctx.measureText((0).toFixed(5)).width; // Get placeholder text width

            mouse_pos = { x: mouse_pos.x, y: mouse_pos.y - top_offset };
            const rect = {
                x: start_pos.x + (seg_size.width - text_width),
                y: start_pos.y,
                width: seg_size.width,
                height: seg_size.height
            }
            if (!hovered.vert_axis && this.isWithinBounds(rect, mouse_pos))
            {
                hovered.vert_axis = true;
                return true;
            }
            else if (hovered.vert_axis && !this.isWithinBounds(rect, mouse_pos))
            {
                hovered.vert_axis = false;
                return true;
            }
        }

        return false;
    }

    onHorizAxisHover(mouse_pos, is_top, hovered)
    {
        if (this.getChart() !== undefined && is_top)
        {
            const top_offset = this.props.getTopOffset();
            const bottom_offset = this.getBottomOff();
            const chart_size = this.getChartSize();
            const start_pos = this.getWindowSegmentStartPos(0);
            let { hovered } = this.state;

            mouse_pos = { x: mouse_pos.x, y: mouse_pos.y - top_offset };
            const rect = {
                x: start_pos.x,
                y: (start_pos.y + chart_size.height),
                width: chart_size.width,
                height: chart_size.height + bottom_offset
            }
            if (!hovered.horiz_axis && this.isWithinBounds(rect, mouse_pos))
            {
                hovered.horiz_axis = true;
                return true;
            }
            else if (hovered.horiz_axis && !this.isWithinBounds(rect, mouse_pos))
            {
                hovered.horiz_axis = false;
                return true;
            }
        }
        return false;
    }

    onBarHover(mouse_pos, is_top, hovered)
    {
        if (this.getChart() !== undefined && this.isBacktest())
        {
            if (is_top)
            {
                const timestamp = this.isWithinBarBounds(mouse_pos);
                if (timestamp !== null && !hovered.bar)
                {
                    hovered.bar = true;
                    return true;
                }
                else if (hovered.bar)
                {
                    hovered.bar = false;
                    return true;
                }
            }
        }
        return false;
    }

    handleCursor(hovered, is_down)
    {
        let { cursor } = this.state;

        if (hovered.horiz_axis)
        {
            cursor = 'w-resize';
        }
        else if (hovered.vert_axis)
        {
            cursor = 'ns-resize';
        }
        else if (hovered.bar)
        {
            cursor = 'pointer';
        }
        else if (is_down)
        {
            cursor = 'grabbing';
        }
        else
        {
            cursor = 'inherit';
        }

        this.setState({ hovered, cursor });
    }

    onMouseUp(e)
    {
        const keys = this.props.getKeys();
        if (keys.includes(SPACEBAR)) return;

        const studies = this.getStudyComponents();
        for (let i = 0; i < studies.length; i++) 
        {
            studies[i].setIsMove(false);
        }

        let { is_down, is_move, before_change, trans_x, pos, scale, hovered } = this.state;
        is_down = false;

        if (is_move)
        {
            if (scale.x < 500)
            {
                is_move = false;
                trans_x = 0;
                for (let study of this.studies)
                {
                    study.setTransX(0);
                }
            }
            else
            {
                const chart_properties = this.getChartProperties(this.getBids(), Math.floor(pos.x), scale);
                scale.y = chart_properties.scale.y;

                for (let study of this.studies)
                {
                    study.setStudyProperties(study.getResult());
                }
            }
        }

        this.handleCursor(hovered, is_down);

        const mouse_pos = {
            x: e.clientX, y: e.clientY
        }
        const top_offset = this.props.getTopOffset();

        if (this._isinitialized && before_change !== null && this.isBacktest())
        {
            if (Math.abs(pos.x - before_change.x) < 1 && Math.abs(pos.y - before_change.y) < 1)
            {
                if (this.props.isTopWindow(
                    this.getStrategyId(), this.getItemId(), 
                    { x: mouse_pos.x, y: mouse_pos.y - top_offset }
                ))
                {
                    const timestamp = this.isWithinBarBounds(mouse_pos);
                    if (timestamp !== null)
                    {
                        this.props.setCurrentTimestamp(timestamp);
                    }
                }
            }
        }

        if (this.getChart()) this.setFutureTimestamps();
        
        const rect = this.contextMenu.getBoundingClientRect();
        if (!this.isWithinBounds(rect, mouse_pos))
        {
            this.contextMenu.style.display = 'none';
        }

        this.setState({ is_down, is_move, trans_x, scale });
    }

    onScroll(e)
    {
        if (this.getChart() !== undefined)
        {
            const mouse_pos = {
                x: e.clientX, y: e.clientY
            };
            let { pos, scale, is_scrolling, auto_zoom } = this.state;
            const dz = e.deltaY;
            const speed = 0.1;
    
            const camera = this.getCamera();
            const chart_size = this.getChartSize();
            // const num_candles = camera.convertScreenUnitToWorldUnit(
            //     { x: chart_size.width, y: 0 }, chart_size, scale
            // ).x;
    
            // Check mouse within main segment bounds
            const top_offset = this.props.getTopOffset();
    
            let start_pos = this.getWindowSegmentStartPos(0);
            let rect = {
                x: start_pos.x,
                y: start_pos.y + top_offset,
                width: chart_size.width,
                height: chart_size.height
            }
    
            if (this.isWithinBounds(rect, mouse_pos))
            {
                scale.x += (scale.x * speed * (dz / 100.0));
                scale.x = this.clampScale(scale.x);
                
                if (auto_zoom)
                {
                    const chart_properties = this.getChartProperties(this.getBids(), Math.floor(pos.x), scale);
                    scale.y = chart_properties.scale.y;
        
                    for (let study of this.studies)
                    {
                        study.setStudyProperties(study.getResult());
                    }
                }
    
                this.setState({ pos, scale, is_scrolling });
                this.setPriceInterval();
                this.setTimeInterval();
            }
        }
    }

    onContextMenu(e)
    {
        e.preventDefault();

        const top_offset = this.props.getTopOffset();
        const mouse_pos = {
            x: e.clientX, y: e.clientY - top_offset
        };

        this.contextMenu.style.display = 'block';
        this.contextMenu.style.left = mouse_pos.x + 'px';
        this.contextMenu.style.top = mouse_pos.y + 'px';
    }

    onContextMenuItem(e)
    {
        e.preventDefault();

        this.contextMenu.style.display = 'none';

        const name = e.target.getAttribute('name');
        
        // const popup = {
        //     type: 'chart-settings',
        //     size: {
        //         width: 60,
        //         height: 75
        //     },
        //     opened: undefined,
        //     properties: {
        //         item_id: this.getItemId()
        //     }
        // }
        // this.props.setPopup(popup);
    }

    clampScale = (x) =>
    {
        const min = 10, max = 2000;
        return Math.min(Math.max(x, min), max);
    }

    clampMove = (x) =>
    {
        const { scale } = this.state;
        return Math.max(x, scale.x);
    }

    runTransition(num_steps, scale_interval, c_scale, pos_interval, c_pos, i, obj)
    {
        let trans_x = obj.getTransX();

        if (trans_x < num_steps && i === trans_x)
        {
            trans_x += 1;
            obj.setTransX(trans_x);
            return new Promise(
                function (resolve) 
                {
                    setTimeout(() => 
                    {
                        if (this._ismounted)
                        {
                            if (c_scale !== null) 
                                obj.setScaleY(scale_interval * Math.pow(trans_x, 2) + c_scale);
                            if (c_pos !== null) 
                                obj.setPosY(pos_interval * Math.pow(trans_x, 2) + c_pos);
                            obj.setPriceInterval();
                            if (obj.setTimeInterval !== undefined) obj.setTimeInterval();
                            this.transitionScaleY(num_steps, scale_interval, c_scale, pos_interval, c_pos, i+1, obj);
                        }
                    }, 10);
                }.bind(this)
            );
        }
    }
    
    async transitionScaleY(
        num_steps, scale_interval, c_scale, 
        pos_interval, c_pos, i, obj
    )
    {
        await this.runTransition(num_steps, scale_interval, c_scale, pos_interval, c_pos, i, obj);
        this.forceUpdate();
    }

    generateOverlays() 
    {
        const overlays = this.getOverlays();
        let gen_overlays = [];
        if (this._isinitialized)
        {
            for (let i = 0; i < overlays.length; i++) {
                gen_overlays.push(
                    <Overlay
                        key={'overlay_'+i}
                        ref={this.addOverlayRef}
                        index={i}
                        getValues={this.getOverlayValues}
                        getOhlcValues={this.getBids}
                        getFilteredOffset={this.getFilteredOffset}
                        getProperties={this.getOverlayProperties}
                        getCamera={this.getCamera}
                        getCanvas={this.getCanvas}
                        getPos={this.getPos}
                        getScale={this.getScale}
                        getSegmentSize={this.getSegmentSize}
                        getWindowInfo={this.getWindowInfo}
                        getLimit={this.getLimit}
                        getTimestamps={this.getTimestamps}
                        getCurrentTimestamp={this.getCurrentTimestamp}
                    />
                );
            }
        }

        return gen_overlays;
    }

    generateStudies()
    {
        const studies = this.getStudies();

        let gen_studies = [];
        if (this._isinitialized)
        {
            for (let i = 0; i < studies.length; i++) 
            {
                gen_studies.push(
                    <Study
                        key={'study_'+i}
                        ref={this.addStudyRef}
                        index={i}
                        getValues={this.getStudyValues}
                        getOhlcValues={this.getBids}
                        getFilteredOffset={this.getFilteredOffset}
                        getProperties={this.getStudyProperties}
                        getTimestamps={this.getTimestamps}
                        getAllTimestamps={this.getAllTimestamps}
                        getNumZeroDecimals={this.getNumZeroDecimals}
                        getCamera={this.getCamera}
                        getCanvas={this.getCanvas}
                        getChartSize={this.getChartSize}
                        getPos={this.getPos}
                        getScale={this.getScale}
                        getSegmentStartPos={this.getChartSegmentStartPos}
                        getSegmentSize={this.getSegmentSize}
                        getWindowInfo={this.getWindowInfo}
                        getLimit={this.getLimit}
                        getTimestamps={this.getTimestamps}
                        getCurrentTimestamp={this.getCurrentTimestamp}
                        resizePortion={this.resizePortion}
                    />
                );
            }
        }

        return gen_studies;
    }

    generateInfo()
    {
        if (this._isinitialized)
        {
            const prices = this.getPriceInfo();
            if (prices !== undefined)
            {
                const overlays = this.getOverlays();
                let overlay_info = [];
                for (let i = 0; i < overlays.length; i++)
                {
                    const overlay = overlays[i];
    
                    let value_elems = [];
                    if (prices.overlays.length > 0)
                    {
                        for (let x = 0; x < prices.overlays[i].length; x++)
                        {
                            for (let y = 0; y < prices.overlays[i][x].length; y++)
                            {
                                let item = '';
                                let price = prices.overlays[i][x][y];
                                if (price === null || price === undefined) 
                                {
                                    price = '';
                                }
                                else
                                {
                                    price = price.toFixed(5);
                                }
        
                                
                                item = (
                                    <span className='chart values price'>
                                        {price}
                                    </span>
                                );
        
                                value_elems.push(
                                    <div key={x + '-' + y}>{item}</div>
                                );
                            }
                        }
                    }
    
                    const name = overlay.type.substring(0,1).toUpperCase() + overlay.type.substring(1);
                    // const name = overlay.type.toUpperCase();
                    overlay_info.push(
                        <div key={i} className='chart overlay-item'>
                            <div>
                                <div className='chart values overlay-type'>
                                    {name}
                                </div>
                                <div className='chart values price-group'>
                                    {value_elems}
                                </div>
                            </div>
                        </div>
                    );
                }
    
                const studies = this.getStudies();
                let study_info = [];
                for (let i = 0; i < studies.length; i++)
                {
                    const study = studies[i];
                    const start_pos = this.getChartSegmentStartPos(i+1);
    
                    let value_elems = [];
                    if (prices.studies.length > 0)
                    {
                        for (let x = 0; x < prices.studies[i].length; x++)
                        {
                            for (let y = 0; y < prices.studies[i][x].length; y++)
                            {
                                let item = '';
                                let price = prices.studies[i][x][y];
                                if (price === null || price === undefined) 
                                {
                                    price = '';
                                }
                                else
                                {
                                    price = price.toFixed(5);
                                }
    
                                if (y === 0) 
                                {
                                    item = (
                                        <React.Fragment>
    
                                        <span className='chart values period'>
                                            {study.properties.periods[x]}
                                        </span>
                                        <span className='chart values price'>
                                            {price}
                                        </span>
    
                                        </React.Fragment>
                                    );
                                }
                                else
                                {
                                    item = (
                                        <span className='chart values price'>
                                            {price}
                                        </span>
                                    );
                                }
    
                                value_elems.push(
                                    <span key={x + '' + y}>{item}</span>
                                );
                            }
                        }
                    }
    
                    const name = study.type.substring(0,1).toUpperCase() + study.type.substring(1);
                    study_info.push(
                        <div key={i} className='chart group study' style={{top: (start_pos.y + 10) + 'px', left: '5px'}}>
                            <div className='chart values type'>{name}</div>
                            {value_elems}
                        </div>
                    );
                }
    
                return (
                    <React.Fragment>
    
                    <div className='chart group'>
                        <div className='chart ohlc-group'>
                            <div className='chart product-btn'>{this.getProduct().replace('_', '')}</div>
                            <div className='chart period-btn'>{this.getPeriod()}</div>
                            <div>
                                <span className='chart values ohlc-type'>O</span>
                                <span className='chart values price' style={{color: prices.ohlc_color}}>{prices.ohlc[0].toFixed(5)}</span>
                                <span className='chart values ohlc-type'>H</span>
                                <span className='chart values price' style={{color: prices.ohlc_color}}>{prices.ohlc[1].toFixed(5)}</span>
                                <span className='chart values ohlc-type'>L</span>
                                <span className='chart values price' style={{color: prices.ohlc_color}}>{prices.ohlc[2].toFixed(5)}</span>
                                <span className='chart values ohlc-type'>C</span>
                                <span className='chart values price' style={{color: prices.ohlc_color}}>{prices.ohlc[3].toFixed(5)}</span>
                            </div>
                        </div>
                        <div className='chart overlay-group'>
                            {overlay_info}
                        </div>
                    </div>
                    {study_info}
    
                    </React.Fragment>
                )
            }
        }
    }

    update()
    {   
        if (this.getChart() && this._isinitialized)
        {
            this.updateCanvas();
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
            let from_dt = this.props.getCountDateFromDate(
                this.getPeriod(), 1000, to_dt.clone(), -1
            );

            // Clamp time
            from_dt = moment(this.clampLimit(from_dt.unix()) * 1000);

            if (from_dt !== to_dt && from_dt < to_dt)
            {
                // Retrieve all available data
                let data = await this.props.retrieveChartData(
                    this.getBroker(), this.getProduct(), this.getPeriod(), from_dt, to_dt
                );
    
                // Update chart with new data
                this.props.resetIndicators(this.getChart());
                this.props.updateChart(this.getBroker(), this.getProduct(), this.getPeriod(), data.ohlc);

                for (let i = 0; i < this.studies.length; i++)
                {
                    this.studies.resetResult();
                }
                // Allow new data loading
                is_loading = false;
                this.setState({ is_loading });
            }
        }
    }

    updateCanvas()
    {
        const chart_size = this.getSize();
        const canvas = this.getCanvas();
        canvas.setAttribute('width', Math.round(chart_size.width-1));
        canvas.setAttribute('height', Math.round(chart_size.height-1));
    }

    updateItems()
    {
        this.handleFutureTimestamps();

        const canvas = this.getCanvas();
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let start_pos = this.getChartSegmentStartPos(0);
        let segment_size = this.getSegmentSize(0);
       
        this.defineClip(ctx, start_pos, segment_size);

        // Draw Grid
        const price_data = this.drawPriceGrid(ctx);
        const time_data = this.drawTimeGrid(ctx);
        
        // Draw Candlesticks
        this.getCandlesticks().draw();

        const overlays = this.getOverlayComponents();
        for (let i = 0; i < overlays.length; i++)
        {
            overlays[i].draw();
        }

        // Handle Price Line
        if (!this.isBacktest())
        {
            this.handlePriceLine(ctx);
        }

        // Handle Positions/Orders
        this.handleTrades(ctx);

        // Handle Axis prices
        this.drawPrices(ctx, price_data);

        // Handle Price Label
        if (!this.isBacktest())
        {
            this.handlePriceLabel(ctx);
        }

        // Handle Drawings
        this.handleDrawings(ctx);

        const studies = this.getStudyComponents();

        // Restore context
        ctx.restore();

        // Reset Transform
        ctx.setTransform(1.0, 0, 0, 1.0, 0, 0);

        for (let i = 0; i < studies.length; i++)
        {
            let study = studies[i];

            start_pos = this.getChartSegmentStartPos(study.getWindowIndex());
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

            this.handleStudyHandles(ctx, start_pos, segment_size);
        }

        this.drawTimes(ctx, time_data);
        // Handle Cross Segment Drawings
        this.handleUniversalDrawings(ctx);
        // Handle Crosshairs
        this.handleCrosshairs(ctx);
    }

    handleFutureTimestamps()
    {
        const timestamps = this.getTimestamps();
        const latest_timestamp = timestamps[timestamps.length-1];
        let { future_timestamps } = this.state;
        let i = 0;
        if (future_timestamps[i] <= latest_timestamp)
        {
            while (future_timestamps[i] <= latest_timestamp)
            {
                future_timestamps.splice(i, 1);
                i++;
            }
    
            this.setState({ future_timestamps });
        }
    }

    getPriceInfo()
    {
        if (this.getChart() === undefined) return undefined;

        const { pos, scale } = this.state;
        const mouse_pos = this.props.getMousePos();
        let prices = {
            timestamp: null,
            ohlc: [],
            ohlc_color: null,
            overlays: [],
            overlay_colors: [],
            studies: [],
            study_colors: [],
        };

        const camera = this.getCamera();
        const chart_size = this.getChartSize();

        const screen_pos = this.props.getScreenPos();
        const top_offset = this.props.getTopOffset() + screen_pos.y;

        const overlays = this.getOverlays();
        const studies = this.getStudies();
        let x_pos = 1;

        if (
            mouse_pos !== null &&
            this.props.isTopWindow(
                this.getStrategyId(), this.getItemId(), 
                {x: mouse_pos.x, y: mouse_pos.y - top_offset}
            )
        )
        {
            x_pos = Math.floor(camera.convertScreenPosToWorldPos(mouse_pos, pos, chart_size, scale).x);
            x_pos = Math.max(x_pos, 1);
        }

        prices.timestamp = this.getTimestampByPos(Math.floor(x_pos));

        let isNext = true;
        while (isNext) 
        {
            isNext = false;
            prices.ohlc = this.getOhlcByPos(x_pos);
            if (prices.ohlc === undefined)
            {
                x_pos = 1;
                isNext = true;
            }
            else if (prices.ohlc[0] === 0 || prices.ohlc[0] === null) 
            {
                x_pos += 1;
                isNext = true;
            }

            let result = [];
            // Overlays
            result = [];
            for (let i = 0; i < overlays.length; i++)
            {
                if (this.getOverlayValues(i)[0].length > 0)
                {
                    const value = this.getOverlayValueByPos(i, x_pos);
                    for (let j = 0; j < value.length; j++)
                    {
                        if (value[j] === undefined || value[j].some(x => x === undefined))
                        {
                            x_pos = 1;
                            isNext = true;
                        }
                    }
                    result.push(value);
                }
                else
                {
                    return prices;
                }
            }
            prices.overlays = result;
            // Studies
            result = [];
            for (let i = 0; i < studies.length; i++)
            {
                if (this.getStudyValues(i)[0].length > 0)
                {
                    const value = this.getStudyValueByPos(i, x_pos);
                    for (let j = 0; j < value.length; j++)
                    {
                        if (value[j] === undefined || value[j].some(x => x === undefined))
                        {
                            x_pos = 1;
                            isNext = true;
                        }
                    }
                    result.push(value);
                }
                else
                {
                    return prices;
                }
            }
            prices.studies = result;
        }

        if (prices.ohlc[0] > prices.ohlc[3])
        {
            prices.ohlc_color = this.getWindowInfo().properties.bars.bodyShort
        }
        else
        {
            prices.ohlc_color = this.getWindowInfo().properties.bars.bodyLong
        }
        if (prices.ohlc_color.every(x => x === 255))
        {
            prices.ohlc_color = [0,0,0];
        }
        prices.ohlc_color = `rgba(${prices.ohlc_color[0]}, ${prices.ohlc_color[1]}, ${prices.ohlc_color[2]}, 1.0)`;

        return prices;
    }

    getNumZeroDecimals(x)
    {
        const decimals = String(x).split('.')[1];
        if (decimals !== undefined)
        {
            for (let i = 0; i < decimals.length; i++)
            {
                if (decimals[i] !== '0') return i;
            }
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
            return 'DD MMM \'YY  HH:mm';
        else if (offset < this.props.getPeriodOffsetSeconds("W"))
            return 'ddd d';
        else if (offset < this.props.getPeriodOffsetSeconds("Y"))
            return 'MMM';
        else
            return 'YYYY';
    }

    getShortPriceFormat(offset)
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
                    time.format(this.getCurrentShortPriceFormat()), 
                    screen_x, 
                    start_pos.y + seg_size.height - 4
                );
                ctx.fillText(
                    time.format(this.getCurrentShortPriceFormat()), 
                    screen_x, 
                    start_pos.y + seg_size.height - 4
                );
            }
        }

        ctx.fillStyle = 'rgb(180, 180, 180)';
        ctx.fillRect(0, start_pos.y, seg_size.width, 1); 
    }

    degsToRads(degs) { return degs / (180/Math.PI); }
    radsToDegs(rads) { return rads * (180/Math.PI); }

    handleTrades(ctx)
    {
        const camera = this.getCamera();
        const { pos, scale } = this.state;
        const seg_size = this.getSegmentSize(0);

        const trades = this.getPositions().concat(this.getOrders());
        for (let i = 0; i < trades.length; i++)
        {
            const c_trade = trades[i];
            if (!(c_trade.product === this.getProduct())) continue;
            // Get Position
            const x = this.getPosFromTimestamp(c_trade.open_time);
            // Skip if x doesn't exist
            if (x === undefined) continue;

            const entry_pos = camera.convertWorldPosToScreenPos(
                { x: x+0.5, y: c_trade.entry_price }, pos, seg_size, scale
            )
            const sl_pos = camera.convertWorldPosToScreenPos(
                { x: x+0.5, y: c_trade.sl }, pos, seg_size, scale
            )
            const tp_pos = camera.convertWorldPosToScreenPos(
                { x: x+0.5, y: c_trade.tp }, pos, seg_size, scale
            )

            let color = undefined;
            if (c_trade.direction === 'long')
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

            const trade_icon_size = 8;
            if (c_trade.order_type === 'limitorder' || c_trade.order_type === 'stoporder')
            {
                // Fill Rect
                ctx.fillRect(
                    Math.round(entry_pos.x - trade_icon_size/2)+0.5, 
                    Math.round(entry_pos.y - trade_icon_size/2)+0.5, 
                    trade_icon_size, trade_icon_size,
                );
                ctx.strokeRect(
                    Math.round(entry_pos.x - trade_icon_size/2)+0.5, 
                    Math.round(entry_pos.y - trade_icon_size/2)+0.5, 
                    trade_icon_size, trade_icon_size,
                );
            }
            else
            {
                // Fill Circle
                ctx.beginPath();
                ctx.arc(
                    Math.round(entry_pos.x)+0.5, Math.round(entry_pos.y)+0.5, 
                    trade_icon_size/2, 0, 2 * Math.PI
                );
                ctx.fill();
                ctx.stroke();
            }
            
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

    getHandleRect(start_pos, segment_size)
    {
        // Size Vars
        const handle_width = Math.min(segment_size.width/10, 21);
        const handle_height = Math.min(segment_size.height/15, 6);
        // Position Vars
        const handle_x = Math.round(segment_size.width/2 - handle_width/2) + 0.5;
        const handle_y = Math.round(start_pos.y) - (handle_height-1)/2;

        return {
            x: handle_x, y: handle_y, width: handle_width, height: handle_height
        }
    }

    handleStudyHandles(ctx, start_pos, segment_size)
    {
        const mouse_pos = this.props.getMousePos();
        const top_offset = this.props.getTopOffset();

        // Draw Handle
        const rect = this.getHandleRect(start_pos, segment_size);
        const handle_middle_off = Math.round(rect.width/3);

        if (
            this.isWithinBounds(rect, { x: mouse_pos.x, y: mouse_pos.y - top_offset }) &&
            !this.props.getKeys().includes(SPACEBAR)
        )
        {
            ctx.fillStyle = `rgba(180, 180, 180, 1.0)`;
            ctx.strokeStyle = `rgba(180, 180, 180, 1.0)`;

            ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

            ctx.fillStyle = `rgba(255, 255, 255, 1.0)`;
            ctx.fillRect(rect.x + handle_middle_off/2, Math.round(start_pos.y), rect.width - handle_middle_off, 1);

            if (this.getCursor() === 'inherit')
            {
                this.setCursor('ns-resize');
            }
        }
        else
        {
            ctx.fillStyle = `rgba(255, 255, 255, 1.0)`;
            ctx.strokeStyle = `rgba(180, 180, 180, 1.0)`;

            ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

            ctx.fillStyle = `rgba(180, 180, 180, 1.0)`;
            ctx.fillRect(rect.x + handle_middle_off/2, Math.round(start_pos.y), rect.width - handle_middle_off, 1);
            
            if (this.getCursor() === 'ns-resize')
            {
                this.setCursor('inherit');
            }
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

        const chart_drawings_layers = this.getProperties().drawing_layers;
        let drawings = this.getDrawings();

        for (let layer of chart_drawings_layers)
        {
            if (!(layer in drawings)) continue;

            for (let i = 0; i < drawings[layer].length; i++)
            {
                const d_props = drawings[layer][i];
                if (d_props.product !== this.getProduct()) continue;
    
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
                if (!UNIVERSAL_DRAWINGS.includes(d_props.type))
                {
                    // Handle Horizontal Line
                    if (d_props.type === 'horizontalLine')
                        this.drawHorizontalLine(ctx, screen_pos, d_props.properties);
                    // Handle Misc Drawings
                    else
                    {
                        if (!(d_props.type in Drawings)) continue;
                        const drawing = Drawings[d_props.type]();
        
                        // Get Rotation and Scale
                        const rotation = this.degsToRads(d_props.properties.rotation);
                        const drawing_scale = 0.01 * d_props.properties.scale;
                        
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
        }
    }

    handleUniversalDrawings(ctx)
    {
        const camera = this.getCamera();
        const { pos, scale } = this.state;
        const seg_size = this.getSegmentSize(0);

        const chart_drawings_layers = this.getProperties().drawing_layers;
        let drawings = this.getDrawings();

        if (!this.isBacktest())
        {
            const current_account = this.getCurrentAccount();
            if (current_account !== undefined && current_account in drawings)
            {
                drawings = drawings[current_account];
            }
            else
            {
                return;
            }
        }

        for (let layer of chart_drawings_layers)
        {
            if (!(layer in drawings)) continue;

            for (let i = 0; i < drawings[layer].length; i++)
            {
                const d_props = drawings[layer][i];

                if (UNIVERSAL_DRAWINGS.includes(d_props.type))
                {
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
        }
    }

    handlePriceLabel(ctx)
    {
        const { pos, scale } = this.state;
        const seg_size = this.getSegmentSize(0);
        const camera = this.getCamera();
        const bids = this.getBids();
        let c_bid = undefined;
        for (let i = bids.length-1; i >= 0; i--)
        {
            c_bid = bids[i][3];
            if (c_bid !== 0 && c_bid !== null) break;
        }

        const screen_pos = camera.convertWorldPosToScreenPos(
            { x: 0, y: c_bid }, pos, seg_size, scale
        );

        // Properties
        ctx.fillStyle = '#3498db';

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
            if (c_bid !== null) break;
        }

        const screen_pos = camera.convertWorldPosToScreenPos(
            { x: 0, y: c_bid }, pos, seg_size, scale
        );

        // Properties
        ctx.fillStyle = '#3498db';

        ctx.fillRect(0, Math.round(screen_pos.y), seg_size.width, 1);
    }

    handleCrosshairs(ctx)
    {
        const keys = this.props.getKeys();
        if (keys.includes(SPACEBAR)) return;

        const mouse_pos = this.props.getMousePos();
        const screen_pos = this.props.getScreenPos();
        const top_offset = this.props.getTopOffset() + screen_pos.y;
        
        if (
            this.props.isTopWindow(
                this.getStrategyId(), this.getItemId(), 
                {x: mouse_pos.x, y: mouse_pos.y - this.props.getTopOffset()}
            )
        )
        {
            const camera = this.getCamera();
            const chart_size = this.getChartSize();
            const seg_idx = this.getSegment(mouse_pos);
            const seg_size = this.getSegmentSize(seg_idx);
            const seg_start = this.getChartSegmentStartPos(seg_idx);
            const window_seg_start = this.getWindowSegmentStartPos(0);
    
            let pos, scale = undefined;
            if (seg_idx > 0)
            {
                const study = this.getStudyComponents()[seg_idx-1];
                pos = { x: this.state.pos.x, y: study.getPos().y};
                scale = { x: this.state.scale.x, y: study.getScale().y};
            }
            else
            {
                pos = this.state.pos;
                scale = this.state.scale;
            }

            const left_offset = screen_pos.x;
            const mouse_world_pos = camera.convertScreenPosToWorldPos(
                { 
                    x: mouse_pos.x - left_offset, 
                    y: mouse_pos.y - seg_start.y - window_seg_start.y - this.props.getTopOffset() 
                }, pos, seg_size, scale
            );
                
            if (mouse_pos.x < left_offset ||
                mouse_pos.x > chart_size.width + left_offset ||
                mouse_pos.y < top_offset ||
                mouse_pos.y > chart_size.height + top_offset - 1)
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
                ctx.fillRect(Math.round(snap_x), c_y, 1, line_width);
                c_y += line_width + line_space;
            }
    
            // Box Settings
            ctx.fillStyle = 'rgb(80,80,80)';
    
            // Font settings
            const font_size = 10;
            ctx.font = String(font_size) + 'pt trebuchet ms'; //Consolas
            ctx.textAlign = 'right';
            
            // Draw Prices Box
            const box_height = Math.round(3/4 * (font_size) + 12);
            let text_size = ctx.measureText(String(mouse_world_pos.y.toFixed(5)));
            let box_width = Math.round((text_size.width + 12)/2)*2+1;
            ctx.fillRect(
                Math.round(chart_size.width - box_width), 
                Math.round(mouse_pos.y - top_offset - box_height/2),
                box_width,
                box_height
            );
    
            ctx.fillStyle = 'rgb(255, 255, 255)';
    
            ctx.fillText(
                mouse_world_pos.y.toFixed(5), 
                chart_size.width - 7, 
                Math.round(mouse_pos.y - top_offset + (3/4 * (font_size/2)))
            );
            
            // Draw Time Box

            // Box Settings
            ctx.fillStyle = 'rgb(80,80,80)';

            const tz = 'Australia/Melbourne';
            const time = moment.utc(
                this.getTimestampByPos(Math.floor(mouse_world_pos.x))*1000
            ).tz(tz).format(this.getCurrentPriceFormat());
            text_size = ctx.measureText(time);
            box_width = Math.round((text_size.width + 12)/2)*2+1;

            // Font settings
            ctx.textAlign = 'left';

            ctx.fillRect(
                Math.round(snap_x - box_width/2),
                Math.round(chart_size.height - box_height + this.getBottomOff()), 
                box_width,
                box_height
            );

            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.fillText(
                time, 
                Math.round(snap_x - text_size.width/2), 
                Math.round(
                    chart_size.height - box_height/2 + (3/4 * (font_size/2)) + this.getBottomOff()
                )
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
        // Return undefined if timestamp is greater than latest existing timestamp
        if (
            (!this.isBacktest() && 
                ts >= this.getNextTimestamp() + this.getPeriodOffsetSeconds(this.getChart().period)) ||
            ts < timestamps[0]
        )
            return undefined

        const indicies = [...Array(timestamps.length).keys()]
        const idx = indicies.reduce(function(prev, curr) {
            return (
                (Math.abs(timestamps[curr] - ts) < Math.abs(timestamps[prev] - ts)) && 
                timestamps[curr] <= ts ? curr : prev
            );
        });

        return idx;
    }

    getAllTimestampsIdx = (ts) =>
    {
        const timestamps = this.getAllTimestamps();
        // Return undefined if timestamp is greater than latest existing timestamp
        if (ts > timestamps[timestamps.length-1] || ts < timestamps[0])
            return undefined

        const indicies = [...Array(timestamps.length).keys()]
        const idx = indicies.reduce(function(prev, curr) {
            return (
                Math.abs(timestamps[curr] - ts) < Math.abs(timestamps[prev] - ts) ? curr : prev
            );
        });

        return idx;
    }

    getTimestampByPos = (x) =>
    {
        x = Math.floor(x);

        const timestamps = this.getTimestamps();
        const all_timestamps = this.getAllTimestamps();
        const idx = timestamps.length - x;
        if (idx < 0 || idx >= all_timestamps.length) return undefined;

        return all_timestamps[idx];
    }

    limit = (start, end) =>
    {
        let { limit } = this.state;
        limit = [start, end];
        this.setState({ limit });
    }

    resetLimit = () =>
    {
        let { limit } = this.state;
        limit = [null,null];
        this.setState({ limit });
    }

    clampLimit = (ts) =>
    {
        const { limit } = this.state;
        if (limit[0] !== null && ts < limit[0])
        {
            ts = limit[0];
        }
        else if (limit[1] !== null && ts > limit[1])
        {
            ts = limit[0];
        }

        return ts;
    }

    goto = (ts) =>
    {
        let { pos } = this.state;
        const idx = this.getTimestampIdx(ts);
        pos.x = this.getTimestamps().length - idx;
        this.setState({ pos });
    }

    isWithinBarBounds = (mouse_pos) =>
    {
        const { pos, scale } = this.state;
        const camera = this.getCamera();
        const seg_idx = this.getSegment(mouse_pos);
        const top_offset = this.props.getTopOffset();

        if (seg_idx === 0)
        {
            const seg_size = this.getSegmentSize(seg_idx);
    
            const world_pos = camera.convertScreenPosToWorldPos(
                { x: mouse_pos.x, y: mouse_pos.y - top_offset }, pos, seg_size, scale
            )
            const ohlc = this.getOhlcByPos(world_pos.x);

            if (ohlc !== undefined)
            {
                if (world_pos.y < ohlc[1] && world_pos.y > ohlc[2])
                {
                    return this.getTimestampByPos(world_pos.x);
                }
            }
        }

        return null;
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

    getOhlcByPos = (x) =>
    {
        x = Math.floor(x);
        const bids = this.getBids();
        return bids[bids.length-x];
    }

    getOverlayValueByPos = (idx, x) =>
    {
        const values = this.getOverlayValues(idx);
        let result = [];
        for (let i = 0; i < values.length; i++)
        {
            result.push(values[i][values[i].length-x]);
        }
        return result;
    }

    getStudyValueByPos = (idx, x) =>
    {
        const study = this.studies[idx];
        if (study === undefined)
            return [];
        else
            return study.getValue(x);
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

    getChartProperties(ohlc, idx, scale)
    {
        let { pos } = this.state;
        let hl = [null,null]; // highest/lowest prices
        const max_len = this.getTimestamps().length;

        let counted = 0;
        let i = idx;
        while (counted < Math.max(scale.x, 10) && i < max_len)
        {
            let c_x = ohlc.length - i;
            i++;

            if (ohlc[c_x] === undefined) continue;
            if (ohlc[c_x][0] === null) continue;
            
            let high = ohlc[c_x][1];
            let low = ohlc[c_x][2];

            if (hl[0] == null || high > hl[0])
                hl[0] = high;
            if (hl[1] == null || low < hl[1])
                hl[1] = low;
            
            counted++;
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

    getChartPrices = () =>
    {
        return this.state.prices;
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
        // const canvas = this.getCanvas();
        // return {
        //     width: canvas.width,
        //     height: canvas.height
        // };
    }

    getCamera = () => 
    {
        return this.camera;
    }

    getCanvas = () =>
    {
        return this.canvas;
    }

    getWindowSegmentStartPos = (idx) =>
    {
        const window_pos = this.props.getWindowScreenPos();
        const chart_size = this.getChartSize();
        const portions = this.getPortions();
        const prev_portion = portions.slice(0,idx).reduce((a,b) => a + b, 0);
        

        const start_pos = {
            x: window_pos.x,
            y: window_pos.y + (chart_size.height * prev_portion)
        }
        return start_pos;
    }

    getChartSegmentStartPos = (idx) =>
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
            const seg_start = this.getWindowSegmentStartPos(i);
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

    getCanvasSize = () =>
    {
        const canvas = this.getCanvas();

        return {
            width: canvas.width,
            height: canvas.height
        }
    }

    getCandlesticks = () => 
    {
        return this.candlesticks;
    }

    getOverlayComponents = () =>
    {
        return this.overlays;
    }

    getStudyComponents = () => 
    {
        return this.studies;
    }

    getOverlays = () =>
    {
        return this.getProperties().overlays;
    }

    getStudies = () =>
    {
        return this.getProperties().studies;
    }

    getCurrentPriceFormat = () =>
    {
        return this.getPriceFormat(this.state.intervals.x);
    }

    getCurrentShortPriceFormat = () =>
    {
        return this.getShortPriceFormat(this.state.intervals.x);
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
        const studies = this.getStudies();
        let portions = [this.getMainPortion()];
        for (let i = 0; i < studies.length; i++)
        {
            portions.push(studies[i].portion);
        }
         return portions;
    }

    resizePortion = (idx, change) =>
    {
        const portions = this.getPortions();

        let prev_portion = portions[idx];
        let c_portion = portions[idx+1];
        
        if (
            prev_portion + -change >= MIN_PORTION_SIZE && 
            c_portion + change >= MIN_PORTION_SIZE
        )
        {
            // Set portions to new size
            this.setPortion(idx, prev_portion + -change);
            this.setPortion(idx+1, c_portion + change);
            // Update State
            this.props.updateStrategyInfo();
        }
    }

    getLimit = () =>
    {
        return this.state.limit;
    }

    getStrategyId = () =>
    {
        return this.props.strategy_id;
    }

    getItemId = () =>
    {
        return this.props.item_id;
    }

    getStrategy = () =>
    {
        return this.props.getStrategyInfo(
            this.props.strategy_id
        );
    }

    getWindowInfo = () =>
    {
        return this.props.getWindowInfo(this.getStrategyId(), this.getItemId());
    }

    windowExists = () =>
    {
        return this.props.windowExists(this.props.strategy_id, this.props.item_id);
    }

    getCurrentAccount = () =>
    {
        return this.props.getCurrentAccount();
    }

    getBrokerId = () =>
    {
        return this.getCurrentAccount().split('.')[0];
    }

    getAccountId = () =>
    {
        return this.getCurrentAccount().split('.')[1];
    }

    getProperties = () =>
    {
        return this.props.getWindowInfo(
            this.props.strategy_id, this.props.item_id
        ).properties;
    }

    getBroker = () =>
    {
        if (this.isBacktest())
        {
            return this.getStrategy().broker;
        }
        else
        {
            return this.getStrategy().brokers[this.getBrokerId()].broker;
        }
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
        return this.props.getPositions();
    }

    getOrders = () =>
    {
        return this.props.getOrders();
    }

    getMainPortion = () =>
    {
        return this.getProperties().portion;
    }

    setMainPortion = (x) =>
    {
        this.getProperties().portion = x;
    }

    setPortion = (idx, x) =>
    {
        if (idx === 0)
        {
            this.setMainPortion(x);
        }
        else
        {
            this.getProperties().studies[idx-1].portion = x;
        }
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
        const overlays = this.getOverlays();
        let result = [];
        for (let i = 0; i < overlays[idx].properties.periods.length; i++)
        {
            result.push(
                this.getIndicator(overlays[idx]).cache_bids
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
        const studies = this.getStudies();
        let result = [];
        for (let i = 0; i < studies[idx].properties.periods.length; i++)
        {
            result.push(
                this.getIndicator(studies[idx]).cache_bids
            );
        }
        return result;
    }

    getDrawings = () =>
    {
        return this.props.getDrawings();
    }

    getCurrentTimestamp = () =>
    {
        return this.props.getCurrentTimestamp();
    }

    async addChart()
    {
        let start;
        let end;
        if (this.isBacktest())
        {
            const properties = this.getStrategy().properties;
            start = this.props.getCountDateFromDate(this.getPeriod(), 200, 
                moment.utc(properties.start * 1000)
            , -1);
            end = moment.utc(parseFloat(properties.end) * 1000);
        }
        else
        {
            start = this.props.getCountDateFromDate(this.getPeriod(), 1000, moment.utc(), -1);
            end = moment();
        }

        if (!this.isBacktest())
        {
            this.props.connectChart(this.getBrokerId(), this.getProduct(), this.getPeriod());
        }

        const ohlc_data = await this.props.retrieveChartData(
            this.getBroker(), this.getProduct(), this.getPeriod(), start, end
        );
        this.props.addChart(
            this.getBroker(), this.getProduct(), this.getPeriod(), ohlc_data
        );
    }

    getChart = () =>
    {   
        return this.props.getChart(
            this.getBroker(),
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

    getNextTimestamp = () =>
    {
        return this.getChart().next_timestamp;
    }

    getAsks = () =>
    {
        return this.getChart().asks;
    }

    getBids = ()  =>
    {
        return this.getChart().bids;
    }

    getFilteredOffset = ()  =>
    {
        const chart = this.getChart();
        return chart.timestamps.length - chart.filteredTimestamps.length;
    }

    getTransX = () =>
    {
        return this.state.trans_x;
    }

    setTransX = (trans_x) =>
    {
        this.setState({ trans_x });
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

    getCursor = () =>
    {
        return this.state.cursor;
    }

    setCursor = (cursor) =>
    {
        this.setState({ cursor });
    }

    getIndicator = (ind_props) =>
    {
        const chart = this.getChart();
        let ind = this.props.findIndicator(
            ind_props.type, chart.broker, chart.product, chart.period, ind_props.properties.periods[0]
        );
        if (ind === undefined)
        {
            ind = this.props.createIndicator(
                ind_props.type, chart.broker, chart.product, chart.period, ind_props.properties
            );
            
            this.props.calculateIndicator(ind, chart);
        }
        return ind;
    }

    isBacktest = () =>
    {
        return this.getStrategyId().includes('/backtest/')
    }

}

const SPACEBAR = 32;
const MIN_PORTION_SIZE = 0.1

const UNIVERSAL_DRAWINGS = ['verticalLine'];



export default Chart;