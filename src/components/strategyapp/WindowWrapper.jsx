import React, { Component } from 'react';
import Camera from './Camera';
import Drawings from './paths/Paths';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faWindowMaximize
} from '@fortawesome/pro-regular-svg-icons';
import { 
    faSquare, faMinus, faTimes
} from '@fortawesome/pro-light-svg-icons';

class WindowWrapper extends Component 
{
    state = {
        pos: { x: 0, y: 0 },
        size: { width: 60, height: 70 },
        last_pos: { x: 0, y: 0},
        last_size: { width: 60, height: 70 },
        maximised: false,
        is_move: false,
        keys: []
    }

    constructor(props)
    {
        super(props);

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
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onResize = this.onResize.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
    }

    componentDidMount()
    {
        window.addEventListener("mousedown", this.onMouseDown);
        window.addEventListener("mousemove", this.onMouseMove);
        window.addEventListener("mouseup", this.onMouseUp);
        window.addEventListener("resize", this.onResize);
        
        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this.onKeyUp);
        
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
        window.removeEventListener("mousemove", this.onMouseMove);
        window.removeEventListener("mouseup", this.onMouseUp);
        window.removeEventListener("resize", this.onResize);
        
        window.removeEventListener("keydown", this.onKeyDown);
        window.removeEventListener("keyup", this.onKeyUp);
    }

    render() {
        return (
            <div
                ref={this.setWindowWrapperRef}
                className="window wrapper"
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
        if (this.props.info.type === 'chart')
        {
            return this.props.getChartElement(
                this.props.strategy_id,
                this.props.info.id,
                this.getTopOffset,
                this.getScreenPos,
                this.getWindowInfo,
                this.getKeys
            );
        }

        return <React.Fragment/>
    }

    onMouseDown(e)
    {
        const mouse_pos = {
            x: e.clientX, y: e.clientY-this.getTopOffset()
        }
        const { pos, size, keys } = this.state;
        const scale = this.props.getScale();
        const camera = this.getCamera();
        const container_size = this.getContainerSize();
        let { is_move } = this.state;

        const screen_pos = camera.convertWorldUnitToScreenUnit(
            pos, container_size, scale
        );
        const screen_size = camera.convertWorldUnitToScreenUnit(
            { x: size.width, y: size.height }, container_size, scale
        );

        let rect = {
            x: screen_pos.x,
            y: screen_pos.y,
            width: screen_size.x,
            height: screen_size.y
        }

        if (keys.includes(SPACEBAR) && this.isWithinBounds(rect, mouse_pos))
        {
            e.preventDefault();
            is_move = true;
            this.setState({ is_move });
        }
    }

    showWindowBtns(e)
    {
        const mouse_pos = {
            x: e.clientX, y: e.clientY-this.getTopOffset()
        }
        const { pos, size } = this.state;
        const scale = this.props.getScale();
        const camera = this.getCamera();
        const container_size = this.getContainerSize();

        const screen_pos = camera.convertWorldUnitToScreenUnit(
            pos, container_size, scale
        );
        const screen_size = camera.convertWorldUnitToScreenUnit(
            { x: size.width, y: size.height }, container_size, scale
        );

        let rect = {
            x: screen_pos.x,
            y: screen_pos.y,
            width: screen_size.x,
            height: screen_size.y
        }

        if (this.isWithinBounds(rect, mouse_pos))
        {
            this.windowBtns.style.display = '';
        }
        else
        {
            this.windowBtns.style.display = 'none';
        }
    }

    moveWindow(e)
    {
        const { is_move } = this.state;

        if (is_move)
        {
            let { pos, size } = this.state;
            const scale = this.props.getScale();
            const camera = this.getCamera();
            const container_size = this.getContainerSize();

            const screen_move = { x: e.movementX, y: e.movementY };
            let move = camera.convertScreenUnitToWorldUnit(
                screen_move, container_size, scale
            );
            pos.x += move.x;
            pos.y += move.y;
            pos = this.clampMove(pos, size, scale);
            
            this.setState({ pos });
        }
    }

    onMouseMove(e)
    {
        this.showWindowBtns(e);
        this.moveWindow(e);
    }

    onMouseUp(e)
    {
        let { is_move } = this.state;
        if (is_move)
        {
            is_move = false;
            this.setState({ is_move });
        }
    }

    onKeyDown(e)
    {
        let { keys } = this.state;

        if (!keys.includes(e.keyCode)) 
            keys.push(e.keyCode);
    }

    onKeyUp(e)
    {
        let { keys } = this.state;

        if (keys.includes(e.keyCode)) 
            keys.splice(keys.indexOf(e.keyCode));
        
    }

    onResize()
    {
        this.update();
        this.forceUpdate();
    }

    onClose = () =>
    {
        this.props.closeWindow(this.getStrategyId(), this.getItemId());
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
        let { pos, size, last_pos, last_size, maximised } = this.state;
        if (maximised)
        {
            pos.x = last_pos.x;
            pos.y = last_pos.y;
            size.width = last_size.width;
            size.height = last_size.height;
            maximised = false;
        }
        else
        {
            last_pos.x = pos.x;
            last_pos.y = pos.y;
            last_size.width = size.width;
            last_size.height = size.height;
            pos.x = 0;
            pos.y = 0;
            size.width = 100;
            size.height = 100;
            maximised = true;
        }
        this.setState({ pos, size, last_pos, last_size, maximised });
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

    clampMove(pos, size, scale)
    {
        if (pos.x < 0) pos.x = 0;
        if (pos.y < 0) pos.y = 0;
        if (pos.x + size.width > scale.x) pos.x = scale.x - size.width;
        if (pos.y + size.height > scale.y) pos.y = scale.y - size.height;
        return pos;
    }

    update()
    {
        const camera = this.getCamera();
        const { pos, size } = this.state;
        const scale = this.props.getScale();
        const container_size = this.getContainerSize();
        const screen_pos = camera.convertScaledWorldUnitToScreenUnit(
            {x: Math.round(pos.x), y: Math.round(pos.y) }, container_size, scale
        );
        const screen_size = camera.convertScaledWorldUnitToScreenUnit(
            { x: size.width, y: size.height }, container_size, scale
        );

        let window_wrapper = this.getWindowWrapper();
        window_wrapper.style.left = screen_pos.x + "px";
        window_wrapper.style.top = screen_pos.y + "px";
        window_wrapper.style.width = screen_size.x + "px";
        window_wrapper.style.height = screen_size.y + "px";
    }

    // convertWorldUnitToScreenUnit = (world_unit) =>
    // {
    //     // TODO: Check bounding box, adjust y for upper toolbar
    //     const { size, scale } = this.state;
    //     return this.getCamera().convertWorldUnitToScreenUnit(world_unit, size, scale);
    // }

    getContainerSize = () =>
    {
        return { 
            width: this.props.getAppContainer().clientWidth,
            height: this.props.getAppContainer().clientHeight
        }
    }

    getWorldPos = () =>
    {
        return this.state.pos;
    }

    getScreenPos = () =>
    {
        const { pos } = this.state;
        const scale = this.props.getScale();
        const camera = this.getCamera();
        const container_size = this.getContainerSize();
        return camera.convertWorldUnitToScreenUnit(
            pos, container_size, scale
        );
    }

    getTopOffset = () =>
    {
        return this.props.getAppContainer().offsetTop;
    }

    getWindowInfo = () =>
    {
        return this.props.info;
    }

    getStrategyId = () =>
    {
        return this.props.strategy_id;
    }

    getItemId = () =>
    {
        return this.props.info.id;
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

const SPACEBAR = 32;

export default WindowWrapper;