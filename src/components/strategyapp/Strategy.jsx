import React, { Component } from 'react';
import WindowWrapper from './WindowWrapper';

class Strategy extends Component 
{
    state = {
        current_page: 0
    }

    render() {
        return (
            <React.Fragment>
                {this.generateWindows()}
            </React.Fragment>
        );
    }

    componentDidMount()
    {

    }

    generateWindows()
    {
        const { current_page } = this.state;

        let gen_windows = [];

        const strategy_info = this.props.getStrategyInfo(this.props.id);
        let i = '';
        if (strategy_info !== undefined)
        {
            for (i in strategy_info.windows)
            {
                const w = strategy_info.windows[i];
    
                if (w.page === current_page)
                {
                    gen_windows.push(
                        <WindowWrapper
                            key={w.id}
                            info={w}
                            strategy_id={this.props.id}
                            getAppContainer={this.props.getAppContainer}
                            getScale={this.props.getScale}
                            getChartElement={this.props.getChartElement}
                            // Window Funcs
                            closeWindow={this.props.closeWindow}
                        />
                    )
                }
            }
        }
        return gen_windows;
    }

}

export default Strategy;