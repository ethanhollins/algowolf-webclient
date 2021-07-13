import React, { Component } from 'react';
import Camera from './Camera';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faWindowMaximize
} from '@fortawesome/pro-regular-svg-icons';
import { 
    faSquare, faMinus, faTimes
} from '@fortawesome/pro-light-svg-icons';
import _ from 'underscore';
import Chart from './windows/Chart';
import Dockable from './windows/Dockable';

class WindowWrapper extends Component 
{
    constructor(props)
    {
        super(props);
        this.state = {
            info: props.info,
            cursor: 'default',
            border: null,
            is_move: false,
            is_resize: false,
            keys: [],
            before_change: 60,
            hovered: {
                move: false,
                resize: false,
                scrollbar: false
            },
            context_menu: null
        }

        this.setWindowBtnsRef = elem => {
            this.windowBtns = elem;
        };

        this.setInnerWindowBtnsRef = elem => {
            this.innerWindowBtns = elem;
        }

        this.setWindowWrapperRef = elem => {
            this.windowWrapper = elem;
        };

        this.setInnerElementRef = elem => {
            this.innerElement = elem;
        }

        this.setCameraRef = elem => {
            this.camera = elem;
        };

        this.setContextMenuRef = elem => {
            this.contextMenu = elem;
        }
        
        // Bind functions
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMoveThrottled = _.throttle(this.onMouseMoveThrottled.bind(this), 10);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onResize = this.onResize.bind(this);
    }

    componentDidMount()
    {
        window.addEventListener("mousedown", this.onMouseDown);
        window.addEventListener("mouseup", this.onMouseUp);
        window.addEventListener("resize", this.onResize);
        
        window.addEventListener("mousemove", this.onMouseMoveThrottled);

        // const throttled_scroll = _.throttle(this.onScroll.bind(this), 20);
        // window.addEventListener(
        //     "onwheel" in document ? "wheel" : "mousewheel",
        //     throttled_scroll
        // );

        this.update();
    }

    componentDidUpdate()
    {
        this.update();
    }

    componentWillUnmount()
    {
        window.removeEventListener("mousedown", this.onMouseDown);
        window.removeEventListener("mouseup", this.onMouseUp);
        window.removeEventListener("resize", this.onResize);

        window.removeEventListener("mousemove", this.onMouseMoveThrottled);

        this.props.removeWindowsRef(this);
    }

    render() {
        return (
            <React.Fragment>
            
            <div
                ref={this.setWindowWrapperRef}
                className="window wrapper"
                style={{
                    cursor: this.state.cursor,
                    zIndex: this.state.info.zIndex,
                    border: this.getBorder()
                }}
            >
                <div ref={this.setWindowBtnsRef} className='window btns'>
                    <div ref={this.setInnerWindowBtnsRef}>
                        <FontAwesomeIcon className='window item small' icon={faSquare} onClick={this.onMaximise} />
                        {/* <FontAwesomeIcon className='window item small' icon={faWindowMaximize} onClick={this.notAvailable} /> */}
                        {/* <FontAwesomeIcon className='window item' icon={faMinus} onClick={this.notAvailable} /> */}
                        <FontAwesomeIcon className='window item' icon={faTimes} onClick={this.notAvailable} />
                    </div>
                </div>
                <Camera
                    ref={this.setCameraRef}
                />
                {this.getWindowElement()}
            </div>

            <div ref={this.setContextMenuRef} className='context-menu body'>
                {this.populateContextMenu()}
            </div>

            </React.Fragment>
        )
    }

