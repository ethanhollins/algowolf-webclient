import React, { Component } from 'react';

/**
 * TODO:
 *  - Convert zoom to scale (x,y)
 *  - Dynamic scaling
 *  - Converting screen to world, vice versa
 */

class Camera extends Component
{

    render()
    {
        return(
            <React.Fragment/>
        );
    }

    convertScreenPosToWorldPos = (screen_pos, pos, size, scale) =>
    {
        let world_pos = {
            x:0, y:0
        };

        world_pos.x = (
            pos.x - ((screen_pos.x / size.width) * scale.x - scale.x)
        );

        world_pos.y = (
            (scale.y/2 - ((screen_pos.y / size.height) * scale.y)) + pos.y
        );

        return world_pos;
    }

    convertWorldPosToScreenPos = (world_pos, pos, size, scale) =>
    {
        let screen_pos = {
            x:0, y:0
        };

        screen_pos.x = (
            ((pos.x - world_pos.x) / scale.x) * size.width + size.width
        );
        screen_pos.y = (
            ((scale.y/2 - (world_pos.y - pos.y)) / scale.y) * size.height
        );

        return screen_pos;
    }

    convertScreenUnitToWorldUnit = (screen_unit, size, scale) => 
    {
        let world_unit = {
            x: 0, y: 0
        };

        world_unit.x = (
            (screen_unit.x / size.width) * scale.x
        );
        world_unit.y = (
            (screen_unit.y / size.height) * scale.y
        );

        return world_unit;
    }

    convertWorldUnitToScreenUnit = (world_unit, size, scale) => 
    {
        let screen_unit = {
            x: 0, y: 0
        };

        screen_unit.x = (
            (world_unit.x / scale.x) * size.width
        );
        screen_unit.y = (
            (world_unit.y / scale.y) * size.height
        );

        return screen_unit;
    }
    

}

export default Camera;