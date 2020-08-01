import React, { Component } from 'react';
import Camera from './Camera';
import Drawings from './paths/Paths';
// import _ from 'underscore';

class WindowWrapper extends Component 
{
    state = {
        pos: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        is_move: false,
        keys: []
    }

    constructor(props)
    {
        super(props);

        this.setWindowWrapperRef = elem => {
            this.windowWrapper = elem;
        };

        this.setCameraRef = elem => {
            this.camera = elem;
        };
    }

    componentDidMount()
    {
        window.addEventListener("mousedown", this.onMouseDown.bind(this));
        window.addEventListener("mousemove", this.onMouseMove.bind(this));
        window.addEventListener("mouseup", this.onMouseUp.bind(this));
        window.addEventListener("resize", this.onResize.bind(this));
        
        window.addEventListener("keydown", this.onKeyDown.bind(this));
        window.addEventListener("keyup", this.onKeyUp.bind(this));
        
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

    render() {
        return (
            <div
                ref={this.setWindowWrapperRef}
                className="window_wrapper"
            >
                <Camera
                    ref={this.setCameraRef}
                />
                {this.props.getWindowElement(
                    this.props.strategy_id,
                    this.props.item_id,
                    this.getTopOffset,
                    this.getScreenPos,
                    this.getKeys
                )}
            </div>
        )
    }

    generateCorner()
    {
        return Drawings['window_corner']();
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

    onMouseMove(e)
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