    getWindowElement = () =>
    {
        if (this.state.info.type === 'chart')
        {
            return (<Chart
                key={this.state.info.id}
                ref={this.setInnerElementRef}
                strategy_id={this.props.strategy_id}
                item_id={this.state.info.id}
                isDemo={this.props.isDemo}
                // Universal Props
                getTopOffset={this.getTopOffset}
                getScreenPos={this.getScreenPos}
                getWindowInfo={this.getWindowInfo}
                getMetadata={this.props.getMetadata}
                setMetadata={this.props.setMetadata}
                getAppContainerSize={this.getAppContainerSize}
                getWindowWorldPos={this.getWorldPos}
                getWindowScreenPos={this.getScreenPos}
                getWindowSize={this.getWorldSize}
                getMousePos={this.props.getMousePos}
                getKeys={this.props.getKeys}
                getCursor={this.getCursor}
                setCursor={this.setCursor}
                notAvailable={this.notAvailable}
                getPopup={this.props.getPopup}
                getContextMenu={this.getContextMenu}
                setContextMenu={this.setContextMenu}
                convertIncomingPositionSize={this.props.convertIncomingPositionSize}
                isLoaded={this.props.isLoaded}
    
                // Window Props
                connectChart={this.props.connectChart}
                retrieveChartData={this.props.retrieveChartData}
                addChart={this.props.addChart}
                deleteChart={this.props.deleteChart}
                getChart={this.props.getChart}
                getBrokerChart={this.props.getBrokerChart}
                addBrokerChart={this.props.addBrokerChart}
                updateChart={this.props.updateChart}
                findIndicator={this.props.findIndicator}
                createIndicator={this.props.createIndicator}
                calculateIndicator={this.props.calculateIndicator}
                resetIndicators={this.props.resetIndicators}
                getPeriodOffsetSeconds={this.props.getPeriodOffsetSeconds}
                getDrawings={this.props.getDrawings}
                getPositions={this.props.getPositions}
                getOrders={this.props.getOrders}
                getCurrentTimestamp={this.props.getCurrentTimestamp}
                setCurrentTimestamp={this.props.setCurrentTimestamp}
                getCountDate={this.props.getCountDate}
                getCountDateFromDate={this.props.getCountDateFromDate}
                getStrategyInfo={this.props.getStrategyInfo}
                updateStrategyInfo={this.props.updateStrategyInfo}
                updateInfo={this.props.updateInfo}
                getCurrentAccount={this.props.getCurrentAccount}
                windowExists={this.props.windowExists}
                getWindowById={this.props.getWindowById}
                isTopWindow={this.props.isTopWindow}
                getTopWindow={this.props.getTopWindow}
                setPopup={this.props.setPopup}
                setSelectedOffset={this.props.setSelectedOffset}
                getSelectedOffset={this.props.getSelectedOffset}
                setSelectedChart={this.props.setSelectedChart}
                getBorder={this.getBorder}
                setBorder={this.setBorder}
                getTimezones={this.props.getTimezones}
            />)
        }
        else if (this.state.info.type === 'dockable')
        {
            return <Dockable
                key={this.state.info.id}
                ref={this.setInnerElementRef}
                strategy_id={this.props.strategy_id}
                item_id={this.state.info.id}
                info={this.state.info}
                updateStrategyInfo={this.props.updateStrategyInfo}
                getContainerSize={this.props.getContainerSize}
                getElementType={this.getElementType}
                getLog={this.props.getLog}
                getMousePos={this.props.getMousePos}
                getWindowById={this.props.getWindowById}
                getTopWindow={this.props.getTopWindow}
                getInfo={this.props.getInfo}
                getCurrentAccount={this.props.getCurrentAccount}
                getSelectedChart={this.props.getSelectedChart}
                getGlobalInputVariables={this.props.getGlobalInputVariables}
                getCurrentGlobalVariablesPreset={this.props.getCurrentGlobalVariablesPreset}
                getLocalInputVariables={this.props.getLocalInputVariables}
                getCurrentLocalVariablesPreset={this.props.getCurrentLocalVariablesPreset}
                updateInputVariables={this.props.updateInputVariables}
                getScreenSize={this.getRoundedScreenSize}
                retrieveReport={this.props.retrieveReport}
                setCurrentTimestamp={this.props.setCurrentTimestamp}
                getScrollbarHovered={this.getScrollbarHovered}
                setScrollbarHovered={this.setScrollbarHovered}
                isTopWindow={this.props.isTopWindow}
                getTopOffset={this.getTopOffset}
                getWindowScreenPos={this.getScreenPos}
                setChartPositionsByTimestamp={this.props.setChartPositionsByTimestamp}
                getPositions={this.props.getPositions}
                getOrders={this.props.getOrders}
                getTransactions={this.props.getTransactions}
                getWindowBtnsWidth={this.getWindowBtnsWidth}
                getBalance={this.props.getBalance}
                getBanner={this.props.getBanner}
                setBanner={this.props.setBanner}
                isLoaded={this.props.isLoaded}
            />;
        }

        return <React.Fragment/>;
    }

