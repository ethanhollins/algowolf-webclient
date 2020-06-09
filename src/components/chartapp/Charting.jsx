import React, { Component } from 'react';
import Chart from './charting/Chart';

/**
 * TODO:
 *  - Switching charts, and comparment for product search
 *  - Logging
 *  - Ticket/Custom btns
 *  - Live data
 *  - Switching strategies
 *  - Backtesting
 *      -> Auto (On program detection)
 *          - step
 *          - run
 *      -> Manual
 *  - Drawings
 *      -> Api
 *      -> Interface toolbox
 */

class Charting extends Component
{
    state = {
        size: {
            width: 0,
            height: 0
        },
        chart_portions: [
            {x: 1.0, y: 1.0},
        ]
    }

    constructor(props)
    {
        super(props);

        this.setContainerRef = elem => {
            this.container = elem;
        }
    }

    componentDidMount()
    {
        window.addEventListener("resize", this.updateCanvas.bind(this));
        this.updateCanvas();
    }

    render()
    {
        return (
            <div
                className='chart_container'
                ref={this.setContainerRef}
            >
                {this.generateCharts()}
            </div>
        );
    }

    calcMockStudy(ohlc, fast_len, slow_len)
    {
        let mock_study = [];

        let start = 0;
        let ma = 0
        if (slow_len !== undefined) start = slow_len;
        else start = fast_len;

        for (let i = 0; i < ohlc.length; i++)
        {
            if (i < start)
            {
                if (slow_len !== undefined) mock_study.push([null, null]);
                else mock_study.push([null]);
                continue;
            }

            ma = 0
            mock_study.push([]);
            for (let j = 0; j < fast_len; j++) {
                ma = ma + (ohlc[i - j][3] - ohlc[i - j][0]);
            }
            mock_study[mock_study.length-1].push(ma / fast_len);
            
            if (slow_len !== undefined) 
            {
                ma = 0
                for (let j = 0; j < slow_len; j++) {
                    ma = ma + (ohlc[i - j][3] - ohlc[i - j][0]);
                }
                mock_study[mock_study.length - 1].push(ma / slow_len);
            }
        }
        return mock_study
    }

    generateCharts()
    {
        const num_charts = this.getNumCharts();

        if (num_charts !== undefined)
        {
            let charts = [];
            for (let i = 0; i < num_charts; i++)
            {
                charts.push(<Chart
                    key={'chart_'+i}
                    chart_idx={i}
                    
                    getStrategyId={this.props.getStrategyId}
                    getProduct={this.getProduct}
                    getPeriod={this.getPeriod}
                    getTimestamps={this.getTimestamps}
                    getAsks={this.getAsks}
                    getBids={this.getBids}
                    getOverlays={this.getOverlays}
                    getStudies={this.getStudies}
                    getSize={this.getSize}
                    getPortions={this.getPortions}

                    retrieveChartData={this.props.retrieveChartData}
                    updateChart={this.props.updateChart}
                />);
            }
    
            return charts;
        }
        else 
            return [];
    }

    updateCanvas()
    {
        const container = this.getContainer();
        
        let { size } = this.state;
        size.width = container.clientWidth;
        size.height = container.clientHeight;
        this.setState({ size });
    }

    getContainer = () =>
    {
        return this.container;
    }

    getSize = () =>
    {
        return this.state.size;
    }

    getPortions = () =>
    {
        return this.state.chart_portions;
    }

    getNumCharts = () =>
    {
        return this.props.getCharts().length;
    }

    getProduct = (idx) => 
    {
        return this.props.getCharts()[idx].product;
    }

    getPeriod = (idx) => 
    {
        return this.props.getCharts()[idx].period;
    }

    getTimestamps = (idx) =>
    {
        return this.props.getCharts()[idx].timestamps;
    }

    getAsks = (idx) =>
    {
        return this.props.getCharts()[idx].asks;
    }

    getBids = (idx) => {
        return this.props.getCharts()[idx].bids;
    }

    getOverlays = (idx) => 
    {
        return this.props.getCharts()[idx].overlays;
    }

    getStudies = (idx) => 
    {
        return this.props.getCharts()[idx].studies;
    }
}

export default Charting;