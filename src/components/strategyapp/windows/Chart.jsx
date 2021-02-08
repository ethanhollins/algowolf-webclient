import React, { Component } from 'react';
import Camera from '../Camera';
import Candlesticks from './chart/Candlesticks';
import Overlay from './chart/Overlay';
import Study from './chart/Study';
import _ from 'underscore';
import moment from "moment-timezone";
import Drawings from '../paths/Paths';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactSVG } from 'react-svg';
import { 
    faCoin, faEye, faUndo, faDollarSign, faCog,
    faTimes
} from '@fortawesome/pro-light-svg-icons';


class Chart extends Component 
{
    state = {
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
            bar: false,
            study_handle: false
        },
        isinitialized: false
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

        this.populateContextMenu();

        const is_first_init = !this.isMetadata();

        if (is_first_init)
        {
            this.setMetadata({ x: -50, y: 0 }, { x: 200.0, y:0.2 });
        }
        
        this.updateCanvas();
        /* Initialize Chart */
        if (this.getChart() === undefined)
            await this.addChart();

        let pos = { x: -50, y: 0 };
        let scale = { x: 200.0, y:0.2 };
        if (this.isBacktest())
        {
            const properties = this.getStrategy().properties;
            this.limit(properties.start, properties.end);

            pos.x = Math.max(pos.x, this.getPosFromTimestamp(properties.start) - scale.x);
        }

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

        let { isinitialized, first_load } = this.state;
        isinitialized = true;
        first_load = true;
        if (is_first_init)
        {
            this.setMetadata(pos, scale);
        }
        this.setState({ isinitialized, first_load });