    populateContextMenu = () =>
    {
        return this.state.context_menu;
    }

    onMouseDown(e)
    {
        if (!this.getMaximised())
        {
            const mouse_pos = {
                x: e.clientX, y: e.clientY-this.getTopOffset()
            }
            const { pos, size } = this.state.info;
            let { is_move, is_resize, before_change, hovered } = this.state;

            if (this.props.isTopWindow(
                this.getStrategyId(), this.getItemId(), mouse_pos
            ))
            {
                this.props.setTopWindow(this.getStrategyId(), this.getItemId());
                
                // e.preventDefault();
                this.props.hideShadows(true);

                if (hovered.resize !== false)
                {
                    is_resize = hovered.resize;
                    before_change = {
                        id: this.getItemId(),
                        action: 'resize',
                        item: {
                            x: Math.round(pos.x), y: Math.round(pos.y),
                            width: Math.round(size.width), height: Math.round(size.height)
                        }
                    };
    
                    this.setState({ is_resize, before_change });
                }
                else if (hovered.move)
                {
                    is_move = true;
                    before_change = {
                        id: this.getItemId(),
                        action: 'move',
                        item: this.props.clone(pos)
                    };
    
                    this.setState({ is_move, before_change });
                }
            }
        }
    }

    isMoveMouseLocation(mouse_pos, is_top, hovered)
    {
        let is_changed = false;
        if (is_top)
        {
            const rect = this.windowWrapper.getBoundingClientRect();
            rect.y = rect.y - this.getTopOffset();
            const MOVE_THRESHOLD_Y = 28;

            let is_hovered = false;
            if (mouse_pos.y < rect.y + MOVE_THRESHOLD_Y)
            {
                is_hovered = true;
            }
    
            if (is_hovered !== hovered.move)
            {
                hovered.move = is_hovered;
                is_changed = true;
            }
        }

        return is_changed;
    }

    isResizeMouseLocation(mouse_pos, is_top, hovered)
    {
        let is_changed = false;
        if (is_top)
        {
            let rect = this.windowWrapper.getBoundingClientRect();
            rect.y = rect.y - this.getTopOffset();
            // const RESIZE_THRESHOLD_X = this.props.getSize().width / this.props.getScale().x;
            // const RESIZE_THRESHOLD_Y = this.props.getSize().height / this.props.getScale().y;
            const RESIZE_THRESHOLD_X = 10;
            const RESIZE_THRESHOLD_Y = 10;

            let direction = false;
            if (mouse_pos.x < rect.x + RESIZE_THRESHOLD_X &&
                mouse_pos.y < rect.y + RESIZE_THRESHOLD_Y)
            {
                direction = 'nw-resize';
            }
            else if (mouse_pos.x > rect.x + rect.width - RESIZE_THRESHOLD_X &&
                        mouse_pos.y < rect.y + RESIZE_THRESHOLD_Y)
            {
                direction = 'ne-resize';
            }
            else if (mouse_pos.x < rect.x + RESIZE_THRESHOLD_X &&
                        mouse_pos.y > rect.y + rect.height - RESIZE_THRESHOLD_Y)
            {
                direction = 'sw-resize';
            }
            else if (mouse_pos.x > rect.x + rect.width - RESIZE_THRESHOLD_X &&
                        mouse_pos.y > rect.y + rect.height - RESIZE_THRESHOLD_Y)
            {
                direction = 'se-resize';
            }
            else if (mouse_pos.x < rect.x + RESIZE_THRESHOLD_X)
            {
                direction = 'w-resize';
            }
            else if (mouse_pos.x > rect.x + rect.width - RESIZE_THRESHOLD_X)
            {
                direction = 'e-resize';
            }
            else if (mouse_pos.y < rect.y + RESIZE_THRESHOLD_Y)
            {
                direction = 'n-resize';
            }
            else if (mouse_pos.y > rect.y + rect.height - RESIZE_THRESHOLD_Y)
            {
                direction = 's-resize';
            }
    
            if (hovered.resize !== direction)
            {
                is_changed = true;
                hovered.resize = direction;
            }
        }

        return is_changed;
    }

