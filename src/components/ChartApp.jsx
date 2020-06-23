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
        strategies: [],
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
        let { sio, strategies } = this.state;

        // Connect to API socket
        sio = this.handleSocket();
        this.setState({ sio });
        
        // Retrieve user specific strategy informations
        strategies = await this.retrieveStrategies();
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

        socket.on('chart', (data) =>
        {

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

        socket.on('create_position', (data) =>
        {
            
        });

        socket.on('update_position', (data) =>
        {
            
        });

        socket.on('delete_position', (data) =>
        {
            
        });

        return socket;
    }

    async retrieveStrategies()
    {
        const { username } = this.state;

        /** Retrieve strategy info */
        const strategies = await fetch(
            'http://localhost/v1/account/' +
            username + '/strategies'
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
        let { charts } = this.state;

        // Retrieve OHLC data
        // const ohlc_data = await this.retrieveChartData(product, period);

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

    addPosition = () =>
    {

    }

    getPosition = () =>
    {

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
        for (let i = 0; i < strategies.length; i++)
        {
            if (strategies[i]['strategy_id'] === strategy_id)
            {
                return strategies[i];

            }
        }
        return undefined;
    }

    addStrategyWindow = (strategy_id, window) =>
    {

    }

    updateStrategyWindow = (strategy_id, item_id, window) =>
    {

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