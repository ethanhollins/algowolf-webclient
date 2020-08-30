import React, { Component } from 'react';
import StrategyItem from './strategies/StrategyItem';

class Strategies extends Component
{
    render()
    {
        return (
            <div>
                <StrategyItem />
                <StrategyItem />
            </div>
        );
    }
}

export default Strategies;