    handleKeys(e)
    {
        const { is_move, is_resize, cursor } = this.state;
        const keys = this.props.getKeys();
        const mouse_pos = {
            x: e.clientX, y: e.clientY-this.getTopOffset()
        }
        const is_top = this.props.isTopWindow(
            this.getStrategyId(), this.getItemId(), mouse_pos
        )

        if (keys.includes(SPACEBAR))
        {
            if (cursor === 'auto')
            {
                this.hideWindowBtns();
    
                if (!is_move && !is_resize)
                {
                    if (is_top)
                    {
                        mouse_pos.y += this.getTopOffset();
                        if (!this.isResizeMouseLocation(mouse_pos))
                        {
                            this.setCursor('move');
                        }
                    }
                }
            }
        }
        else
        {
            this.showWindowBtns(is_top);
            if (cursor !== 'auto')
            {
                this.setCursor('auto');
            }
        }
    }

    getCursor = () =>
    {
        return this.state.cursor;
    }

    setCursor = (new_cursor) =>
    {
        let { cursor } = this.state;
        if (cursor !== new_cursor)
        {
            cursor = new_cursor;
            this.setState({ cursor });
        }
    }

    showWindowBtns(is_top)
    {
        if (this.windowBtns !== null)
        {
            if (is_top)
            {
                this.windowBtns.style.display = '';
            }
            else
            {
                this.windowBtns.style.display = 'none';
            }
        }
    }

    hideWindowBtns()
    {
        if (this.windowBtns.style.display !== 'none')
            this.windowBtns.style.display = 'none';
    }

    moveWindow(e)
    {
        const { is_move } = this.state;

        if (is_move && !this.getMaximised())
        {
            let { info } = this.state;
            const scale = this.props.getScale();
            const camera = this.getCamera();
            const container_size = this.getAppContainerSize();

            const screen_move = { x: e.movementX, y: e.movementY };
            let move = camera.convertScreenUnitToWorldUnit(
                screen_move, container_size, scale
            );
            info.pos.x += move.x;
            info.pos.y += move.y;
            info.pos = this.clampMove(info.pos, info.size, scale);
            
            this.props.updateStrategyInfo();
        }
    }

