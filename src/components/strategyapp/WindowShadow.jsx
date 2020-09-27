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

class WindowShadow extends Component 
{
    constructor(props)
    {
        super(props);
        this.state = {
            info: props.info,
        }

        this.setWindowShadowRef = elem => {
            this.windowShadow = elem;
        };

        this.onResize = this.onResize.bind(this);
    }

    componentDidMount()
    {
        window.addEventListener("resize", this.onResize);
        this.update();
    }

    componentDidUpdate()
    {
        this.update();
    }

    componentWillUnmount()
    {
        window.removeEventListener("resize", this.onResize);
    }

    render() {
        return (
            <div
                ref={this.setWindowShadowRef}
                className="window shadow"
            >
            </div>
        )
    }

    onResize()
    {
        this.update();
        this.forceUpdate();
    }

    update()
    {
        let window_shadow = this.getWindowShadow();
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

            window_shadow.style.left = parseInt(screen_pos.x) + "px";
            window_shadow.style.top = parseInt(screen_pos.y) + "px";
            window_shadow.style.width = parseInt(screen_size.x) + "px";
            window_shadow.style.height = parseInt(screen_size.y) + "px";
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
    
            window_shadow.style.left = parseInt(screen_pos.x) + "px";
            window_shadow.style.top = parseInt(screen_pos.y) + "px";
            window_shadow.style.width = parseInt(screen_size.x) + "px";
            window_shadow.style.height = parseInt(screen_size.y) + "px";
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

    getWindowShadow = () =>
    {
        return this.windowShadow;
    }

    getCamera = () =>
    {
        return this.props.getCamera();
    }

    getKeys = () =>
    {
        return this.state.keys;
    }

}

export default WindowShadow;