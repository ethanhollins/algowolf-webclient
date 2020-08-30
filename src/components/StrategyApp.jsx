import React, { Component } from 'react';
import Indicators from './strategyapp/Indicators';
import io from 'socket.io-client';
import WindowWrapper from './strategyapp/WindowWrapper';
import Chart from './strategyapp/windows/chart/Chart';
import moment from "moment-timezone";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faStopCircle, faCircle, faHandshake, faHandshakeSlash 
} from '@fortawesome/free-solid-svg-icons'

class StrategyApp extends Component
{
    state = {
        sio: null,
        account: {},
        strategies: {},
        page: 0,
        charts: {},
        scale: { x: 100, y: 100 },
        statusMsg: undefined,
        lastTimestamp: 0
    }

    constructor(props)
    {
        super(props);

        this.setAppContainerRef = elem => {
            this.appContainer = elem;
        };
        this.setStatusIndicator = elem => {
            this.statusIndicator = elem;
        }
    }

    async componentDidMount()
    {
        let { sio } = this.state;

        // Connect to API socket
        sio = this.handleSocket();
        this.setState({ sio });
        
        // Retrieve user specific strategy informations
        const account = await this.retrieveGuiInfo();
        await this.retrieveStrategies([account.metadata.current_strategy]);
    }

    render()
    {
        return (
            <div className='main container'>

            <div className='chart_app'>
                <div className='window_tab' onDragStart={this.onDragStart}></div>
                

                <div className='toolbox noselect' onDragStart={this.onDragStart}>
                    {this.generateActivationButtons()}
                </div> 
                <div className='toolbox_shadow'/> 
                <div 
                    ref={this.setAppContainerRef}
                    className='app_container'
                >
                    {this.generateWindows()}
                </div>                
            </div>

            </div>
        );
    }

    onDragStart(e)
    {
        e.preventDefault();
    }

    generateActivationButtons()
    {
        let { account, strategies, statusMsg } = this.state;
        if (account.metadata !== undefined)
        {
            const current_strategy = account.metadata.current_strategy;
            if (strategies[current_strategy] !== undefined)
            {
                const status = this.getStrategyAccountStatus(
                    current_strategy, 
                    Object.keys(strategies[current_strategy].accounts)[0]
                );

                if (status === 'live')
                {   
                    if (statusMsg === undefined) statusMsg = 'Live';
                    let status_class_name = 'live_status';
                    if (statusMsg !== 'Live') status_class_name = 'working_status'
                        
                    return (
                        <React.Fragment>
                            <span className='toolbox-space'/>

                            <div className='toolbox-item' id='orange_btn' onClick={this.goOffline.bind(this)} >
                                <FontAwesomeIcon 
                                    className='toolbox-btn' 
                                    icon={faHandshakeSlash} 
                                    width={Math.round(2.1*(640/512))+'vh'} 
                                    height='2.1vh' 
                                />
                                <span className='toolbox-label'>
                                    Go Offline
                                </span>
                            </div>

                            <span className='toolbox-space'/>
    
                            <div className='toolbox-item' id='red_btn' onClick={this.terminate.bind(this)} >
                                <FontAwesomeIcon 
                                    className='toolbox-item toolbox-btn' 
                                    icon={faStopCircle} 
                                    width={Math.round(2.1*(512/512))+'vh'} 
                                    height='2.1vh' 
                                />
                                <span className='toolbox-label'>
                                    Terminate
                                </span>
                            </div>

                            <span className='toolbox-space'/>

                            <div className='toolbox-item' id={status_class_name} >
                                <FontAwesomeIcon 
                                    className='toolbox-item toolbox-btn' 
                                    icon={faCircle} 
                                    width='0.8vh' 
                                    height='0.8vh' 
                                />
                            </div>
                            <div ref={this.setStatusIndicator} className='toolbox-item' id={status_class_name} >
                                <span className='status-label'>
                                    {statusMsg}
                                </span>
                            </div>
                        </React.Fragment>
                    );
                }
                else if (status === 'offline') 
                {
                    if (statusMsg === undefined) statusMsg = 'Offline';
                    let status_class_name = 'offline_status';
                    if (statusMsg !== 'Offline') status_class_name = 'working_status'

                    return (
                        <React.Fragment>
                            <span className='toolbox-space'/>
                            
                            <div className='toolbox-item' id='blue_btn' onClick={this.goLive.bind(this)}>
                                <FontAwesomeIcon 
                                    className='toolbox-btn'
                                    icon={faHandshake} 
                                    width={Math.round(2.25*(640/512))+'vh'} 
                                    height='2.25vh' 
                                />
                                <span className='toolbox-label'>
                                    Go Live
                                </span>
                            </div>
    
                            <span className='toolbox-space'/>
    
                            <div className='toolbox-item' id='red_btn' onClick={this.terminate.bind(this)} >
                                <FontAwesomeIcon 
                                    className='toolbox-item toolbox-btn' 
                                    icon={faStopCircle} 
                                    width={Math.round(2.1*(512/512))+'vh'} 
                                    height='2.1vh' 
                                />
                                <span className='toolbox-label'>
                                    Terminate
                                </span>
                            </div>

                            <span className='toolbox-space'/>

                            <div className='toolbox-item' id={status_class_name} >
                                <FontAwesomeIcon 
                                    className='toolbox-item toolbox-btn' 
                                    icon={faCircle} 
                                    width='0.8vh' 
                                    height='0.8vh' 
                                />
                            </div>
                            <div ref={this.setStatusIndicator} className='toolbox-item' id={status_class_name} >
                                <span className='status-label'>
                                    {statusMsg}
                                </span>
                            </div>
                        </React.Fragment>
                    );
                }
            }

        }
        return;
    }

