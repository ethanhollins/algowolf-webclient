import React, { Component } from 'react';
import Charting from './chartapp/Charting';
import Indicators from './chartapp/Indicators';

/**
 * TODO:
 *  - Connect to api socket connection
 *  - Handle admin api key
 *  - Handle specific user information
 *      -> Brokers
 */

class ChartApp extends Component
{
    state = {
        username: 'ethanhollins',
        strategy_id: 'ABCD',
        strategy_info: {},
        charts: {},
    }

    async componentDidMount()
    {
        let { strategy_info, strategy_id, charts } = this.state;
        strategy_info = await this.retrieveStrategyInfo();
        this.setState({ strategy_info });

        charts = await this.retreiveCharts(strategy_id);
        this.setState({ charts });

        const layouts = strategy_info[strategy_id].layouts;
        for (let i = 0; i < layouts.length; i++)
        {
            this.calculateIndicators(strategy_id, i);
        }
    }

    render()
    {
        return (
            <div className='chart_app'>
                <div className='window_tab'>

                </div>
                <div className='toolbox'>

                </div>
                <div className='app_container'>
                    <Charting
                        getStrategyId={this.getStrategyId}
                        getStrategyInfo={this.getStrategyInfo}
                        getCharts={this.getCharts}
                        retrieveChartData={this.retrieveChartData}
                        updateChart={this.updateChart}
                    />
                    <div className='right_panel'>

                    </div>
                </div>
            </div>
        );
    }

    async retrieveStrategyInfo()
    {
        const { username } = this.state;

        /** Retrieve strategy info */
        const strategy_info = await fetch(
            'http://localhost/database/' +
            username + '/strategies'
        )
            .then(res => res.json());
        
        return strategy_info;
    }

    async retreiveCharts(strategy_id)
    {
        const { strategy_info } = this.state;
        let { charts } = this.state;

        /**  Retreive chart data */
        charts[strategy_id] = [];

        // Layouts
        const index = strategy_info[strategy_id].metadata.index;
        const layout = strategy_info[strategy_id].layouts[index];
        for (let i = 0; i < layout.length; i++)
        {
            const c_l = layout[i];

            // Retrieve OHLC data
            let ohlc_data = await this.retrieveChartData(
                c_l.product, c_l.period
            );

            charts[strategy_id].push({
                index: c_l.index,
                product: c_l.product,
                period: c_l.period,
                timestamps: ohlc_data.ohlc.timestamps,
                asks: ohlc_data.ohlc.asks,
                bids: ohlc_data.ohlc.bids,
                overlays: [],
                studies: []
            });
        }
        return charts;
    }

    updateChart = (strategy_id, chart_idx, ohlc) =>
    {
        console.log(this.state);
        let { charts } = this.state;

        const dup = ohlc.timestamps.filter((val) =>
        {
            return charts[strategy_id][chart_idx].timestamps.indexOf(val) !== -1;
        });

        charts[strategy_id][chart_idx].timestamps = [
            ...ohlc.timestamps.slice(0,ohlc.timestamps.length-dup.length),
            ...charts[strategy_id][chart_idx].timestamps
        ];
        charts[strategy_id][chart_idx].bids = [
            ...ohlc.bids.slice(0, ohlc.bids.length-dup.length), 
            ...charts[strategy_id][chart_idx].bids
        ];
        charts[strategy_id][chart_idx].asks = [
            ...ohlc.asks.slice(0, ohlc.asks.length-dup.length), 
            ...charts[strategy_id][chart_idx].asks
        ];

        this.setState({ charts });

        this.calculateIndicators(strategy_id, chart_idx);
    }

    calculateIndicators = (strategy_id, chart_idx) =>
    {
        const { strategy_info } = this.state;
        let { charts } = this.state;

        /**  Retreive indicator data */

        // Layouts
        const index = strategy_info[strategy_id].metadata.index;
        const layout = strategy_info[strategy_id].layouts[index][chart_idx];
        const chart = charts[strategy_id][chart_idx];


        // Overlays
        let overlays = [];
        for (let j = 0; j < layout.overlays.length; j++)
        {
            const c_o = layout.overlays[j];
            overlays.push(
                Indicators[c_o.type](chart.bids, c_o.properties)
            );
        }

        // Studies
        let studies = [];
        for (let j = 0; j < layout.studies.length; j++)
        {
            const c_s = layout.studies[j];
            studies.push(
                Indicators[c_s.type](chart.bids, c_s.properties)
            );
        }

        charts[strategy_id][chart_idx].overlays = overlays;
        charts[strategy_id][chart_idx].studies = studies;

        this.setState({ charts });
    }

    async retrieveChartData(product, period, from, to, page_number)
    {
        if (page_number === undefined) page_number = 0;

        if (from !== undefined)
        {   
            if (to !== undefined)
            {
                const uri = `http://localhost/backtest/prices/\
                ${product}?period=${period}\
                &from=${from.format('YYYY-MM-DDTHH:mm:ss')}Z\
                &to=${to.format('YYYY-MM-DDTHH:mm:ss')}Z\
                &page_number=${page_number}`.replace(/\s/g, '');

                return await fetch(uri)
                    .then(res => res.json());
            }
            else
            {
                const uri = `http://localhost/backtest/prices/\
                ${product}?period=${period}\
                &from=${from.format('YYYY-MM-DDTHH:mm:ss')}Z\
                &count=1000&page_number=${page_number}`.replace(/\s/g, '');

                return await fetch(uri)
                    .then(res => res.json());
            }
        }
        else
        {
            const uri = `http://localhost/backtest/prices/\
                ${product}?period=${period}\
                &count=1000&page_number=${page_number}`.replace(/\s/g, '');
            return await fetch(uri)
                .then(res => res.json());
        }
    }

    getStrategyId = () =>
    {
        return this.state.strategy_id;
    }

    getStrategyInfo = () =>
    {
        return this.state.strategy_info[this.state.strategy_id];
    }

    getCharts = () =>
    {
        const charts = this.state.charts[this.state.strategy_id];
        return charts !== undefined ? charts : [];
    }
}

export default ChartApp;