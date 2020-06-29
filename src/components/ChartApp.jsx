import React, { Component } from 'react';
import Indicators from './chartapp/Indicators';
import io from 'socket.io-client';
import WindowWrapper from './chartapp/WindowWrapper';
import Chart from './chartapp/windows/chart/Chart';
import moment from "moment-timezone";

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
        sio: null,
        username: 'ethanhollins',
        strategies: {},
        strategy: 'ABCD',
        page: 0,
        charts: {},
    }

    constructor(props)
    {
        super(props);

        this.setAppContainerRef = elem => {
            this.appContainer = elem;
        };
    }

    async componentDidMount()
    {
        let { sio, strategy } = this.state;

        // Connect to API socket
        sio = this.handleSocket();
        this.setState({ sio });
        
        // Retrieve user specific strategy informations
        await this.retrieveStrategies([strategy]);
    }

    render()
    {
        return (
            <div className='chart_app'>
                <div className='window_tab'>

                </div>
                <div className='toolbox'>
                    <div className='toolbox_shadow'/> 

                </div> 
                <div 
                    ref={this.setAppContainerRef}
                    className='app_container'
                >
                    {this.generateWindows()}
                </div>                
            </div>
        );
    }

    generateWindows()
    {
        const { strategy, page } = this.state;
        const strategy_info = this.getStrategy(strategy);
        
        let gen_windows = [];
        if (strategy_info !== undefined)
        {
            const page_info = strategy_info.pages[page];
            let k = '';
            for (k in page_info)
            {
                if (k === 'SDE32F')
                {
                    gen_windows.push(
                        <WindowWrapper
                            key={k}
                            strategy_id={strategy_info['strategy_id']}
                            item_id={k}
                            getAppContainer={this.getAppContainer}
                            getWindowElement={this.getWindowElement}
                        />
                    )
                }
            }
        }
        return gen_windows;
    }

    handleSocket()
    {
        const endpoint = "http://127.0.0.1/user"
        const socket = io(endpoint, {
            transportOptions: {
                polling: {
                    extraHeaders: {
                        Authorization: 'TEST_TOKEN'
                    }
                }
            }
        });

        socket.on('connect', () =>
        {
            console.log('connected');
            this.reconnectCharts();
            this.retrieveStrategies(
                Object.keys(this.state.strategies)
            );
        });

        socket.on('disconnect', () =>
        {
            console.log('Disconnected.')
        });

        socket.on('ontick', (data) =>
        {
            this.handleChartUpdate(data);
        });

        socket.on('create_drawings', (data) =>
        {
            this.addDrawings(
                data['strategy_id'],
                data['item_id'],
                data['drawings']
            );
        });

        socket.on('delete_drawings', (data) =>
        {
            this.deleteDrawings(
                data['strategy_id'],
                data['item_id']
            );
        });

        socket.on('ontrade', (data) =>
        {
            if (data.order_type === 'marketentry')
            {
                this.addPositions(
                    data['strategy_id'],
                    data['items']
                );
            }
            else if (data.order_type === 'modify')
            {
                this.updatePositions(
                    data['strategy_id'],
                    data['items']
                );
            }
            else if (
                data.order_type === 'positionclose' ||
                data.order_type === 'stoploss' ||
                data.order_type === 'takeprofit'
            )
            {
                this.deletePositions(
                    data['strategy_id'],
                    data['items']
                );
            }
        });

        return socket;
    }

    async retrieveStrategies(strategy_ids)
    {
        const { username, strategies } = this.state;

        /** Retrieve strategy info */
        const reqOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'username': username
            }
        }

        for (let i = 0; i < strategy_ids.length; i++)
        {
            strategies[strategy_ids[i]] = await fetch(
                'http://127.0.0.1/v1/strategies/' +
                strategy_ids[i] + '/start',
                reqOptions
            )
                .then(res => res.json());
        }
        this.subscribeStrategies(strategy_ids);

        this.setState({ strategies });
    }

    subscribeStrategies(strategies)
    {
        const { sio } = this.state;
        for (let i = 0; i < strategies.length; i++)
        {
            console.log(strategies[i])
            sio.emit(
                'subscribe_ontrade', 
                {'strategy_id': strategies[i]}
            );
        }
    }

    async retrieveChartData(product, period, from, to, page_number)
    {
        if (page_number === undefined) page_number = 0;

        if (from !== undefined)
        {   
            if (to !== undefined)
            {
                const uri = `http://127.0.0.1/v1/backtest/prices/\
                ${product}/${period}\
                ?from=${from.format('YYYY-MM-DDTHH:mm:ss')}Z\
                &to=${to.format('YYYY-MM-DDTHH:mm:ss')}Z\
                &page_number=${page_number}`.replace(/\s/g, '');

                return await fetch(uri)
                    .then(res => res.json());
            }
            else
            {
                const uri = `http://127.0.0.1/v1/backtest/prices/\
                ${product}/${period}\
                ?from=${from.format('YYYY-MM-DDTHH:mm:ss')}Z\
                &count=1000&page_number=${page_number}`.replace(/\s/g, '');

                return await fetch(uri)
                    .then(res => res.json());
            }
        }
        else
        {
            const uri = `http://127.0.0.1/v1/backtest/prices/\
                ${product}/${period}\
                ?count=1000&page_number=${page_number}`.replace(/\s/g, '');
            return await fetch(uri)
                .then(res => res.json());
        }
    }

    async reconnectCharts()
    {
        let { charts } = this.state;

        for (let k in charts)
        {
            let chart = charts[k];
            let last_ts = chart.timestamps[chart.timestamps.length-1];
            let page_number = 0;
            let page_amount = 999;

            let timestamps = [];
            let asks = [];
            let bids = [];

            while (page_number+1 < page_amount)
            {
                let data = await this.retrieveChartData(
                    chart.product, chart.period, 
                    moment(last_ts * 1000), undefined, 
                    page_number
                )
                console.log(data);
                
                timestamps = timestamps.concat(data.ohlc.timestamps);
                asks = asks.concat(data.ohlc.asks);
                bids = bids.concat(data.ohlc.bids);

                page_number += 1;
                page_amount = data.metadata.page_amount;
            }

            // Update timestamps
            chart.timestamps.splice(chart.timestamps.length-1);
            chart.timestamps = chart.timestamps.concat(timestamps);

            // Update asks
            chart.asks.splice(chart.asks.length-1);
            chart.asks = chart.asks.concat(asks);

            // Update bids
            chart.bids.splice(chart.bids.length-1);
            chart.bids = chart.bids.concat(bids);

            // Reconnect chart live data
            this.connectChart(chart.product, chart.period);
        }

        this.setState({ charts });
    }

    addChart = (product, period, ohlc_data) =>
    {
        let { charts } = this.state;

        this.connectChart(product, period);
        
        const key = product + ':' + period;
        charts[key] = {
            product: product,
            period: period,
            timestamps: ohlc_data.ohlc.timestamps,
            asks: ohlc_data.ohlc.asks,
            bids: ohlc_data.ohlc.bids
        };

        this.setState({ charts });
        return charts[key];
    }

    getChart = (product, period) =>
    {
        const { charts } = this.state;
        return charts[product + ':' + period];
    }

    connectChart(product, period)
    {
        const { sio } = this.state;
        sio.emit('subscribe_ontick', {
            'broker': 'ig',
            'product': product,
            'period': period
        });
    }

    handleChartUpdate = (item) =>
    {
        let { charts } = this.state;
        let chart = charts[item['product'] + ':' + item['period']];
        
        if (item['timestamp'] >= chart.timestamps[chart.timestamps.length-1])
        {
            chart.timestamps.push(item['timestamp'] + this.getPeriodOffsetSeconds(item['period']));
        }

        chart.asks[chart.asks.length-1] = item['item']['ask'];
        chart.bids[chart.bids.length-1] = item['item']['bid'];
        if (item['bar_end'])
        {
            chart.asks.push([0,0,0,0]);
            chart.bids.push([0,0,0,0]);
        }

        this.setState({ charts });
    }

    updateChart = (product, period, ohlc_data) =>
    {
        let { charts } = this.state;
        const chart = charts[product + ':' + period];

        const dup = ohlc_data.timestamps.filter((val) =>
        {
            return chart.timestamps.indexOf(val) !== -1;
        });

        chart.timestamps = [
            ...ohlc_data.timestamps.slice(0,ohlc_data.timestamps.length-dup.length),
            ...chart.timestamps
        ];
        chart.bids = [
            ...ohlc_data.bids.slice(0, ohlc_data.bids.length-dup.length), 
            ...chart.bids
        ];
        chart.asks = [
            ...ohlc_data.asks.slice(0, ohlc_data.asks.length-dup.length), 
            ...chart.asks
        ];

        this.setState({ charts });
    }

    calculateIndicator = (chart, price, ind) =>
    {
        /**  Retreive indicator data */
        Indicators[ind.type](chart.timestamps, chart.asks, chart.bids, ind.properties);
    }

    getAppContainer = () =>
    {
        return this.appContainer;
    }

    getCurrentStrategy = () =>
    {
        return this.state.strategy;
    }

    getStrategy = (strategy_id) =>
    {
        const { strategies } = this.state;
        return strategies[strategy_id];
    }

    addStrategyWindow = (strategy_id, window) =>
    {

    }

    updateStrategyWindow = (strategy_id, item_id, window) =>
    {

    }

    addPositions = (strategy_id, positions) =>
    {
        let { strategies } = this.state;
        let strategy = strategies[strategy_id];

        if (strategy !== undefined)
        {
            strategy.positions = strategy.positions.concat(positions);
            this.setState({ strategies });
        }
    }

    updatePositions = (strategy_id, positions) =>
    {
        let { strategies } = this.state;
        let strategy = strategies[strategy_id];

        if (strategy !== undefined)
        {
            for (let i = 0; i < positions.length; i++)
            {
                let new_pos = positions[i];
                for (let j = 0; j < strategy.positions.length; j++)
                {
                    if (strategy.positions[j].order_id === new_pos.order_id)
                    {
                        strategy.positions[j] = new_pos;
                    }
                }
            }
            this.setState({ strategies });
        }
    }

    deletePositions = (strategy_id, positions) =>
    {
        let { strategies } = this.state;
        let strategy = strategies[strategy_id];

        if (strategy !== undefined)
        {
            for (let i = 0; i < positions.length; i++)
            {
                const order_id = positions[i].order_id;
                for (let j = 0; j < strategy.positions.length; j++)
                {
                    if (strategy.positions[j].order_id === order_id)
                        strategy.positions.splice(j);
                }
            }
            this.setState({ strategies });
        }
    }

    addDrawings = (strategy_id, item_id, drawings) =>
    {
        let { strategies } = this.state;
        let item = this.getWindowInfo(strategy_id, item_id);
        item.properties.drawings = item.properties.drawings.concat(drawings);
        this.setState({ strategies });
    }

    deleteDrawings = (strategy_id, item_id, drawings) =>
    {
        let { strategies } = this.state;
        let item = this.getWindowInfo(strategy_id, item_id);
        item.properties.drawings = [];
        this.setState({ strategies });
    }


    getWindowInfo = (strategy_id, item_id) =>
    {
        const strategy = this.getStrategy(strategy_id);

        for (let i = 0; i < strategy.pages.length; i++)
        {
            if (item_id in strategy.pages[i]) return strategy.pages[i][item_id];
        }
        return;
    }

    getWindowElement = (strategy_id, id, getTopOffset, getScreenPos, getKeys) => 
    {
        return (<Chart
            strategy_id={strategy_id}
            item_id={id}
            // Universal Props
            getTopOffset={getTopOffset}
            getScreenPos={getScreenPos}
            getKeys={getKeys}
            getStrategy={this.getStrategy}
            getWindowInfo={this.getWindowInfo}

            // Window Props
            retrieveChartData={this.retrieveChartData}
            addChart={this.addChart}
            getChart={this.getChart}
            updateChart={this.updateChart}
            calculateIndicator={this.calculateIndicator}
            getPeriodOffsetSeconds={this.getPeriodOffsetSeconds}
        />)
    }

    getPeriodOffsetSeconds(period)
    {
        if (period === "M1" || period === 0) 
            return 60;
        else if (period === "M2" || period === 1) 
            return 60 * 2;
        else if (period === "M3" || period === 2) 
            return 60 * 3;
        else if (period === "M5" || period === 3) 
            return 60 * 5;
        else if (period === "M10" || period === 4) 
            return 60 * 10;
        else if (period === "M15" || period === 5) 
            return 60 * 15;
        else if (period === "M30" || period === 6) 
            return 60 * 30;
        else if (period === "H1" || period === 7) 
            return 60 * 60;
        else if (period === "H2" || period === 8) 
            return 60 * 60 * 2;
        else if (period === "H3" || period === 9) 
            return 60 * 60 * 3;
        else if (period === "H4" || period === 10) 
            return 60 * 60 * 4;
        else if (period === "H12" || period === 11) 
            return 60 * 60 * 12;
        else if (period === "D" || period === 12) 
            return 60 * 60 * 24;
        else if (period === "D2" || period === 13) 
            return 60 * 60 * 24 * 2;
        else if (period === "W" || period === 14) 
            return 60 * 60 * 24 * 7;
        else if (period === "W2" || period === 15) 
            return 60 * 60 * 24 * 7 * 2;
        else if (period === "M" || period === 16) 
            return 60 * 60 * 24 * 7 * 4;
        else if (period === "Y1" || period === 17) 
            return 60 * 60 * 24 * 7 * 4 * 12;
        else if (period === "Y2" || period === 18) 
            return 60 * 60 * 24 * 7 * 4 * 12 * 2;
        else if (period === "Y3" || period === 19) 
            return 60 * 60 * 24 * 7 * 4 * 12 * 2;
        else
            return null;
    }
}

export default ChartApp;