    resizeWindow(e)
    {
        const { is_resize } = this.state;

        if (is_resize && !this.getMaximised())
        {
            let pos_direction_x = 0;
            let pos_direction_y = 0;
            let size_direction_x = 0;
            let size_direction_y = 0;
            if (is_resize === 'nw-resize')
            {
                pos_direction_x = -1;
                pos_direction_y = -1;
                size_direction_x = 1;
                size_direction_y = 1;
            }
            else if (is_resize === 'ne-resize')
            {
                pos_direction_y = -1;
                size_direction_x = 1;
                size_direction_y = 1;
            }
            else if (is_resize === 'sw-resize')
            {
                pos_direction_x = -1;
                size_direction_x = 1;
                size_direction_y = 1;
            }
            else if (is_resize === 'se-resize')
            {
                size_direction_x = 1;
                size_direction_y = 1;
            }
            else if (is_resize === 'w-resize')
            {
                pos_direction_x = -1;
            }
            else if (is_resize === 'e-resize')
            {
                size_direction_x = 1;
                size_direction_y = 0;
            }
            else if (is_resize === 'n-resize')
            {
                pos_direction_y = -1;
                size_direction_x = 0;
                size_direction_y = 1;
            }
            else if (is_resize === 's-resize')
            {
                size_direction_x = 0;
                size_direction_y = 1;
            }

            let { info, before_change } = this.state;
            const scale = this.props.getScale();
            const camera = this.getCamera();
            const container_size = this.getAppContainerSize();

            const screen_move = { x: e.movementX, y: e.movementY };
            let move = camera.convertScreenUnitToWorldUnit(
                screen_move, container_size, scale
            );
                
            if (pos_direction_x)
            {
                if ((before_change.item.x + before_change.item.width) - (info.pos.x + move.x) > MIN_WINDOW_SIZE)
                {
                    info.pos.x += move.x;
                    info.pos = this.clampPos(info.pos);
    
                    info.size.width = (before_change.item.x + before_change.item.width) - info.pos.x;
                }
            }
            else
            {
                info.size.width += (move.x * size_direction_x);
            }

            if (pos_direction_y)
            { 
                if ((before_change.item.y + before_change.item.height) - (info.pos.y + move.y) > MIN_WINDOW_SIZE)
                {
                    info.pos.y += move.y;
                    info.pos = this.clampPos(info.pos);
                    info.size.height = (before_change.item.y + before_change.item.height) - info.pos.y;
                }
            }
            else
            {
                info.size.height += (move.y * size_direction_y);
            }
            info.size = this.clampSize(info.pos, info.size, scale);

            
            this.props.updateStrategyInfo();
        }
    }

    handleCursor(hovered)
    {
        let { cursor, is_move, is_resize } = this.state;

        if (is_resize !== false)
        {
            cursor = is_resize;
        }
        else if (is_move)
        {
            cursor = 'move';
        }
        else if (hovered.scrollbar)
        {
            cursor = 'default';
        }
        else if (hovered.resize !== false)
        {
            cursor = hovered.resize;
        }
        else if (hovered.move)
        {
            cursor = 'move';
        }
        else
        {
            cursor = 'inherit';
        }

        this.setState({ cursor });
    }

    onMouseMoveThrottled(e)
    {
        const mouse_pos = {
            x: e.clientX, y: e.clientY-this.getTopOffset()
        }
        const is_top = this.props.isTopWindow(
            this.getStrategyId(), this.getItemId(), mouse_pos
        )
        // if (!this.getMaximised() && !this.props.getPopup())
        // {
        //     let { hovered } = this.state;
        //     let isChanged = false;
    
        //     isChanged = isChanged || this.isResizeMouseLocation(mouse_pos, is_top, hovered);
        //     isChanged = isChanged || this.isMoveMouseLocation(mouse_pos, is_top, hovered);
    
        //     if (isChanged)
        //     {
        //         this.handleCursor(hovered);
        //     }
    
        //     // this.handleKeys(e);
    
        //     this.moveWindow(e);
        //     this.resizeWindow(e);
        // }

        this.showWindowBtns(is_top);
    }

    onMouseUp(e)
    {
        let pos = this.getWorldPos();
        let size = this.getWorldSize();
        let { is_move, is_resize, before_change, hovered } = this.state;
        if (is_move)
        {
            is_move = false;

            pos.x = Math.round(pos.x)
            pos.y = Math.round(pos.y)
            const new_item = {
                id: this.getItemId(),
                action: 'move',
                item: {
                    x: pos.x - before_change.item.x,
                    y: pos.y - before_change.item.y
                }
            }
            
            if (this.hasMoved(new_item))
                this.props.addHistory(this.getStrategyId(), new_item);

            this.setState({ is_move, pos });
        }
        if (is_resize)
        {
            is_resize = false;
            size.width = Math.round(size.width)
            size.height = Math.round(size.height)
            const new_item = {
                id: this.getItemId(),
                action: 'resize',
                item: {
                    width: size.width - before_change.item.width,
                    height: size.height - before_change.item.height
                }
            }
            
            if (this.hasResized(new_item))
                this.props.addHistory(this.getStrategyId(), new_item);

            this.setState({ is_resize, size });
        }

        this.handleCursor(hovered)
        this.props.hideShadows(false);
    }

