import React, { Component } from 'react';
import Indicators from './chartapp/Indicators';
import io from 'socket.io-client';
import WindowWrapper from './chartapp/WindowWrapper';
import Chart from './chartapp/windows/chart/Chart';

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
        let { sio, strategies, strategy } = this.state;

        // Connect to API socket
        sio = this.handleSocket();
        this.setState({ sio });
        
        // Retrieve user specific strategy informations
        strategies[strategy] = await this.retrieveStrategy(strategy);
        this.setState({ strategies });

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
        const endpoint = "http://localhost/user"
        const socket = io(endpoint, {
            query: {
                token: 'TEST_TOKEN'
            }
        });

        socket.on('connect', () =>
        {
            socket.emit('subscribe', {'room': 'ethanhollins'});
        });

        socket.on('disconnect', () =>
        {
            console.log('Disconnected.')
        });

        socket.on('subscribed', () =>
        {
            console.log('subscribed');
        })

        socket.on('chart_update', (data) =>
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

        socket.on('create_positions', (data) =>
        {
            this.addPositions(
                data['strategy_id'],
                data['data']
            );
        });

        socket.on('update_positions', (data) =>
        {
            this.updatePositions(
                data['strategy_id'],
                data['data']
            );
        });

        socket.on('delete_positions', (data) =>
        {
            this.deletePositions(
                data['strategy_id'],
                data['data']
            );
        });

        return socket;
    }

    async retrieveStrategy(strategy)
    {
        const { username } = this.state;

        /** Retrieve strategy info */
        const reqOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'username': username
            }
        }

        const strategies = await fetch(
            'http://localhost/v1/strategies/' +
            strategy + '/start',
            reqOptions
        )
            .then(res => res.json());
        
        return strategies;
    }

    async retrieveChartData(product, period, from, to, page_number)
    {
        if (page_number === undefined) page_number = 0;

        if (from !== undefined)
        {   
            if (to !== undefined)
            {
                const uri = `http://localhost/v1/backtest/prices/\
                ${product}/${period}\
                ?from=${from.format('YYYY-MM-DDTHH:mm:ss')}Z\
                &to=${to.format('YYYY-MM-DDTHH:mm:ss')}Z\
                &page_number=${page_number}`.replace(/\s/g, '');

                return await fetch(uri)
                    .then(res => res.json());
            }
            else
            {
                const uri = `http://localhost/v1/backtest/prices/\
                ${product}/${period}\
                ?from=${from.format('YYYY-MM-DDTHH:mm:ss')}Z\
                &count=1000&page_number=${page_number}`.replace(/\s/g, '');

                return await fetch(uri)
                    .then(res => res.json());
            }
        }
        else
        {
            const uri = `http://localhost/v1/backtest/prices/\
                ${product}/${period}\
                ?count=1000&page_number=${page_number}`.replace(/\s/g, '');
            return await fetch(uri)
                .then(res => res.json());
        }
    }

    connectCharts(strategy_id)
    {
        
    }

    addChart = (product, period, ohlc_data) =>
    {
        let { sio, charts } = this.state;

        sio.emit('connect_chart', {
            'broker': 'ig',
            'product': product,
            'period': period
        });

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

    handleChartUpdate = (item) =>
    {
        let { charts } = this.state;
        let chart = charts[item['product'] + ':' + item['period']];
        
        chart.bids[chart.bids.length-1] = item['item']['bid'];
        chart.asks[chart.asks.length-1] = item['item']['ask'];
        if (item['bar_end'])
        {
            chart.bids.push([0,0,0,0]);
            chart.asks.push([0,0,0,0]);
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

    getIndicator = (chart, price, ind) =>
    {
        /**  Retreive indicator data */
        return Indicators[ind.type](chart[price], ind.properties);
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

    deletePositions = (strategy_id, order_ids) =>
    {
        let { strategies } = this.state;
        let strategy = strategies[strategy_id];

        if (strategy !== undefined)
        {
            for (let i = 0; i < order_ids.length; i++)
            {
                const order_id = order_ids[i];
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
            getIndicator={this.getIndicator}
        />)
    }
}

export default ChartApp;