    generateWindows()
    {
        const { account, page } = this.state;

        let gen_windows = [];

        if (account.metadata !== undefined)
        {
            const strategy_info = this.getStrategy(account.metadata.current_strategy);
            
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
                                getScale={this.getScale}
                            />
                        )
                    }
                }
            }
        }
        return gen_windows;
    }

    handleSocket()
    {
        const endpoint = `${URI}/user`
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
            let { haltUpdates } = this.state;
            haltUpdates = true;
            this.setState({ haltUpdates });
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

    async retrieveGuiInfo()
    {
        let { account } = this.state;
        const username = this.props.getUsername();

        const reqOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'username': username
            }
        }

        account = await fetch(
            `${URI}/v1/account`,
            reqOptions
        )
            .then(res => res.json());

        this.setState({ account });
        return account;
    }

    async retrieveStrategies(strategy_ids)
    {
        let { strategies } = this.state;
        const username = this.props.getUsername();

        /** Retrieve strategy info */
        const reqOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'username': username
            }
        }

        for (let i = 0; i < strategy_ids.length; i++)
        {
            strategies[strategy_ids[i]] = await fetch(
                `${URI}/v1/strategies/` +
                strategy_ids[i] + '/gui',
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
            sio.emit(
                'subscribe_ontrade', 
                {'strategy_id': strategies[i]}
            );
        }
    }

    async retrieveChartData(product, period, from, to, tz)
    {
        if (tz === undefined) tz = 'UTC';

        if (from !== undefined)
        {   
            if (to !== undefined)
            {
                const uri = `${URI}/v1/backtest/prices/\
                ${product}/${period}\
                ?from=${from.format('YYYY-MM-DDTHH:mm:ss')}Z\
                &to=${to.format('YYYY-MM-DDTHH:mm:ss')}Z\
                &tz=${tz}`.replace(/\s/g, '');
                return await fetch(uri)
                    .then(res => res.json());
            }
            else
            {
                const uri = `${URI}/v1/backtest/prices/\
                ${product}/${period}\
                ?from=${from.format('YYYY-MM-DDTHH:mm:ss')}Z\
                &count=1000&tz=${tz}`.replace(/\s/g, '');

                return await fetch(uri)
                    .then(res => res.json());
            }
        }
        else
        {
            const uri = `${URI}/v1/backtest/prices/\
                ${product}/${period}\
                ?count=1000`.replace(/\s/g, '');
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
            console.log(chart.timestamps.slice(chart.timestamps.length-3, chart.timestamps.length));

            // Reconnect chart live data
            this.connectChart(chart.product, chart.period);

            let last_ts = chart.timestamps[chart.timestamps.length-1] - this.getPeriodOffsetSeconds(chart.period);

            let timestamps = [];
            let asks = [];
            let bids = [];

            while (last_ts < moment().unix() - this.getPeriodOffsetSeconds(chart.period))
            {
                let data = await this.retrieveChartData(
                    chart.product, chart.period, 
                    moment(last_ts * 1000), moment(),
                    'Australia/Melbourne'
                )
                
                for (let i = 0; i < data.ohlc.timestamps.length; i++)
                {
                    const ts = data.ohlc.timestamps[i];
                    if (ts < chart.timestamps[chart.timestamps.length-1])
                    {
                        data.ohlc.timestamps.splice(i, 1);
                        data.ohlc.asks.splice(i, 1);
                        data.ohlc.bids.splice(i, 1);
                    }
                }

                timestamps = timestamps.concat(data.ohlc.timestamps);
                asks = asks.concat(data.ohlc.asks);
                bids = bids.concat(data.ohlc.bids);

                if (timestamps.length > 0)
                    last_ts = timestamps[timestamps.length-1];
            }

            for (let i = 0; i < timestamps.length; i++)
            {
                const idx = chart.timestamps.indexOf(timestamps[i]);
                if (idx !== -1)
                {
                    chart.asks[idx] = asks[i];
                    chart.bids[idx] = bids[i];
                }
                else
                {
                    chart.timestamps.push(timestamps[i]);
                    chart.asks.push(asks[i]);
                    chart.bids.push(bids[i]);
                }
            }

            this.setState({ charts });
        }
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
        let { charts, lastTimestamp } = this.state;
        let chart = charts[item['product'] + ':' + item['period']];

        if (lastTimestamp === 0) 
            lastTimestamp = item['timestamp'] + this.getPeriodOffsetSeconds(item['period']);

        let idx = chart.timestamps.indexOf(item['timestamp'] + this.getPeriodOffsetSeconds(item['period']));
        if (idx === -1)
        {
            // Add new bar
            chart.timestamps.push(item['timestamp'] + this.getPeriodOffsetSeconds(item['period']));
            chart.asks.push([0,0,0,0]);
            chart.bids.push([0,0,0,0]);
            
            if (item['bar_end'])
            {
                idx = chart.timestamps.indexOf(lastTimestamp);
            }
            else
            {
                idx = chart.timestamps.length-1;
            }

            lastTimestamp = item['timestamp'] + this.getPeriodOffsetSeconds(item['period']);
        }

        if (idx !== -1)
        {
            chart.asks[idx] = item['item']['ask'];
            chart.bids[idx] = item['item']['bid'];
        }

        this.setState({ charts, lastTimestamp });
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

    async requestStrategyStatusUpdate(strategy_id, accounts, new_status)
    {
        const username = this.props.getUsername();

        const reqOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'username': username
            }
        }

        let res = await fetch(
            `${URI}/v1/strategies/${strategy_id}/${new_status}?accounts=${accounts.join(',')}`,
            reqOptions
        );

        let { account, strategies, statusMsg } = this.state;

        if (res.status === 200)
        {
            res = await res.json();
            strategies[res.strategy_id].accounts = res.accounts;
            this.setState({ strategies });
        }
        
        statusMsg = Object.values(strategies[account.metadata.current_strategy].accounts)[0];
        if (statusMsg === 'live') 
            statusMsg = 'Live';
        else 
            statusMsg = 'Offline';
        this.setState({ statusMsg });
    }

    getAppContainer = () =>
    {
        return this.appContainer;
    }

    getCurrentStrategy = () =>
    {
        return this.state.account.metadata.current_strategy;
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

    getStrategyAccountStatus = (strategy_id, account_id) =>
    {
        const { strategies } = this.state;
        return strategies[strategy_id].accounts[account_id];
    }

    async goLive()
    {
        let { statusMsg } = this.state;
        statusMsg = 'Going live...';
        this.setState({ statusMsg });

        const { account, strategies } = this.state;
        const strategy_id = account.metadata.current_strategy;
        await this.requestStrategyStatusUpdate(
            strategy_id, 
            Object.keys(strategies[strategy_id].accounts), 
            'live'
        );
    }

    async goOffline()
    {
        let { statusMsg } = this.state;
        statusMsg = 'Going offline...';
        this.setState({ statusMsg });

        const { account, strategies } = this.state;
        const strategy_id = account.metadata.current_strategy;
        await this.requestStrategyStatusUpdate(
            strategy_id, 
            Object.keys(strategies[strategy_id].accounts), 
            'offline'
        );
    }

    async terminate()
    {
        let { statusMsg } = this.state;
        statusMsg = 'Terminating...';
        this.setState({ statusMsg });

        const { account, strategies } = this.state;
        const strategy_id = account.metadata.current_strategy;
        await this.requestStrategyStatusUpdate(
            strategy_id, 
            Object.keys(strategies[strategy_id].accounts), 
            'terminate'
        );
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
            getCountDate={this.getCountDate}
            getCountDateFromDate={this.getCountDateFromDate}
        />)
    }

    getScale = () =>
    {
        return this.state.scale;
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

    getWeekendDates(ts)
    {
        const dow = [...Array(7).keys(),...Array(7).keys()];
        const fri = 5;
        const sun = 0;
        ts *= 1000;
        
        const dt = moment(ts).tz("America/New_York");
        const fri_dist = dow.slice(dt.day()).indexOf(fri);
        const sun_dist = dow.slice(dt.day()).slice(fri_dist).indexOf(sun) + fri_dist;

        const weekend = dt.clone().add(fri_dist, "d");
        const weekstart = dt.clone().add(sun_dist, "d");
        return [
            weekend.hour(17).minute(0).second(0).millisecond(0),
            weekstart.hour(17).minute(0).second(0).millisecond(0),
        ];
    }

    isWeekend = (ts) =>
    {
        const weekend_dates = this.getWeekendDates(ts);
        return ts >= weekend_dates[0].unix() && ts < weekend_dates[1].unix();
    }

    getCountDate = (period, count) =>
    {
        const off = this.getPeriodOffsetSeconds(period);
        const direction = -1

        let ts = moment().unix();
        let i = 0;
        let x = 0;
        while (x < count)
        {
            if (!this.isWeekend(ts + off * i * direction))
            {
                x += 1;
            }
            i += 1
        }
        return moment((ts + off * i * direction) * 1000);
    }

    getCountDateFromDate = (period, count, date, direction) =>
    {
        const off = this.getPeriodOffsetSeconds(period);

        let ts = date.unix();
        let i = 0;
        let x = 0;
        while (x < count)
        {
            if (!this.isWeekend(ts + off * i * direction))
            {
                x += 1;
            }
            i += 1
        }
        return moment((ts + off * i * direction) * 1000);
    }
}

const URI = 'http://127.0.0.1:3000';

export default StrategyApp;