    hasMoved(new_item)
    {
        return (new_item.item.x !== 0 || new_item.item.y !== 0);
    }

    hasResized(new_item)
    {
        return (new_item.item.width !== 0 || new_item.item.height !== 0);
    }

    onResize()
    {
        this.update();
        this.forceUpdate();
    }

    onClose = () =>
    {
        // this.props.closeWindow(this.getStrategyId(), this.getItemId());
    }

    onMinimize()
    {
        console.log('minimize');
    }

    onPopout()
    {
        console.log('popout');
    }

    onMaximise = () =>
    {
        let { info, hovered } = this.state;
        if (info.maximised)
        {
            info.maximised = false;
        }
        else
        {
            info.maximised = true;
        }

        const new_item = {
            id: this.getItemId(),
            action: 'maximise',
            item: {
                maximise: info.maximised
            }
        }
        this.props.addHistory(this.getStrategyId(), new_item);

        Object.keys(hovered).forEach(key => hovered[key] = false);
        this.handleCursor(hovered);
        this.setState({ info, hovered });
    }

    clampMove(pos, size, scale)
    {
        if (pos.x < 0) pos.x = 0;
        if (pos.y < 0) pos.y = 0;
        if (pos.x + size.width > scale.x) pos.x = scale.x - size.width;
        if (pos.y + size.height > scale.y) pos.y = scale.y - size.height;
        return pos;
    }

    clampPos(pos)
    {
        if (pos.x < 0) pos.x = 0;
        if (pos.y < 0) pos.y = 0;

        return pos;
    }

    clampSize(pos, size, scale)
    {
        if (size.width < MIN_WINDOW_SIZE) size.width = MIN_WINDOW_SIZE;
        if (size.height < MIN_WINDOW_SIZE) size.height = MIN_WINDOW_SIZE;
        if (size.width + pos.x > scale.x) size.width = scale.x - pos.x;
        if (size.height + pos.y > scale.y) size.height = scale.y - pos.y;
        return size;
    }

    update()
    {
        let window_wrapper = this.getWindowWrapper();
        if (this.getMaximised())
        {
            const camera = this.getCamera();
            const scale = this.props.getScale();
            const container_size = this.getAppContainerSize();
            const screen_pos = camera.convertScaledWorldUnitToScreenUnit(
                {x: 0, y: 0 }, container_size, scale
            );
            const screen_size = camera.convertScaledWorldUnitToScreenUnit(
                { x: scale.x, y: scale.y }, container_size, scale
            );

            window_wrapper.style.left = Math.round(screen_pos.x) + "px";
            window_wrapper.style.top = Math.round(screen_pos.y) + "px";
            window_wrapper.style.width = Math.round(screen_size.x) + "px";
            window_wrapper.style.height = Math.round(screen_size.y) + "px";
        }
        else
        {
            const camera = this.getCamera();
            const pos = this.getWorldPos();
            const size = this.getWorldSize();
            const scale = this.props.getScale();
            const container_size = this.getAppContainerSize();
            const screen_pos = camera.convertScaledWorldUnitToScreenUnit(
                {x: Math.round(pos.x), y: Math.round(pos.y) }, container_size, scale
            );
            const screen_size = camera.convertScaledWorldUnitToScreenUnit(
                { x: Math.round(size.width), y: Math.round(size.height) }, container_size, scale
            );

            window_wrapper.style.left = Math.round(screen_pos.x) + "px";
            window_wrapper.style.top = Math.round(screen_pos.y) + "px";
            window_wrapper.style.width = (
                Math.round(screen_size.x)
            ) + "px";
            window_wrapper.style.height = (
                Math.round(screen_size.y)
            ) + "px";

            // window_wrapper.style.width = (
            //     Math.round(screen_size.x) - Math.max(Math.round(screen_pos.x) + Math.round(screen_size.x) - container_size.width, 0)
            // ) + "px";
            // window_wrapper.style.height = (
            //     Math.round(screen_size.y) - Math.max(Math.round(screen_pos.y) + Math.round(screen_size.y) - container_size.height, 0)
            // ) + "px";
        }
    }

