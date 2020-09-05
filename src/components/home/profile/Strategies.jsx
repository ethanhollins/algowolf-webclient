import React, { Component } from 'react';
import StrategyItem from './strategies/StrategyItem';
import { withRouter } from 'react-router-dom';

class Strategies extends Component
{
    render()
    {
        const current_url = this.props.location.pathname;

        return (
            <React.Fragment>

            <div className='profile sub-nav'>
                <a className='selected'>All Strategies</a>
            </div>
            <div>
                <StrategyItem />
                <StrategyItem />
            </div>

            </React.Fragment>
        );
    }

}

export default withRouter(Strategies);