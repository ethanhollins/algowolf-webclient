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
import Log from './windows/Log';
import Info from './windows/Info';
import Dockable from './windows/Dockable';

class WindowWrapper extends Component 
{
    constructor(props)
    {
        super(props);
        this.state = {
            info: props.info,
            cursor: 'default',
            is_move: false,
            is_resize: false,
            keys: [],
            before_change: null
        }

        this.setWindowBtnsRef = elem => {
            this.windowBtns = elem;
        };

        this.setWindowWrapperRef = elem => {
            this.windowWrapper = elem;
        };

        this.setCameraRef = elem => {
            this.camera = elem;
        };
        
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
    }

    render() {
        return (
            <div
                ref={this.setWindowWrapperRef}
                className="window wrapper"
                style={{
                    cursor: this.state.cursor,
                    zIndex: this.state.info.zIndex
                }}
            >
                <div ref={this.setWindowBtnsRef} className='window btns'>
                    <div>
                        <FontAwesomeIcon className='window item small' icon={faSquare} onClick={this.onMaximise} />
                        <FontAwesomeIcon className='window item small' icon={faWindowMaximize} onClick={this.onPopout} />
                        <FontAwesomeIcon className='window item' icon={faMinus} onClick={this.onMinimize} />
                        <FontAwesomeIcon className='window item' icon={faTimes} onClick={this.onClose} />
                    </div>
                </div>
                <Camera
                    ref={this.setCameraRef}
                />
                {this.getWindowElement()}
            </div>
        )
    }

    getWindowElement = () =>
    {
        if (this.state.info.type === 'chart')
        {
            return (<Chart
                strategy_id={this.props.strategy_id}
                item_id={this.state.info.id}
                // Universal Props
                getTopOffset={this.getTopOffset}
                getScreenPos={this.getScreenPos}
                getWindowInfo={this.getWindowInfo}
                getWindowWorldPos={this.getWorldPos}
                getWindowScreenPos={this.getScreenPos}
                getWindowSize={this.getWorldSize}
                getKeys={this.props.getKeys}
                getCursor={this.getCursor}
                setCursor={this.setCursor}
    
                // Window Props
                connectChart={this.props.connectChart}
                retrieveChartData={this.props.retrieveChartData}
                addChart={this.props.addChart}
                getChart={this.props.getChart}
                updateChart={this.props.updateChart}
                getIndicator={this.props.getIndicator}
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
                windowExists={this.props.windowExists}
                isTopWindow={this.props.isTopWindow}
                setPopup={this.props.setPopup}
            />)
        }
        else if (this.state.info.type === 'log')
        {
            const sub_window = <Log
                strategy_id={this.props.strategy_id}
                item_id={this.state.info.id}
                title={'Script Log'}
                getLog={this.props.getLog}
            />;

            return <Dockable
                strategy_id={this.props.strategy_id}
                item_id={this.state.info.id}
                window={sub_window}
            />;
        }
        else if (this.state.info.type === 'info')
        {
            const sub_window = <Info
                strategy_id={this.props.strategy_id}
                item_id={this.state.info.id}
                title={'Info'}
                getInfo={this.props.getInfo}
            />;

            return <Dockable
                strategy_id={this.props.strategy_id}
                item_id={this.state.info.id}
                window={sub_window}
            />;
        }

        return <React.Fragment/>;
    }

    onMouseDown(e)
    {
        if (!this.getMaximised())
        {
            const mouse_pos = {
                x: e.clientX, y: e.clientY-this.getTopOffset()
            }
            const { pos, size } = this.state.info;
            const keys = this.props.getKeys();
            let { is_move, is_resize, before_change } = this.state;

            if (this.props.isTopWindow(
                this.getStrategyId(), this.getItemId(), mouse_pos
            ))
            {
                this.props.setTopWindow(this.getStrategyId(), this.getItemId());
                
                if (keys.includes(SPACEBAR))
                {
                    
                    e.preventDefault();
                    this.props.hideShadows(true);

                    mouse_pos.y += this.getTopOffset();
                    const direction = this.isResizeMouseLocation(mouse_pos);
                    if (direction !== false)
                    {
                        is_resize = direction;
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
                    else
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
    }

    isResizeMouseLocation(mouse_pos)
    {
        const rect = this.windowWrapper.getBoundingClientRect();
        const RESIZE_THRESHOLD_X = this.props.getSize().width / this.props.getScale().x;
        const RESIZE_THRESHOLD_Y = this.props.getSize().height / this.props.getScale().y;
        
        let direction = false;
        if (mouse_pos.x < rect.x + RESIZE_THRESHOLD_X &&
            mouse_pos.y < rect.y + RESIZE_THRESHOLD_Y)
        {
            direction = 'nw-resize';
            this.setCursor(direction);
        }
        else if (mouse_pos.x > rect.x + rect.width - RESIZE_THRESHOLD_X &&
                    mouse_pos.y < rect.y + RESIZE_THRESHOLD_Y)
        {
            direction = 'ne-resize';
            this.setCursor('ne-resize');
        }
        else if (mouse_pos.x < rect.x + RESIZE_THRESHOLD_X &&
                    mouse_pos.y > rect.y + rect.height - RESIZE_THRESHOLD_Y)
        {
            direction = 'sw-resize';
            this.setCursor('sw-resize');
        }
        else if (mouse_pos.x > rect.x + rect.width - RESIZE_THRESHOLD_X &&
                    mouse_pos.y > rect.y + rect.height - RESIZE_THRESHOLD_Y)
        {
            direction = 'se-resize';
            this.setCursor('se-resize');
        }
        else if (mouse_pos.x < rect.x + RESIZE_THRESHOLD_X)
        {
            direction = 'w-resize';
            this.setCursor('w-resize');
        }
        else if (mouse_pos.x > rect.x + rect.width - RESIZE_THRESHOLD_X)
        {
            direction = 'e-resize';
            this.setCursor('e-resize');
        }
        else if (mouse_pos.y < rect.y + RESIZE_THRESHOLD_Y)
        {
            direction = 'n-resize';
            this.setCursor('n-resize');
        }
        else if (mouse_pos.y > rect.y + rect.height - RESIZE_THRESHOLD_Y)
        {
            direction = 's-resize';
            this.setCursor('s-resize');
        }
        return direction;
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
        if (is_top)
        {
            this.windowBtns.style.display = '';
        }
        else
        {
            this.windowBtns.style.display = 'none';
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

    onMouseMoveThrottled(e)
    {
        this.handleKeys(e);

        this.moveWindow(e);
        this.resizeWindow(e);

    }

    onMouseUp(e)
    {
        let pos = this.getWorldPos();
        let size = this.getWorldSize();
        let { is_move, is_resize, before_change } = this.state;
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
        let { info } = this.state;
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

        this.setState({ info });
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
            window_wrapper.style.width = Math.round(screen_size.x) + "px";
            window_wrapper.style.height = Math.round(screen_size.y) + "px";
        }
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

}

const MIN_WINDOW_SIZE = 20;
const SPACEBAR = 32;

export default WindowWrapper;