        this.handleActions();
    }

    componentDidUpdate() 
    {
        let { first_load, trans_x, auto_zoom } = this.state;

        if (this.getChart() !== undefined)
        {
            let pos = this.getPos();
            let scale = this.getScale();
            const ohlc = this.getOhlc();
            const chart_properties = this.getChartProperties(ohlc, Math.floor(pos.x), scale);
            if (first_load)
            {
                first_load = false;
                pos = chart_properties.pos;
                scale = chart_properties.scale;

                this.setMetadata(pos, scale);
                this.setState({ first_load });
            }
            else
            {
                if (auto_zoom && trans_x === 0)
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
            <React.Fragment>
            
            <div
                className='chart container'
                key={this.getItemId()}
                ref={this.setContainerRef}
                style={{
                    cursor: this.state.cursor
                }}
                onContextMenu={this.onContextMenu.bind(this)}
                onDoubleClick={this.onDoubleClick.bind(this)}
            >
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
                    getOhlc={this.getOhlc}
                    getCamera={this.getCamera}
                    getCanvas={this.getCanvas}
                    getPos={this.getPos}
                    getScale={this.getScale}
                    getSegmentSize={this.getSegmentSize}
                    getPortions={this.getPortions}
                    getLimit={this.getLimit}
                    getTimestamps={this.getTimestamps}
                    getCurrentTimestamp={this.getCurrentTimestamp}
                    getPeriod={this.getPeriod}
                    getPeriodOffsetSeconds={this.getPeriodOffsetSeconds}
                    getWindowInfo={this.getWindowInfo}
                    getSettings={this.getSettings}
                    getChartSettingsLayout={this.getChartSettingsLayout}
                    isBacktest={this.isBacktest}
                />
                {this.generateOverlays()}
                {this.generateStudies()}

            </div>

            {this.showLoadScreen()}

            </React.Fragment>

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
            let pos = this.getPos();
            let { is_down, is_move, before_change, hovered } = this.state;
    
            // Check mouse within main segment bounds
    
            let start_pos = this.getWindowSegmentStartPos(0);
            let segment_size = this.getSegmentSize(0);
            let rect = {
                x: start_pos.x,
                y: start_pos.y + top_offset,
                width: segment_size.width,
                height: segment_size.height
            }
            
            const studies = this.getStudyComponents();
            is_down = true;
            if (!(hovered.horiz_axis || hovered.vert_axis))
            {
                if (hovered.study_handle !== false)
                {
                    is_down = false;
                    is_move = false;
                    
                    studies[hovered.study_handle].setIsResize(true);
                }
                else if (this.isWithinBounds(rect, mouse_pos))
                {
                    e.preventDefault();
                    is_move = true;
                    before_change = { x: pos.x, y: pos.y };
                }
                else
                {
                    // Check mouse within study bounds
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
            }

            this.handleCursor(hovered, is_down);
            this.setState({ is_down, is_move, before_change });
        }
    }

    showLoadScreen()
    {
        const { isinitialized } = this.state;

        if (!isinitialized)
        {
            return (
                <div 
                    className='chart load'
                >
                    <div className='chart load-item'>
                        <div>
                            <ReactSVG className='chart load-img' src={process.env.PUBLIC_URL + "/wolf-logo.svg"} />
                        </div>
                    </div>
                </div>
            );
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

            let pos = this.getPos();
            let scale = this.getScale();
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
            else if (this.props.getCursor() === 'inherit')
            {
                pos.x += move.x;
                if (is_move)
                    pos.y += move.y;
            }

            this.setMetadata(pos, scale);
            this.setState({ auto_zoom });
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

            this.onBarHover(mouse_pos, is_top, hovered);
            this.onVertAxisHover(mouse_pos, is_top, hovered);
            this.onHorizAxisHover(mouse_pos, is_top, hovered);
            this.onStudyHandleHover(mouse_pos, is_top, hovered);

            this.handleCursor(hovered, is_down);

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

            const font_size = this.getFontSize();
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
        if (this.getChart() !== undefined)
        {
            if (is_top)
            {
                const timestamp = this.isWithinBarBounds(mouse_pos);
                if (timestamp !== null)
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

    onStudyHandleHover(mouse_pos, is_top, hovered)
    {
        if (this.getChart() !== undefined)
        {
            if (is_top)
            {
                for (let i = 0; i < this.getStudyComponents().length; i++)
                {
                    const start_pos = this.getChartSegmentStartPos(i+1);
                    const segment_size = this.getSegmentSize(i+1);
                    const window_start_pos = this.getWindowSegmentStartPos(0);
                    const chart_size = this.getChartSize();
                    const top_offset = this.props.getTopOffset();
    
                    const rect = this.getHandleRect(start_pos, chart_size, segment_size);
                    let window_rect = { 
                        x: rect.x + window_start_pos.x, y: rect.y + window_start_pos.y + top_offset, 
                        width: rect.width, height: rect.height 
                    };
    
                    if (!hovered.study_handle && this.isWithinBounds(window_rect, mouse_pos))
                    {
                        hovered.study_handle = i;
                        return true;
                    }
                    else if (hovered.study_handle !== false && !this.isWithinBounds(window_rect, mouse_pos))
                    {
                        hovered.study_handle = false;
                        return true;
                    }
                }
            }
        }
        return false;
    }

    handleCursor(hovered, is_down)
    {
        let { cursor } = this.state;
        
        if (this.props.getCursor() !== 'inherit')
        {
            cursor = 'inherit';
        }
        else if (hovered.horiz_axis)
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
        else if (hovered.study_handle !== false)
        {
            cursor = 'ns-resize';
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

        let pos = this.getPos();
        let scale = this.getScale();
        let { is_down, is_move, before_change, trans_x, hovered } = this.state;

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
                const chart_properties = this.getChartProperties(this.getOhlc(), Math.floor(pos.x), scale);
                scale.y = chart_properties.scale.y;

                for (let study of this.studies)
                {
                    study.setStudyProperties();
                }
            }
        }

        this.handleCursor(hovered, is_down);

        const mouse_pos = {
            x: e.clientX, y: e.clientY
        }
        const top_offset = this.props.getTopOffset();
        const { isinitialized } = this.state;
        const is_top = this.props.isTopWindow(
            this.getStrategyId(), this.getItemId(), 
            { x: mouse_pos.x, y: mouse_pos.y - top_offset }
        )

        const period_offset = this.getPeriodOffsetSeconds(this.getPeriod());
        if (this.getChart())
        {
            if (is_down)
            {
                // if (this.isBacktest())
                // {
                if (isinitialized && before_change !== null && is_top)
                {
                    if (Math.abs(pos.x - before_change.x) < 1 && Math.abs(pos.y - before_change.y) < 1)
                    {
                        const timestamp = this.isWithinBarBounds(mouse_pos);
                        if (timestamp !== null)
                        {
                            this.props.setCurrentTimestamp(timestamp + period_offset);
                        }
                        else if (!this.isBacktest())
                        {
                            this.props.setCurrentTimestamp(timestamp);
                        }
                    }
                }

                this.props.setSelectedOffset(this.getTimestamps()[0], period_offset);
                // }
                this.props.setSelectedChart(this);
            }
        }

        if (this.getChart()) this.setFutureTimestamps();
        

        const rect = this.props.getContextMenu().getBoundingClientRect();
        if (!this.isWithinBounds(rect, mouse_pos))
        {
            this.props.getContextMenu().style.display = 'none';
        }

        is_down = false;

        this.setMetadata(this.getPos(), scale);
        this.setState({ is_down, is_move, trans_x });
    }

    onScroll(e)
    {
        if (this.getChart() !== undefined && (this.props.getPopup() === null || this.props.getPopup() === undefined))
        {
            const mouse_pos = {
                x: e.clientX, y: e.clientY
            };
            let pos = this.getPos();
            let scale = this.getScale();
            let { is_scrolling, auto_zoom } = this.state;
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
                    const chart_properties = this.getChartProperties(this.getOhlc(), Math.floor(pos.x), scale);
                    scale.y = chart_properties.scale.y;
                }

                for (let study of this.studies)
                {
                    study.setStudyProperties();
                }
    
                this.setMetadata(pos, scale);
                this.setState({ is_scrolling });
                this.setPriceInterval();
                this.setTimeInterval();
            }
        }
    }

    populateContextMenu()
    {
        const elem = (
            <React.Fragment>

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

            </React.Fragment>
        );

        this.props.setContextMenu(elem);
    }

    onContextMenu(e)
    {
        e.preventDefault();

        const app_size = this.props.getAppContainerSize();
        const top_offset = this.props.getTopOffset();
        const mouse_pos = {
            x: e.clientX, y: e.clientY - top_offset
        };

        this.props.getContextMenu().style.display = 'block';
        this.props.getContextMenu().style.left = Math.min(mouse_pos.x, app_size.width - 200) + 'px';
        this.props.getContextMenu().style.top = Math.min(mouse_pos.y, app_size.height - this.props.getContextMenu().clientHeight) + 'px';

        
    }

    onContextMenuItem(e)
    {
        e.preventDefault();

        this.props.getContextMenu().style.display = 'none';
        let popup;
        if (this.props.isDemo)
        {
            popup = {
                type: 'not-available',
                size: {
                    width: 30,
                    height: 30
                }
            }
        }
        else 
        {
            const name = e.target.getAttribute('name');
            
            if (name === 'settings')
            {
                popup = {
                    type: 'chart-settings',
                    size: {
                        width: 60,
                        height: 75
                    },
                    opened: 'general',
                    properties: {
                        item_id: this.getItemId()
                    }
                }
            }
        }
        this.props.setPopup(popup);
    }

    clampScale = (x) =>
    {
        const min = 10, max = 2000;
        return Math.min(Math.max(x, min), max);
    }

    clampMove = (x) =>
    {
        const scale = this.getScale();
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
        const { isinitialized } = this.state;

        if (isinitialized)
        {
            for (let i = 0; i < overlays.length; i++) {
                gen_overlays.push(
                    <Overlay
                        key={'overlay_'+i}
                        ref={this.addOverlayRef}
                        index={i}
                        getValues={this.getOverlayValues}
                        getOhlcValues={this.getOhlc}
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
                        getPeriod={this.getPeriod}
                        getPeriodOffsetSeconds={this.getPeriodOffsetSeconds}
                        getSettings={this.getSettings}
                        isBacktest={this.isBacktest}
                    />
                );
            }
        }

        return gen_overlays;
    }

    generateStudies()
    {
        const studies = this.getStudies();
        const { isinitialized } = this.state;

        let gen_studies = [];
        if (isinitialized)
        {
            for (let i = 0; i < studies.length; i++) 
            {
                gen_studies.push(
                    <Study
                        key={'study_'+i}
                        ref={this.addStudyRef}
                        index={i}
                        getIndicator={this.getStudyIndicator}
                        getValues={this.getStudyValues}
                        getStudyValueByPos={this.getStudyValueByPos}
                        getOhlcValues={this.getOhlc}
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
                        getPeriod={this.getPeriod}
                        getPeriodOffsetSeconds={this.getPeriodOffsetSeconds}
                        getSettings={this.getSettings}
                        resizePortion={this.resizePortion}
                        isBacktest={this.isBacktest}
                    />
                );
            }
        }

        return gen_studies;
    }

    generateInfo()
    {
        const { isinitialized } = this.state;

        if (isinitialized)
        {
            const prices = this.getPriceInfo();
            if (prices !== undefined)
            {
                const overlays = this.getOverlays();
                let overlay_info = [];
                for (let i = 0; i < overlays.length; i++)
                {
                    const overlay = overlays[i];
                    const name = this.getOverlayDisplayName(i);
                    const ind = this.getOverlayIndicator(i);

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
                                    price = price.toFixed(ind.precision);
                                }

                                const color = overlay.properties.colors[x][y];
                                
                                item = (
                                    <span 
                                        className='chart values price'
                                        style={{color: `rgb(${color})`}}
                                    >
                                        {price}
                                    </span>
                                );
        
                                value_elems.push(
                                    <div key={x + '-' + y}>{item}</div>
                                );
                            }
                        }
                    }
    
                    // const name = overlay.type.substring(0,1).toUpperCase() + overlay.type.substring(1);
                    // const name = overlay.type.toUpperCase();
                    overlay_info.push(
                        <div key={i} className='chart overlay-item'>
                            <div
                                className='chart ind-group'
                                onMouseEnter={this.onIndicatorEnter}
                                onMouseLeave={this.onIndicatorLeave}
                            >
                                <div className='chart values overlay-type'>
                                    {name}
                                </div>
                                <div className='chart values price-group'>
                                    {value_elems}
                                </div>
                                <div className='chart ind-settings'>
                                    <FontAwesomeIcon 
                                        className='chart ind-icon' icon={faCog} 
                                        name={i} onClick={this.onOverlaySettings} 
                                    />
                                    <FontAwesomeIcon 
                                        className='chart ind-icon' icon={faTimes} 
                                    />
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
                    const name = this.getStudyDisplayName(i);
                    const start_pos = this.getChartSegmentStartPos(i+1);
                    const ind = this.getStudyIndicator(i);
    
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
                                    price = price.toFixed(ind.precision);
                                }

                                const color = study.properties.colors[x][y];
                                
                                item = (
                                    <span 
                                        style={{color: `rgb(${color})`}}
                                    >
                                        {price}
                                    </span>
                                );
    
                                value_elems.push(
                                    <div className='chart values price' key={x + '' + y}>{item}</div>
                                );
                            }
                        }
                    }
    
                    // const name = study.display_name;
                    study_info.push(
                        <div key={i} className='chart group study' style={{top: (start_pos.y + 5) + 'px', left: '5px'}}>
                            <div className='chart values type'>{name}</div>
                            {value_elems}
                            <div className='chart ind-settings'>
                                <FontAwesomeIcon className='chart ind-icon' icon={faCog} />
                                <FontAwesomeIcon className='chart ind-icon' icon={faTimes} />
                            </div>
                        </div>
                    );
                }
    
                return (
                    <React.Fragment>
    
                    <div className='chart group'>
                        <div className='chart ohlc-group'>
                            <div className='chart product-btn' onClick={this.props.notAvailable}>
                                {this.getProduct().replace('_', '')}
                                <span className='chart broker'>{this.getBroker().toUpperCase()}</span>
                            </div>
                            <div className='chart period-btn' onClick={this.props.notAvailable}>{this.getDisplayPeriod()}</div>
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

    onIndicatorEnter = (e) =>
    {
        let elem = e.target;
        while (elem.className !== 'chart ind-group')
        {
            elem = elem.parentNode;
        }
        
        const settings = elem.children[elem.children.length-1];
        settings.style.display = 'flex';
    }

    onIndicatorLeave = (e) =>
    {
        let elem = e.target;
        while (elem.className !== 'chart ind-group')
        {
            elem = elem.parentNode;
        }
        
        const settings = elem.children[elem.children.length-1];
        settings.style.display = 'none';
    }

    onOverlaySettings = (e) =>
    {
        const idx = parseInt(e.target.getAttribute('name'));
        console.log(idx);

        const popup = {
            type: 'indicator-settings',
            size: {
                width: 20,
                height: 40
            },
            opened: 'properties',
            properties: {
                indicator: this.getOverlayIndicator(idx)
            }
        }
        this.props.setPopup(popup);
    }

    onStudySettings = (e) =>
    {
        const idx = parseInt(e.target.getAttribute('name'));

        const popup = {
            type: 'indicator-settings',
            size: {
                width: 20,
                height: 40
            },
            properties: {
                indicator: this.getStudyIndicator(idx)
            }
        }
        this.props.setPopup(popup);
    }

    update()
    {   
        const { isinitialized } = this.state;
        if (this.getChart() && isinitialized)
        {
            this.updateCanvas();
            this.updateChart();
            this.updateItems();
        }
    }

    async updateChart()
    {
        let pos = this.getPos();
        let scale = this.getScale();
        let { is_loading } = this.state;
        const ts = this.getTimestamps();
        const ohlc = this.getOhlc();

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

        // Handle Axis prices
        this.drawPrices(ctx, price_data);

        // Handle Price Label
        if (!this.isBacktest())
        {
            this.handlePriceLabel(ctx);
        }

        // Handle Drawings
        this.handleDrawings(ctx);

        // Handle Positions/Orders
        this.handleTrades(ctx);

        // Handle Price Line
        if (!this.isBacktest())
        {
            this.handlePriceLine(ctx);
        }

        const studies = this.getStudyComponents();

        // Restore context
        ctx.restore();

        // Reset Transform
        ctx.setTransform(1.0, 0, 0, 1.0, 0, 0);

        let window_start_pos;
        for (let i = 0; i < studies.length; i++)
        {
            let study = studies[i];
            start_pos = this.getChartSegmentStartPos(study.getWindowIndex());
            window_start_pos = this.getWindowSegmentStartPos(0);

            segment_size = this.getSegmentSize(study.getWindowIndex());

            this.defineClip(ctx, start_pos, segment_size);
            // Draw Study
            study.drawTimeGrid(ctx, time_data);
            const study_price_data = study.drawPriceGrid(ctx);
            study.draw();
            study.drawPrices(ctx, study_price_data); 
            study.drawSeparator(ctx);

            // Handle Study Drawings
            this.handleStudyDrawings(ctx, i);

            // Restore context
            ctx.restore(); 

            this.handleStudyHandles(ctx, window_start_pos, start_pos, segment_size);
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

        const mouse_pos = this.props.getMousePos();

        const top_window_id = this.props.getTopWindow(
            this.props.strategy_id, 
            { x: mouse_pos.x, y: mouse_pos.y - this.props.getTopOffset() }
        );

        let x_pos;
        let my_timestamp;
        if (top_window_id !== null)
        {
            const top_window = this.props.getWindowById(top_window_id);
            if (top_window !== undefined)
            {
                const top_chart = top_window.getInnerElement();
        
                if (
                    top_chart !== undefined && 
                    top_chart !== null && 
                    top_window.getElementType()  === 'chart' && 
                    top_chart.getChart() !== undefined
                )
                {
                    const top_pos = top_chart.getPos();
                    const top_scale = top_chart.getScale();
                    const top_seg_idx = top_chart.getSegment(mouse_pos);
                    const top_seg_size = top_chart.getSegmentSize(top_seg_idx);
                    const top_seg_start = top_chart.getChartSegmentStartPos(top_seg_idx);
                    const top_window_seg_start = top_chart.getWindowSegmentStartPos(0);
                    const top_screen_pos = top_chart.getScreenPos();
                    const camera = top_chart.getCamera();
    
                    const mouse_world_pos = camera.convertScreenPosToWorldPos(
                        { 
                            x: mouse_pos.x - top_screen_pos.x, 
                            y: mouse_pos.y - top_seg_start.y - top_window_seg_start.y - this.props.getTopOffset() 
                        }, top_pos, top_seg_size, top_scale
                    );
                        
                    let timestamp;
                    let timestamp_idx;
                    if (this.props.getCurrentTimestamp())
                    {
                        timestamp = Math.min(
                            this.props.getCurrentTimestamp(),
                            top_chart.getTimestampByPos(Math.floor(mouse_world_pos.x)) + this.props.getPeriodOffsetSeconds(this.getPeriod())
                        );
                        timestamp_idx = this.getTimestampIdxWithOffset(
                            timestamp, this.props.getPeriodOffsetSeconds(this.getPeriod())
                        );
                    }
                    else
                    {
                        timestamp = top_chart.getTimestampByPos(Math.floor(mouse_world_pos.x));
                        timestamp_idx = this.getAllTimestampsIdx(timestamp);
                    }
                    if (timestamp_idx !== undefined)
                    {
                        x_pos = this.getTimestamps().length - timestamp_idx;
                        x_pos = Math.max(x_pos, 1);
                        my_timestamp = this.getAllTimestamps()[timestamp_idx];
                    }
                }
            }
        }

        if (x_pos === undefined)
        {
            if (this.props.getCurrentTimestamp())
            {
                const timestamp_idx = this.getTimestampIdxWithOffset(
                    this.props.getCurrentTimestamp(),
                    this.props.getPeriodOffsetSeconds(this.getPeriod())
                );
                x_pos = this.getTimestamps().length - timestamp_idx;
                x_pos = Math.max(x_pos, 1);
                my_timestamp = this.getTimestamps()[timestamp_idx];
            }
            else
            {
                x_pos = 1;
                my_timestamp = this.getTimestamps()[this.getTimestamps().length];
            }
        }

        let prices = {
            timestamp: my_timestamp,
            ohlc: [],
            ohlc_color: null,
            overlays: [],
            overlay_colors: [],
            studies: [],
            study_colors: [],
        };


        const overlays = this.getOverlays();
        const studies = this.getStudies();

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
        const scale = this.getScale();
        const { intervals } = this.state;
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
        const scale = this.getScale();
        const { intervals } = this.state;
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
        
        const dt = moment(ts).tz(this.getTimezone());
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
        const dt = moment(ts).tz(this.getTimezone());
        return dt.day() > 5 || (dt.day() === 5 && dt.hour() >= 17);
    }

    wrapTime(ts)
    {
        ts *= 1000;
        const dt = moment(ts).tz(this.getTimezone());
        if (dt.day() > 5 || (dt.day() === 5 && dt.hour() >= 17))
        {
            const open_off = moment.duration(7 % dt.day(), "d");
            const open = dt.clone().add(open_off)
                .hour(17).minute(0).second(0).millisecond(0);
            return open
        }
        else return dt;
    }

    getPeriodOffsetSeconds = (period) =>
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
        const pos = this.getPos();
        const scale = this.getScale();
        const { intervals } = this.state;

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
        const ohlc = this.getOhlc();
        const timestamps = this.getTimestamps().concat(this.state.future_timestamps);

        const pos = this.getPos();
        const scale = this.getScale();
        const { intervals } = this.state;

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


        const tz = this.getTimezone();
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
        const pos = this.getPos();
        const scale = this.getScale();
        const seg_size = this.getSegmentSize(0);

        // Font settings
        const font_size = this.getFontSize();
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
        const pos = this.getPos();
        const scale = this.getScale();
        const timestamps = this.getTimestamps();
        const all_timestamps = this.getAllTimestamps();
        const tz = this.getTimezone();

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
        const pos = this.getPos();
        const scale = this.getScale();
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
            if (c_trade.order_type === 'limitorder' || c_trade.order_type === 'stoporder')
            {
                color = '#8c8c8c';
            }
            else
            {
                if (c_trade.direction === 'long')
                {
                    color = '#3498db';
                }
                else
                {
                    color = '#f39c12';
                }
            }
            
            /* Draw Entry, SL, TP lines */

            // Text
            const font_size = 8;
            ctx.font = '700 ' + String(font_size) + 'pt Segoe UI';
            ctx.textAlign = 'left';
            ctx.lineWidth = 1;
            
            // SL Line
            ctx.strokeStyle = '#e74c3c';
            ctx.beginPath();
            ctx.moveTo(0, Math.floor(sl_pos.y));
            ctx.lineTo(seg_size.width, Math.floor(sl_pos.y));
            ctx.setLineDash([5, 3]);
            ctx.stroke();

            // TP Line
            ctx.strokeStyle = '#2ecc71';
            ctx.beginPath();
            ctx.moveTo(0, Math.floor(tp_pos.y));
            ctx.lineTo(seg_size.width, Math.floor(tp_pos.y));
            ctx.setLineDash([5, 3]);
            ctx.stroke();

            // Entry line
            ctx.fillStyle = '#FFF';
            ctx.strokeStyle = color;

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
            const trade_label_height = 21;
            const trade_label_off = 20;
            const trade_label_inside_off = 7;

            const lotsize = this.props.convertIncomingPositionSize(this.getBroker(), c_trade.lotsize);
            if (c_trade.order_type === 'limitorder')
            {
                let text;
                let direction_color;
                if (c_trade.direction === 'long')
                {
                    text = 'BUY LIMIT';
                    direction_color = '#3498db';
                }
                else
                {
                    text = 'SELL LIMIT';
                    direction_color = '#f39c12';
                }
                let text_width = ctx.measureText(text).width;
                let position_size_width = ctx.measureText(String(lotsize)).width
                let trade_label_width = trade_label_inside_off*4 + Math.floor(text_width) + Math.floor(position_size_width);

                // Fill Rect
                ctx.fillRect(
                    Math.floor(entry_pos.x - trade_icon_size/2)+0.5, 
                    Math.floor(entry_pos.y - trade_icon_size/2)+0.5, 
                    trade_icon_size, trade_icon_size,
                );
                ctx.strokeRect(
                    Math.floor(entry_pos.x - trade_icon_size/2)+0.5, 
                    Math.floor(entry_pos.y - trade_icon_size/2)+0.5, 
                    trade_icon_size, trade_icon_size,
                );

                // Fill Rect
                ctx.fillRect(
                    trade_label_off+0.5, 
                    Math.floor(entry_pos.y - trade_label_height/2)+0.5, 
                    trade_label_width, trade_label_height,
                );
                ctx.strokeRect(
                    trade_label_off+0.5, 
                    Math.floor(entry_pos.y - trade_label_height/2)+0.5, 
                    trade_label_width, trade_label_height,
                );

                // Label Inside
                ctx.fillStyle = direction_color;
                ctx.fillText(
                    text, (trade_label_off+0.5) + trade_label_inside_off,
                    Math.floor(entry_pos.y) + 0.5 + (3/4 * font_size)/2
                );
                
                ctx.beginPath();
                ctx.moveTo(
                    (trade_label_off+0.5) + Math.floor(text_width) + trade_label_inside_off*2, 
                    Math.floor(entry_pos.y - trade_label_height/2) + 0.5
                );
                ctx.lineTo(
                    (trade_label_off+0.5) + Math.floor(text_width) + trade_label_inside_off*2, 
                    Math.floor(entry_pos.y - trade_label_height/2) + 0.5 + trade_label_height
                );
                ctx.stroke();

                ctx.fillText(
                    String(lotsize), 
                    (trade_label_off+0.5) + Math.floor(text_width) + trade_label_inside_off*3,
                    Math.floor(entry_pos.y) + 0.5 + (3/4 * font_size)/2
                );
            }
            else if (c_trade.order_type === 'stoporder')
            {
                let text;
                let direction_color;
                if (c_trade.direction === 'long')
                {
                    text = 'BUY STOP';
                    direction_color = '#3498db';
                }
                else
                {
                    text = 'SELL STOP';
                    direction_color = '#f39c12';
                }
                let text_width = ctx.measureText(text).width;
                let position_size_width = ctx.measureText(String(lotsize)).width
                let trade_label_width = trade_label_inside_off*4 + Math.floor(text_width) + Math.floor(position_size_width);

                // Fill Rect
                ctx.fillRect(
                    Math.floor(entry_pos.x - trade_icon_size/2)+0.5, 
                    Math.floor(entry_pos.y - trade_icon_size/2)+0.5, 
                    trade_icon_size, trade_icon_size,
                );
                ctx.strokeRect(
                    Math.floor(entry_pos.x - trade_icon_size/2)+0.5, 
                    Math.floor(entry_pos.y - trade_icon_size/2)+0.5, 
                    trade_icon_size, trade_icon_size,
                );

                // Fill Rect
                ctx.fillRect(
                    trade_label_off+0.5, 
                    Math.floor(entry_pos.y - trade_label_height/2)+0.5, 
                    trade_label_width, trade_label_height,
                );
                ctx.strokeRect(
                    trade_label_off+0.5, 
                    Math.floor(entry_pos.y - trade_label_height/2)+0.5, 
                    trade_label_width, trade_label_height,
                );

                // Label Inside
                ctx.fillStyle = direction_color;
                ctx.fillText(
                    text, (trade_label_off+0.5) + trade_label_inside_off,
                    Math.floor(entry_pos.y) + 0.5 + (3/4 * font_size)/2
                );
                
                ctx.beginPath();
                ctx.moveTo(
                    (trade_label_off+0.5) + Math.floor(text_width) + trade_label_inside_off*2, 
                    Math.floor(entry_pos.y - trade_label_height/2) + 0.5
                );
                ctx.lineTo(
                    (trade_label_off+0.5) + Math.floor(text_width) + trade_label_inside_off*2, 
                    Math.floor(entry_pos.y - trade_label_height/2) + 0.5 + trade_label_height
                );
                ctx.stroke();

                ctx.fillText(
                    String(lotsize), 
                    (trade_label_off+0.5) + Math.floor(text_width) + trade_label_inside_off*3,
                    Math.floor(entry_pos.y) + 0.5 + (3/4 * font_size)/2
                );
            }
            else
            {
                let text;
                if (c_trade.direction === 'long')
                {
                    text = 'BUY TRADE';
                }
                else
                {
                    text = 'SELL TRADE';
                }
                let text_width = ctx.measureText(text).width;
                let position_size_width = ctx.measureText(String(lotsize)).width
                let trade_label_width = trade_label_inside_off*4 + Math.floor(text_width) + Math.floor(position_size_width);

                // Fill Circle
                ctx.beginPath();
                ctx.arc(
                    Math.floor(entry_pos.x)+0.5, Math.floor(entry_pos.y)+0.5, 
                    trade_icon_size/2, 0, 2 * Math.PI
                );
                ctx.fill();
                ctx.stroke();

                // Fill Rect
                ctx.fillRect(
                    trade_label_off+0.5, 
                    Math.floor(entry_pos.y - trade_label_height/2)+0.5, 
                    trade_label_width, trade_label_height,
                );
                ctx.strokeRect(
                    trade_label_off+0.5, 
                    Math.floor(entry_pos.y - trade_label_height/2)+0.5, 
                    trade_label_width, trade_label_height,
                );

                // Label Inside
                ctx.fillStyle = color;
                ctx.fillText(
                    text, (trade_label_off+0.5) + trade_label_inside_off,
                    Math.floor(entry_pos.y) + 0.5 + (3/4 * font_size)/2
                );
                
                ctx.beginPath();
                ctx.moveTo(
                    (trade_label_off+0.5) + Math.floor(text_width) + trade_label_inside_off*2, 
                    Math.floor(entry_pos.y - trade_label_height/2) + 0.5
                );
                ctx.lineTo(
                    (trade_label_off+0.5) + Math.floor(text_width) + trade_label_inside_off*2, 
                    Math.floor(entry_pos.y - trade_label_height/2) + 0.5 + trade_label_height
                );
                ctx.stroke();

                ctx.fillText(
                    String(lotsize), 
                    (trade_label_off+0.5) + Math.floor(text_width) + trade_label_inside_off*3,
                    Math.floor(entry_pos.y) + 0.5 + (3/4 * font_size)/2
                );
            }
            
        }
    }

    getHandleRect(start_pos, chart_size, segment_size)
    {
        // Size Vars
        const handle_width = Math.min(chart_size.width/10, 21);
        const handle_height = Math.min(chart_size.height/15, 6);
        // Position Vars
        const handle_x = Math.round(segment_size.width/2 - handle_width/2) + 0.5;
        const handle_y = Math.round(start_pos.y) - (handle_height-1)/2;

        return {
            x: handle_x, y: handle_y, width: handle_width, height: handle_height
        }
    }

    handleStudyHandles(ctx, window_start_pos, start_pos, segment_size)
    {
        const mouse_pos = this.props.getMousePos();
        const chart_size = this.getChartSize();
        const top_offset = this.props.getTopOffset();

        // Draw Handle
        const rect = this.getHandleRect(start_pos, chart_size, segment_size);
        let window_rect = { 
            x: rect.x + window_start_pos.x, y: rect.y + window_start_pos.y, 
            width: rect.width, height: rect.height 
        };
        const handle_middle_off = Math.round(rect.width/3);

        if (
            this.isWithinBounds(window_rect, { x: mouse_pos.x, y: mouse_pos.y - top_offset }) &&
            !this.props.getKeys().includes(SPACEBAR)
        )
        {
            ctx.fillStyle = `rgba(180, 180, 180, 1.0)`;
            ctx.strokeStyle = `rgba(180, 180, 180, 1.0)`;

            ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

            ctx.fillStyle = `rgba(255, 255, 255, 1.0)`;
            ctx.fillRect(rect.x + handle_middle_off/2, Math.round(start_pos.y), rect.width - handle_middle_off, 1);
        }
        else
        {
            ctx.fillStyle = `rgba(255, 255, 255, 1.0)`;
            ctx.strokeStyle = `rgba(180, 180, 180, 1.0)`;

            ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

            ctx.fillStyle = `rgba(180, 180, 180, 1.0)`;
            ctx.fillRect(rect.x + handle_middle_off/2, Math.round(start_pos.y), rect.width - handle_middle_off, 1);
        }
    }

    drawVerticalLine(ctx, pos, properties)
    {
        const chart_size = this.getChartSize();
        const x = Math.round(pos.x - properties.scale/2);


        if (properties.lineType === 'dashed')
        {
            // Dashed line
            const line_width = 6;
            const line_space = 4;

            // Handle Time Line
            ctx.fillStyle = properties.colors[0];

            let c_y = 0;
            while (c_y < chart_size.height)
            {
                ctx.fillRect(x, c_y, properties.scale, line_width);
                c_y += line_width + line_space;
            }

        }
        else
        {
             // Handle properties
            ctx.fillStyle = properties.colors[0];
            ctx.fillRect(x, 0, properties.scale, chart_size.height);
        }

       
    }

    drawHorizontalLine(ctx, start_pos, pos, properties)
    {
        const chart_size = this.getChartSize();
        const y = Math.round(start_pos.y + pos.y - properties.scale/2);
        if (properties.lineType === 'dashed')
        {
            // Dashed line
            const line_width = 6;
            const line_space = 4;

            // Handle Time Line
            ctx.fillStyle = properties.colors[0];

            let c_x = 0;
            while (c_x < chart_size.width)
            {
                ctx.fillRect(c_x, y, line_width, properties.scale);
                c_x += line_width + line_space;
            }

        }
        else if (properties.lineType === 'dotted')
        {
            // Dashed line
            const line_width = 2;
            const line_space = 3;

            // Handle Time Line
            ctx.fillStyle = properties.colors[0];

            let c_x = 0;
            while (c_x < chart_size.width)
            {
                ctx.fillRect(c_x, y, line_width, properties.scale);
                c_x += line_width + line_space;
            }

        }
        else
        {
            // Handle properties
            ctx.fillStyle = properties.colors[0];
            ctx.fillRect(0, y, chart_size.width, properties.scale);
        }

    }

    drawText(ctx, start_pos, screen_pos, properties)
    {
        // Font settings
        const font_size = properties.font_size;
        ctx.font = '600 ' + String(font_size) + 'pt Segoe UI';
        ctx.textAlign = 'center';

        ctx.fillStyle = properties.colors[0];
        ctx.strokeStyle = '#FFF';

        // ctx.strokeText(
        //     properties.text, 
        //     screen_pos.x, 
        //     Math.round(screen_pos.y + (3/4 * (font_size/2)))
        // );

        ctx.fillText(
            properties.text, 
            start_pos.x + screen_pos.x, 
            Math.round(start_pos.y + screen_pos.y + (3/4 * (font_size/2)))
        );
    }

    drawMisc(ctx, start_pos, screen_pos, d_props)
    {
        const drawing = Drawings[d_props.type]();
        // Get Rotation and Scale
        const rotation = this.degsToRads(d_props.properties.rotation);
        const drawing_scale = 0.01 * d_props.properties.scale;
        
        const width = drawing.size.width;
        const height = drawing.size.height;

        // Move to position
        ctx.translate(
            start_pos.x + screen_pos.x - (width*drawing_scale),
            start_pos.y + screen_pos.y - (height*drawing_scale)
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

    handleDrawings(ctx)
    {
        const camera = this.getCamera();
        const pos = this.getPos();
        const scale = this.getScale();

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
                
                if (!UNIVERSAL_DRAWINGS.includes(d_props.type))
                {
                    if (d_props.section_name.toLowerCase() === 'instrument')
                    {
                        const start_pos = this.getChartSegmentStartPos(0);
                        const seg_size = this.getSegmentSize(0);
                        const screen_pos = camera.convertWorldPosToScreenPos(
                            { x: x+0.5, y: y }, pos, seg_size, scale
                        );

                        // Handle Horizontal Line
                        if (d_props.type === 'horizontalLine')
                        {
                            this.drawHorizontalLine(ctx, start_pos, screen_pos, d_props.properties);
                        }
                        // Handle Text
                        else if (d_props.type === 'text')
                        {
                            this.drawText(ctx, start_pos, screen_pos, d_props.properties);
                        }
                        // Handle Misc Drawings
                        else if (d_props.type in Drawings)
                        {
                            this.drawMisc(ctx, start_pos, screen_pos, d_props);
                        }
                    }
                }
            }
        }
    }

    handleStudyDrawings(ctx, idx)
    {
        const camera = this.getCamera();
        const pos = this.getPos();
        const scale = this.getScale();

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
                
                if (!UNIVERSAL_DRAWINGS.includes(d_props.type))
                {
                    if (d_props.section_name.toLowerCase() !== 'instrument')
                    {
                        const studies = this.getStudies();
                        const study_components = this.getStudyComponents();

                        // Studies
                        const study = study_components[idx];
                        const ind = studies[idx];
                        const name = this.getIndicator(ind).type;
                        const study_pos = { x: pos.x, y: study.getPos().y };
                        const study_scale = { x: scale.x, y: study.getScale().y };

                        if (name.toLowerCase() === d_props.section_name.toLowerCase())
                        {
                            const start_pos = this.getChartSegmentStartPos(idx+1);
                            const seg_size = this.getSegmentSize(idx+1);
                            const screen_pos = camera.convertWorldPosToScreenPos(
                                { x: x+0.5, y: y }, study_pos, seg_size, study_scale
                            );
                            // Handle Horizontal Line
                            if (d_props.type === 'horizontalLine')
                            {
                                this.drawHorizontalLine(ctx, start_pos, screen_pos, d_props.properties);
                            }
                            // Handle Text
                            else if (d_props.type === 'text')
                            {
                                this.drawText(ctx, start_pos, screen_pos, d_props.properties);
                            }
                            // Handle Misc Drawings
                            else if (d_props.type in Drawings)
                            {
                                this.drawMisc(ctx, start_pos, screen_pos, d_props);
                            }
                        }
                    }
                }
            }
        }
    }

    handleUniversalDrawings(ctx)
    {
        const camera = this.getCamera();
        const pos = this.getPos();
        const scale = this.getScale();
        const seg_size = this.getSegmentSize(0);

        const chart_drawings_layers = this.getProperties().drawing_layers;
        let drawings = this.getDrawings();

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
        const pos = this.getPos();
        const scale = this.getScale();
        const seg_size = this.getSegmentSize(0);
        const camera = this.getCamera();
        const ohlc = this.getOhlc();
        let c_close = undefined;
        for (let i = ohlc.length-1; i >= 0; i--)
        {
            c_close = ohlc[i][3];
            if (c_close !== 0 && c_close !== null) break;
        }

        const screen_pos = camera.convertWorldPosToScreenPos(
            { x: 0, y: c_close }, pos, seg_size, scale
        );

        // Properties
        ctx.fillStyle = '#3498db';

        // Font settings
        const font_size = this.getFontSize();
        ctx.font = String(font_size) + 'pt trebuchet ms'; //Consolas
        ctx.textAlign = 'right';

        const text_size = ctx.measureText(String(c_close.toFixed(5)));
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
            c_close.toFixed(5), 
            seg_size.width - 7, 
            Math.round(screen_pos.y + (3/4 * (font_size/2)))
        );
    }

    handlePriceLine(ctx)
    {
        const pos = this.getPos();
        const scale = this.getScale();
        const seg_size = this.getSegmentSize(0);
        const camera = this.getCamera();
        const ohlc = this.getOhlc();

        let c_close = 0;
        for (let i = ohlc.length-1; i >= 0; i--)
        {
            c_close = ohlc[i][3];
            if (c_close !== null) break;
        }

        const screen_pos = camera.convertWorldPosToScreenPos(
            { x: 0, y: c_close }, pos, seg_size, scale
        );

        // Properties
        ctx.fillStyle = this.getPriceLineColor();

        ctx.fillRect(0, Math.floor(screen_pos.y), seg_size.width, 1);
    }

    handleCrosshairs(ctx)
    {
        const keys = this.props.getKeys();
        if (keys.includes(SPACEBAR)) return;

        const mouse_pos = this.props.getMousePos();
        const screen_pos = this.getScreenPos();
        const top_offset = this.props.getTopOffset() + screen_pos.y;
        
        const top_window_id = this.props.getTopWindow(
            this.props.strategy_id, 
            { x: mouse_pos.x, y: mouse_pos.y - this.props.getTopOffset() }
        );

        if (top_window_id !== null)
        {
            const top_window = this.props.getWindowById(top_window_id);
            if (top_window !== undefined)
            {
                const top_chart = top_window.getInnerElement();

                if (
                    top_chart !== undefined && 
                    top_chart !== null && 
                    top_window.getElementType()  === 'chart' && 
                    top_chart.getChart() !== undefined
                )
                {
                    const top_chart_size = top_chart.getChartSize();
                    const top_seg_idx = top_chart.getSegment(mouse_pos);
                    const top_seg_size = top_chart.getSegmentSize(top_seg_idx);
                    const top_seg_start = top_chart.getChartSegmentStartPos(top_seg_idx);
                    const top_window_seg_start = top_chart.getWindowSegmentStartPos(0);
                    const top_screen_pos = top_chart.getScreenPos();
                    const camera = top_chart.getCamera();
    
                    const chart_size = this.getChartSize();
                    const seg_size = this.getSegmentSize(top_seg_idx);
            
                    if (mouse_pos.y > top_offset + top_window_seg_start.y + top_chart_size.height) return;

                    let top_pos, top_scale, pos, scale = undefined;
                    if (top_seg_idx > 0)
                    {
                        const top_study = top_chart.getStudyComponents()[top_seg_idx-1];
                        if (top_study === undefined) return;
    
                        top_pos = { x: top_chart.getPos().x, y: top_study.getPos().y};
                        top_scale = { x: top_chart.getScale().x, y: top_study.getScale().y};
    
                        const study = this.getStudyComponents()[top_seg_idx-1];
                        pos = { x: this.getPos().x, y: study.getPos().y};
                        scale = { x: this.getScale().x, y: study.getScale().y};
                    }
                    else
                    {
                        top_pos = top_chart.getPos();
                        top_scale = top_chart.getScale();
    
                        pos = this.getPos();
                        scale = this.getScale();
                    }
        
                    const mouse_world_pos = camera.convertScreenPosToWorldPos(
                        { 
                            x: mouse_pos.x - top_screen_pos.x, 
                            y: mouse_pos.y - top_seg_start.y - top_window_seg_start.y - this.props.getTopOffset() 
                        }, top_pos, top_seg_size, top_scale
                    );
    
                    const timestamp = top_chart.getTimestampByPos(Math.floor(mouse_world_pos.x))
                    const timestamp_idx = this.getAllTimestampsIdx(timestamp);
                    const my_timestamp = this.getAllTimestamps()[timestamp_idx];
                    const snap_x = camera.convertWorldPosToScreenPos(
                        { x: this.getTimestamps().length - timestamp_idx + 0.5, y: 0},
                        pos, seg_size, scale
                    ).x;
                    
                    // Font settings
                    const font_size = this.getFontSize();
                    ctx.font = String(font_size) + 'pt trebuchet ms'; //Consolas
                    ctx.textAlign = 'right';
                    
                    const line_width = 5;
                    const line_space = 4;
    
                    // Handle Time Line
                    ctx.fillStyle = this.getCrosshairColor();
        
                    let c_y = 0;
                    while (c_y < chart_size.height + this.getBottomOff())
                    {
                        ctx.fillRect(Math.round(snap_x), c_y, 1, line_width);
                        c_y += line_width + line_space;
                    }
    
                    // Box Settings
                    ctx.fillStyle = this.getCrosshairColor();
            
                    const tz = this.getTimezone();
                    const time = moment.utc(
                        my_timestamp*1000
                    ).tz(tz).format(top_chart.getCurrentPriceFormat());
                    const box_height = Math.round(3/4 * (font_size) + 12);
                    let text_size = ctx.measureText(time);
                    let box_width = Math.round((text_size.width + 12)/2)*2+1;
        
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
    
                    // Handle Price Line
                    if (top_window_id === this.getItemId())
                    {
                        ctx.fillStyle = this.getCrosshairColor();
        
                        let c_x = 0;
                        while (c_x < chart_size.width)
                        {
                            ctx.fillRect(c_x, Math.round(mouse_pos.y - top_offset), line_width, 1);
                            c_x += line_width + line_space;
                        }
    
                        // Box Settings
                        ctx.fillStyle = this.getCrosshairColor();
                        
                        // Draw Prices Box
                        text_size = ctx.measureText(String(mouse_world_pos.y.toFixed(5)));
                        box_width = Math.round((text_size.width + 12)/2)*2+1;
                        ctx.textAlign = 'right';
                        ctx.fillRect(
                            Math.round(chart_size.width - box_width), 
                            Math.round(mouse_pos.y - top_offset - box_height/2),
                            box_width,
                            box_height
                        );
                
                        ctx.fillStyle = 'rgb(255, 255, 255)';
                
                        ctx.fillText(
                            mouse_world_pos.y.toFixed(5), 
                            top_chart_size.width - 7, 
                            Math.round(mouse_pos.y - top_offset + (3/4 * (font_size/2)))
                        );
                    }
                }
            }
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
        let scale = this.getScale();
        scale.x = x;
        scale.y = y;
        this.setMetadata(this.getPos, scale);
    }

    handleActions = () =>
    {
        let metadata = this.getMetadata();
        if (metadata !== undefined && 'actions' in metadata)
        {
            for (let func in metadata.actions)
            {
                this[func](...metadata.actions[func]);
            }

            metadata.actions = {}
            this.props.setMetadata(this.getStrategyId(), this.getItemId(), metadata);
        }
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

    getTimestampIdxWithOffset = (ts, off) =>
    {
        const timestamps = this.getTimestamps();
        // Return undefined if timestamp is greater than latest existing timestamp
        if (
            (!this.isBacktest() && this.getNextTimestamp() !== null &&
                ts >= this.getNextTimestamp() + this.getPeriodOffsetSeconds(this.getChart().period)) ||
            ts < timestamps[0]
        )
            return undefined

        const indicies = [...Array(timestamps.length).keys()]
        const idx = indicies.reduce(function(prev, curr) {
            return (
                (Math.abs(timestamps[curr] - ts) < Math.abs(timestamps[prev] - ts)) && 
                timestamps[curr] <= ts - off ? curr : prev
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
                (Math.abs(timestamps[curr] - ts) < Math.abs(timestamps[prev] - ts)) && 
                timestamps[curr] <= ts ? curr : prev
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

    setPosByTimestamp = (ts) =>
    {
        let pos = this.getPos();
        let scale = this.getScale();
        let x = this.getPosFromTimestamp(ts);
        if (x === undefined)
        {
            pos.x = -50;
        }
        else
        {
            pos.x = Math.max(-50, x - scale.x/3);
        }

        this.setMetadata(pos, this.getScale());
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
        let pos = this.getPos();
        const idx = this.getTimestampIdx(ts);
        pos.x = this.getTimestamps().length - idx;
        this.setMetadata(pos, this.getScale());
    }

    isWithinBarBounds = (mouse_pos) =>
    {
        const pos = this.getPos();
        const scale = this.getScale();
        const camera = this.getCamera();
        const seg_idx = this.getSegment(mouse_pos);
        const top_offset = this.props.getTopOffset();

        if (seg_idx === 0)
        {
            const seg_size = this.getSegmentSize(seg_idx);
            const seg_start = this.getWindowSegmentStartPos(seg_idx);
    
            const world_pos = camera.convertScreenPosToWorldPos(
                { x: mouse_pos.x - seg_start.x, y: mouse_pos.y - seg_start.y - top_offset }, pos, seg_size, scale
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
        const ohlc = this.getOhlc();
        return ohlc[ohlc.length-x];
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
        const values = this.getStudyValues(idx);
        let result = [];
        for (let i = 0; i < values.length; i++)
        {
            result.push(values[i][values[i].length-x]);
        }
        return result;
        // const study = this.studies[idx];
        // if (study === undefined)
        //     return [];
        // else
        //     return study.getValue(x);
    }

    setFutureTimestamps = () =>
    {
        let pos = this.getPos();
        let { future_timestamps } = this.state;
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
        let pos = this.getPos();
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
        return this.getDateFormat();
    }

    getCurrentShortPriceFormat = () =>
    {
        return this.getShortPriceFormat(this.state.intervals.x);
    }

    getScreenPos = () =>
    {
        return this.props.getScreenPos();
    }

    getPos = () =>
    {
        return this.getMetadata().pos;
    }

    getScale = () =>
    {
        return this.getMetadata().scale;
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

    getSettings = () =>
    {
        return this.getStrategy().settings;
    }

    getChartSettingsLayout = () =>
    {
        return this.getSettings()['chart-settings'].current;
    }
    
    getTimezone = () =>
    {
        return this.props.getTimezones()[this.getSettings()['chart-settings'].layouts[this.getChartSettingsLayout()].general['timezone'].value];
    }

    getDateFormat = () =>
    {
        return this.getSettings()['chart-settings'].layouts[this.getChartSettingsLayout()].general['date-format'].value;
    }

    getFontSize = () =>
    {
        return this.getSettings()['chart-settings'].layouts[this.getChartSettingsLayout()].general['font-size'].value;
    }

    getPrecision = () =>
    {
        return this.getSettings()['chart-settings'].layouts[this.getChartSettingsLayout()].general['precision'].value;
    }

    getPriceLineColor = () =>
    {
        return this.getSettings()['chart-settings'].layouts[this.getChartSettingsLayout()].appearance['price-line'].value;
    }

    getVertGridLinesColor = () =>
    {
        return this.getSettings()['chart-settings'].layouts[this.getChartSettingsLayout()].appearance['vert-grid-lines'].value;
    }

    getHorzGridLinesColor = () =>
    {
        return this.getSettings()['chart-settings'].layouts[this.getChartSettingsLayout()].appearance['horz-grid-lines'].value;
    }

    getCrosshairColor = () =>
    {
        return this.getSettings()['chart-settings'].layouts[this.getChartSettingsLayout()].appearance['crosshair'].value;
    }

    getProperties = () =>
    {
        return this.props.getWindowInfo(
            this.props.strategy_id, this.props.item_id
        ).properties;
    }

    getBroker = () =>
    {
        return this.getProperties().broker;

        // if (this.isBacktest())
        // {
        //     return this.getStrategy().properties.broker;
        // }
        // else
        // {
        //     return this.getStrategy().brokers[this.getBrokerId()].broker;
        // }
    }

    getProduct = () => 
    {
        return this.getProperties().product;
    }

    getPeriod = () => 
    {
        return this.getProperties().period;
    }

    getDisplayPeriod = () =>
    {
        const period = this.getPeriod();
        if (period === 'M1')
        {
            return '1m';
        }
        else if (period === 'M2')
        {
            return '2m'
        }
        else if (period === 'M3')
        {
            return '3m'
        }
        else if (period === 'M5')
        {
            return '5m'
        }
        else if (period === 'M10')
        {
            return '10m'
        }
        else if (period === 'M15')
        {
            return '15m'
        }
        else if (period === 'M30')
        {
            return '30m'
        }
        else if (period === 'H1')
        {
            return '1h'
        }
        else if (period === 'H2')
        {
            return '2h'
        }
        else if (period === 'H3')
        {
            return '3h'
        }
        else if (period === 'H4')
        {
            return '4h'
        }
        else if (period === 'D')
        {
            return 'D'
        }
        else if (period === 'W')
        {
            return 'W'
        }
        else if (period === 'M')
        {
            return 'M'
        }
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

    getOverlayDisplayName = (idx) =>
    {
        const overlay = this.getOverlays()[idx];
        return this.getIndicator(overlay).display_name;

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
            const price_type = this.getPrice();
            result.push(
                this.getIndicator(overlays[idx])['cache_' + price_type]
            );
        }
        return result;
    }

    getOverlayIndicator = (idx) =>
    {
        const overlays = this.getOverlays();
        return this.getIndicator(overlays[idx])
    }

    getStudyDisplayName = (idx) =>
    {
        const study = this.getStudies()[idx];
        return this.getIndicator(study).display_name;

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
            const price_type = this.getPrice();
            result.push(
                this.getIndicator(studies[idx])['cache_' + price_type]
            );
        }
        return result;
    }

    getStudyIndicator = (idx) =>
    {
        const studies = this.getStudies();
        return this.getIndicator(studies[idx])
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

    getMids = () =>
    {
        return this.getChart().mids;
    }

    getBids = () =>
    {
        return this.getChart().bids;
    }

    getOhlc = () =>
    {
        return this.getChart()[this.getPrice()];
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
        let scale = this.getScale();
        scale.y = y;
        this.setMetadata(this.getPos(), scale);
    }

    setPosY = (y) =>
    {
        let pos = this.getPos();
        pos.y = y;
        this.setMetadata(pos, this.getScale());
    }

    getMetadata = () =>
    {
        return this.props.getMetadata(this.getStrategyId(), this.getItemId());
    }

    isMetadata = () =>
    {
        return this.getMetadata() !== undefined;
    }

    setMetadata = (pos, scale) =>
    {
        let metadata = this.getMetadata();
        if (metadata === undefined)
        {
            metadata = {};
        }

        metadata.pos = pos;
        metadata.scale = scale;
        this.props.setMetadata(this.getStrategyId(), this.getItemId(), metadata);
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