    notAvailable = (e) =>
    {
        const popup = {
            type: 'not-available',
            size: {
                pixelWidth: 600,
                pixelHeight: 300
            }
        }
        this.props.setPopup(popup);
    }

    getAppContainerSize = () =>
    {
        return { 
            width: this.props.getAppContainer().clientWidth,
            height: this.props.getAppContainer().clientHeight
        }
    }

    getWorldPos = () =>
    {
        if (this.getMaximised())
        {
            return { x: 0, y: 0 };
        }
        else
        {
            return this.state.info.pos;
        }
    }

    getScreenPos = () =>
    {
        if (this.getMaximised())
        {
            return { x: 0, y: 0 };
        }
        else
        {
            const pos = this.state.info.pos;
            return this.props.convertWorldUnitToScreenUnit(pos);
        }
    }

    getWorldSize = () =>
    {
        if (this.getMaximised())
        {
            const scale = this.props.getScale();
            return { width: scale.x, height: scale.y };
        }
        else
        {
            return this.state.info.size;
        }
    }

    getScreenSize = () =>
    {
        let result = undefined
        if (this.getMaximised())
        {
            const scale = this.props.getScale();
            result = this.props.convertWorldUnitToScreenUnit(scale);
        }
        else
        {
            const size = this.state.info.size;
            result = this.props.convertWorldUnitToScreenUnit({
                x: size.width, y: size.height
            });
        }
        return { width: result.x, height: result.y };
    }

    getRoundedScreenSize = () =>
    {
        const camera = this.getCamera();
        const scale = this.props.getScale();
        const container_size = this.getAppContainerSize();

        const screen_size = this.getScreenSize();
        const world_size = camera.convertScreenUnitToWorldUnit(
            { x: screen_size.width, y: screen_size.height }, container_size, scale
        );

        return camera.convertWorldUnitToScreenUnit(
            {x: Math.round(world_size.x), y: Math.round(world_size.y)}, container_size, scale
        );
    }

    getMaximised = () =>
    {
        return this.state.info.maximised;
    }

    getTopOffset = () =>
    {
        return this.props.getAppContainer().offsetTop;
    }

    getWindowInfo = () =>
    {
        return this.state.info;
    }

    getStrategyId = () =>
    {
        return this.props.strategy_id;
    }

    getItemId = () =>
    {
        return this.state.info.id;
    }

    getElementType = () =>
    {
        return this.state.info.type;
    }

    getInnerElement = () =>
    {
        return this.innerElement;
    }

    getWindowWrapper = () =>
    {
        return this.windowWrapper;
    }

    getCamera = () =>
    {
        return this.camera;
    }

    getKeys = () =>
    {
        return this.state.keys;
    }

    getBorder = () => 
    {
        if (
            this.state.info.type === 'chart' && 
            this.props.getSelectedChart() !== null && 
            this.props.getSelectedChart().getItemId() === this.getItemId()
        )
        {
            return '1px solid #ff8103';
        }
        else
        {
            return null;
        }
    }

    getScrollbarHovered = () =>
    {
        return this.state.hovered.scrollbar;
    }

    setScrollbarHovered = (is_hovered) =>
    {
        let { hovered } = this.state;
        hovered.scrollbar = is_hovered;
        this.handleCursor(hovered);
        this.setState({ hovered });
    }

    getWindowBtnsWidth = () =>
    {
        return this.innerWindowBtns.clientWidth;
    }

    getContextMenu = () =>
    {
        return this.contextMenu;
    }

    setContextMenu = (context_menu) =>
    {
        this.setState({ context_menu });
    }

}

const MIN_WINDOW_SIZE = 10;
const SPACEBAR = 32;

export default WindowWrapper;