import React, { Component } from 'react';
import Camera from './strategyapp/Camera';
import Indicator from './strategyapp/Indicator';
import io from 'socket.io-client';
import moment from "moment-timezone";
import _ from 'underscore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus } from '@fortawesome/pro-light-svg-icons';
import Strategy from './strategyapp/Strategy';
import StrategyToolbar from './strategyapp/StrategyToolbar';
import Backtest from './strategyapp/Backtest';
import BacktestToolbar from './strategyapp/BacktestToolbar';
import Popup from './strategyapp/Popup';
import { v4 as uuidv4 } from 'uuid';

class StrategyApp extends Component
{
    state = {
        checkLogin: false,
        sio: null,
        keys: [],
        account: {},
        strategyInfo: {},
        positions: [],
        orders: [],
        page: 0,
        charts: {},
        backtestCharts: {},
        indicators: [],
        size: {
            width: 0, height: 0
        },
        scale: { x: 100, y: 100 },
        mouse_pos: { x: 0, y: 0 },
        popup: null,
        hovered: {},
        toSave: [],
        history: [],
        undone: [],
        lastChange: null
    }

    constructor(props)
    {
        super(props);

        this.update = this.update.bind(this);
        this.onMouseMoveThrottled = _.throttle(this.onMouseMoveThrottled.bind(this), 20);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        
        this.updateInfo = this.updateInfo.bind(this);
        this.connectChart = this.connectChart.bind(this);
        this.retrieveStrategies = this.retrieveStrategies.bind(this);
        this.retrieveTransactions = this.retrieveTransactions.bind(this);
        this.retrieveChartData = this.retrieveChartData.bind(this);
        this.updateInputVariables = this.updateInputVariables.bind(this);

        this.setAppContainerRef = elem => {
            this.appContainer = elem;
        };
        this.setCameraRef = elem =>
        {
            this.camera = elem;
        }
        this.setStrategy = elem => {
            this.strategy = elem;
        }
        this.setToolbarRef = elem => {
            this.toolbar = elem;
        }

        this.is_loaded = false;

    }

    async componentDidMount()
    {
        this.updateWindowDimensions();
        window.addEventListener("mousemove", this.onMouseMoveThrottled)
        window.addEventListener("mouseup", this.onMouseUp);
        window.addEventListener("resize", this.update);
        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this.onKeyUp);

        let { checkLogin } = this.state;
        const user_id = await this.props.checkAuthorization();
        checkLogin = true;
        this.setState({ checkLogin });

        if (user_id !== null)
        {
            let { sio } = this.state;
    
            // Connect to API socket
            sio = this.handleSocket();
            this.setState({ sio });
            
            // Retrieve user specific strategy informations
            const account = await this.retrieveGuiInfo();
            await this.retrieveStrategies(account.metadata.open_strategies);
        }

        this.is_loaded = true;
    }

    componentWillUnmount()
    {
        window.removeEventListener("mousemove", this.onMouseMoveThrottled);
        window.removeEventListener("mouseup", this.onMouseUp);
        window.removeEventListener("resize", this.update);
        window.removeEventListener("keydown", this.onKeyDown);
        window.removeEventListener("keyup", this.onKeyUp);

        this.is_loaded = false;
    }

    render()
    {
        const { checkLogin } = this.state;
        if (checkLogin && this.props.getUserId() !== null)
        {
            return (
                <div className='main container'>
    
                <div className='chart_app'>
                    <div 
                        ref={this.setAppContainerRef}
                        className='app container'
                    >
                        <Camera
                            ref={this.setCameraRef}
                        />
                        {this.generateStrategy()}
                    </div>  

                    <div className='tab body' onDragStart={this.onDragStart}>
                        <div>
                            {this.generateStrategyTabs()}
                            <div className='tab item add'>
                                <FontAwesomeIcon className='tab btn' icon={faPlus} />
                            </div>
                        </div>
                    </div>
                    
                    {this.generateToolbar()}
                    <div className='toolbox_shadow'/> 

                    <Popup
                        addWindow={this.addWindow}
                        windowExists={this.windowExists}
                        isWithinBounds={this.isWithinBounds}
                        isTopWindow={this.isTopWindow}
                        getWindowInfo={this.getWindowInfo}
                        getPopup={this.getPopup}
                        getPopupElem={this.getPopupElem}
                        setPopup={this.setPopup}
                        setPopupOpened={this.setPopupOpened}
                        getSize={this.getSize}
                        getStrategyId={this.getStrategyId}
                        getStrategyInfo={this.getStrategyInfo}
                        updateStrategyInfo={this.updateStrategyInfo}
                        setHovered={this.setHovered}
                    />
                    
                </div>
    
                </div>
            );
        }
        else
        {
            return <React.Fragment />;
        }
        
    }

    updateWindowDimensions()
    {
        let { size } = this.state;
        size.width = window.innerWidth;
        size.height = window.innerHeight;
        this.setState({ size });
    }

    onDragStart(e)
    {
        e.preventDefault();
    }

    generateStrategyTabs = () =>
    {
        const { account, strategyInfo } = this.state;
        let tabs = [];
        if (Object.keys(strategyInfo).length > 0)
        {
            let i = '';
            for (i in strategyInfo)
            {
                const s = strategyInfo[i];
                let className = 'tab item';
                if (account.metadata.current_strategy === i)
                {
                    className += ' selected'
                }
                tabs.push(
                    <div key={i} className={className} name={i} onClick={this.setOpenStrategy.bind(this)}>
                        {s.name}
                        <FontAwesomeIcon className='tab btn' icon={faTimes} />
                    </div>
                );      
            }
        }

        return tabs;
    }

    generateStrategy()
    {
        let { account, strategyInfo } = this.state;

        if ('metadata' in account)
        {
            const current_strategy = account.metadata.current_strategy;
            if (!(current_strategy in strategyInfo))
            {
                return <React.Fragment />;
            }
            else if (account.metadata.open_strategies.includes(current_strategy))
            {
                if (current_strategy.includes('/backtest/'))
                {
                    return <Backtest
                        key={current_strategy}
                        id={current_strategy}
                        ref={this.setStrategy}
                        clone={this.clone}
                        getAppContainer={this.getAppContainer}
                        convertScreenUnitToWorldUnit={this.convertScreenUnitToWorldUnit}
                        convertWorldUnitToScreenUnit={this.convertWorldUnitToScreenUnit}
                        getMousePos={this.getMousePos}
                        getSize={this.getSize}
                        getScale={this.getScale}
                        getStrategyInfo={this.getStrategyInfo}
                        updateStrategyInfo={this.updateStrategyInfo}
                        updateInfo={this.updateInfo}
                        getChartElement={this.getChartElement}
                        getCamera={this.getCamera}
                        getSio={this.getSio}
                        getKeys={this.getKeys}
                        setPopup={this.setPopup}
                        // Window Funcs
                        closeWindow={this.closeWindow}
                        windowExists={this.windowExists}
                        getWindowById={this.getWindowById}
                        isTopWindow={this.isTopWindow}
                        getTopWindow={this.getTopWindow}
                        setTopWindow={this.setTopWindow}
                        // History Functions
                        addHistory={this.addHistory}
                        getHistory={this.getHistory}
                        getLastHistoryAction={this.getLastHistoryAction}
                        deleteHistory={this.deleteHistory}
                        // Chart Functions
                        retrieveTransactions={this.retrieveTransactions}
                        retrieveChartData={this.retrieveChartData}
                        addChart={this.addBacktestChart}
                        getChart={this.getBacktestChart}
                        updateChart={this.updateBacktestChart}
                        getIndicator={this.getBacktestIndicator}
                        calculateIndicator={this.calculateBacktestIndicator}
                        resetIndicators={this.resetIndicators}
                        getPeriodOffsetSeconds={this.getPeriodOffsetSeconds}
                        getCountDate={this.getCountDate}
                        getCountDateFromDate={this.getCountDateFromDate}
                    />
                }
                else
                {
                    return <Strategy
                        key={current_strategy}
                        id={current_strategy}
                        ref={this.setStrategy}
                        clone={this.clone}
                        getURI={this.props.getURI}
                        getCookies={this.props.getCookies}
                        getHeaders={this.props.getHeaders}
                        getAppContainer={this.getAppContainer}
                        convertScreenUnitToWorldUnit={this.convertScreenUnitToWorldUnit}
                        convertWorldUnitToScreenUnit={this.convertWorldUnitToScreenUnit}
                        getMousePos={this.getMousePos}
                        getSize={this.getSize}
                        getScale={this.getScale}
                        retrieveStrategies={this.retrieveStrategies}
                        getStrategyInfo={this.getStrategyInfo}
                        updateStrategyInfo={this.updateStrategyInfo}
                        updateInfo={this.updateInfo}
                        updateInputVariables={this.updateInputVariables}
                        getCurrentAccount={this.getCurrentAccount}
                        getChartElement={this.getChartElement}
                        getCamera={this.getCamera}
                        getSio={this.getSio}
                        getKeys={this.getKeys}
                        setPopup={this.setPopup}
                        // Window Funcs
                        closeWindow={this.closeWindow}
                        windowExists={this.windowExists}
                        getWindowById={this.getWindowById}
                        isTopWindow={this.isTopWindow}
                        getTopWindow={this.getTopWindow}
                        setTopWindow={this.setTopWindow}
                        // History Functions
                        addHistory={this.addHistory}
                        getHistory={this.getHistory}
                        getLastHistoryAction={this.getLastHistoryAction}
                        deleteHistory={this.deleteHistory}
                        // Chart Functions
                        connectChart={this.connectChart}
                        retrieveChartData={this.retrieveChartData}
                        addChart={this.addChart}
                        getChart={this.getChart}
                        updateChart={this.updateChart}
                        findIndicator={this.findIndicator}
                        createIndicator={this.createIndicator}
                        calculateIndicator={this.calculateIndicator}
                        resetIndicators={this.resetIndicators}
                        getPeriodOffsetSeconds={this.getPeriodOffsetSeconds}
                        getCountDate={this.getCountDate}
                        getCountDateFromDate={this.getCountDateFromDate}
                    />
                }
            }
            else if (account.metadata.open_strategies.length > 0)
            {
                account.metadata.current_strategy = account.metadata.open_strategies[0];
                // TODO: Update API
                return this.generateStrategy();
            }
        }
        
        return <React.Fragment />;
    }

    generateToolbar() 
    {
        const current_strategy = this.getCurrentStrategy();

        if (current_strategy !== undefined)
        {
            if (current_strategy.includes('/backtest/'))
            {
                return <BacktestToolbar 
                    ref={this.setToolbarRef}
                    getCurrentStrategy={this.getCurrentStrategy}
                    updateStrategyInfo={this.updateStrategyInfo}
                    getStrategyInfo={this.getStrategyInfo}
                    isWithinBounds={this.isWithinBounds}
                    setPopup={this.setPopup}
                />
            }
            else
            {
                return <StrategyToolbar 
                    ref={this.setToolbarRef}
                    getCurrentStrategy={this.getCurrentStrategy}
                    updateStrategyInfo={this.updateStrategyInfo}
                    getStrategyInfo={this.getStrategyInfo}
                    startScript={this.startScript.bind(this)}
                    stopScript={this.stopScript.bind(this)}
                    isWithinBounds={this.isWithinBounds}
                    setPopup={this.setPopup}
                />
            }
        }
        
        return <React.Fragment />;
    }

    isWithinBounds(rect, mouse_pos)
    {
        if (
            mouse_pos.x > rect.x &&
            mouse_pos.x < rect.x + rect.width &&
            mouse_pos.y > rect.y &&
            mouse_pos.y < rect.y + rect.height
        )
        {
            return true;
        }
        return false;
    }

    getTopWindow = (strategy_id, mouse_pos) =>
    {
        // Check hovered
        const { hovered } = this.state;
        for (let k in hovered)
        {
            if (hovered[k]) return k;
        }

        // Check windows
        const windows = this.getStrategyWindows(strategy_id);
        windows.sort((a, b) => parseFloat(b.zIndex) - parseFloat(a.zIndex));
        for (let i of windows)
        {
            const pos = this.convertWorldUnitToScreenUnit(i.pos);
            const size = this.convertWorldUnitToScreenUnit({
                x: i.size.width, y: i.size.height
            });
            const rect = {
                x: pos.x, y: pos.y,
                width: size.x, height: size.y
            }
            const maximised = i.maximised;
            if (maximised || this.isWithinBounds(rect, mouse_pos))
            {
                return i.id;
            }
        }
        return null;
    }

    isTopWindow = (strategy_id, item_id, mouse_pos) =>
    {
        return this.getTopWindow(strategy_id, mouse_pos) === item_id;
    }

    setTopWindow = (strategy_id, item_id) => 
    {
        let { strategyInfo } = this.state;
        let windows = strategyInfo[strategy_id].windows;
        windows.sort((a, b) => parseFloat(b.zIndex) - parseFloat(a.zIndex));
        let c_idx = windows.length-1;

        if (windows[0].id !== item_id)
        {
            for (let i = 0; i < windows.length; i++)
            {
                let w = windows[i];
                if (w.id === item_id)
                {
                    w.zIndex = windows.length;
                }
                else
                {
                    w.zIndex = c_idx;
                    c_idx--;
                }
            }
            // Add to history
            this.addToSave(strategy_id, this.getStrategyWindowIds(strategy_id));
    
            this.setState({ strategyInfo });
        }
    }

    onMouseMoveThrottled(e)
    {
        let { mouse_pos } = this.state;
        
        let update_pos = false;
        if (Math.abs(mouse_pos.x - e.clientX) >= 1 || 
            Math.abs(mouse_pos.y - e.clientY) >= 1)
        {
            update_pos = true;
            mouse_pos = { x: e.clientX, y: e.clientY };
        }

        const keys = this.getKeys();

        if (!keys.includes(SPACEBAR) && this.is_loaded && update_pos)
        {
            for (let w of this.strategy.windows)
            {
                // if (w.getInnerElement().onMouseMoveThrottled !== undefined)
                // {
                //     w.getInnerElement().onMouseMoveThrottled(mouse_pos);
                // }
            }
            this.setState({ mouse_pos });
        }
    }

    updateInfo(mouse_pos)
    {
        if (this.is_loaded && this.strategy !== null)
        {
            for (let w of this.strategy.windows)
            {
                if (w.getInnerElement().updateInfo !== undefined)
                {
                    w.getInnerElement().updateInfo(mouse_pos);
                }
            }
        }
    }

    onMouseUp(e)
    {
        const mouse_pos = {
            x: e.clientX, y: e.clientY
        }
        if (this.is_loaded)
            this.toolbar.closeTemporaryWindows(mouse_pos);
    }

    onKeyDown(e)
    {
        let { keys } = this.state;

        if (!keys.includes(e.keyCode))
        {
            keys.push(e.keyCode);
            this.setState({ keys });
            if (this.strategy !== undefined)
                this.strategy.handleKeys();
        }

    }

    onKeyUp(e)
    {
        let { keys } = this.state;

        if (keys.includes(e.keyCode)) 
        {
            keys.splice(keys.indexOf(e.keyCode));
            this.setState({ keys });
        }
    }

    update()
    {
        this.updateWindowDimensions();
    }


    handleSocket()
    {
        const { REACT_APP_STREAM_URL } = process.env;
        const endpoint = `${REACT_APP_STREAM_URL}/user`
        const socket = io(endpoint, {
            transportOptions: {
                polling: {
                    extraHeaders: {
                        Authorization: `Bearer ${this.props.getCookies().get('Authorization')}`
                    }
                }
            }
        });

        socket.on('connect', () =>
        {
            console.log('connected');
            this.reconnectCharts();
            this.retrieveStrategies(
                Object.keys(this.state.strategyInfo)
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

        return socket;
    }

    async retrieveGuiInfo()
    {
        const { REACT_APP_API_URL } = process.env;
        let { account } = this.state;

        const reqOptions = {
            method: 'GET',
            headers: this.props.getHeaders(),
            credentials: 'include'
        }

        account = await fetch(
            `${REACT_APP_API_URL}/v1/account`,
            reqOptions
        )
            .then(res => res.json());

        this.setState({ account });
        return account;
    }

    async retrieveStrategies(strategy_ids)
    {
        const { REACT_APP_API_URL } = process.env;
        let { strategyInfo } = this.state;

        /** Retrieve strategy info */
        const reqOptions = {
            method: 'GET',
            headers: this.props.getHeaders(),
            credentials: 'include'
        }

        for (let i = 0; i < strategy_ids.length; i++)
        {
            strategyInfo[strategy_ids[i]] = Object.assign(
                {}, strategyInfo[strategy_ids[i]],
                await fetch(
                    `${REACT_APP_API_URL}/v1/strategy/${strategy_ids[i]}`,
                    reqOptions
                ).then(res => res.json())
            );

        }

        this.setState({ strategyInfo });
    }

    async retrieveTransactions(strategy_id)
    {
        const { REACT_APP_API_URL } = process.env;
        /** Retrieve strategy info */
        const reqOptions = {
            method: 'GET',
            headers: this.props.getHeaders(),
            credentials: 'include'
        }

        return await fetch(
            `${REACT_APP_API_URL}/v1/strategy/${strategy_id}/transactions`,
            reqOptions
        ).then(res => res.json());  
    }

    async updatePositions(broker_id)
    {

    }

    async updateOrders(broker_id)
    {

    }

    async updateInputVariables(strategy_id, input_variables)
    {
        const { REACT_APP_API_URL } = process.env;
        /** Retrieve strategy info */
        const reqOptions = {
            method: 'POST',
            headers: this.props.getHeaders(),
            credentials: 'include',
            body: JSON.stringify({'input_variables': input_variables})
        }

        let res = await fetch(
            `${REACT_APP_API_URL}/v1/strategy/${strategy_id}/variables`,
            reqOptions
        ).then(res => res.json());

        let strategy = this.getStrategyInfo(strategy_id);
        strategy.input_variables = res.input_variables;
        this.updateStrategyInfo();
    }

    async retrieveChartData(broker, product, period, from, to, tz)
    {
        const { REACT_APP_API_URL } = process.env;
        const reqOptions = {
            method: 'GET',
            headers: this.props.getHeaders(),
            credentials: 'include'
        }

        if (tz === undefined) tz = 'UTC';

        if (from !== undefined)
        {   
            if (to !== undefined)
            {
                const uri = `${REACT_APP_API_URL}/v1/prices/${broker}/\
                ${product}/${period}\
                ?from=${from.format('YYYY-MM-DDTHH:mm:ss')}Z\
                &to=${to.format('YYYY-MM-DDTHH:mm:ss')}Z\
                &tz=${tz}`.replace(/\s/g, '');
                return await fetch(uri, reqOptions)
                    .then(res => res.text())
                    .then(res => {
                        res = res.replace(/\bNaN\b/g, null);
                        return JSON.parse(res);
                    });
            }
            else
            {
                const uri = `${REACT_APP_API_URL}/v1/prices/${broker}/\
                ${product}/${period}\
                ?from=${from.format('YYYY-MM-DDTHH:mm:ss')}Z\
                &count=1000&tz=${tz}`.replace(/\s/g, '');

                return await fetch(uri, reqOptions)
                    .then(res => res = res.text())
                    .then(res => {
                        res = res.replace(/\bNaN\b/g, null);
                        return JSON.parse(res);
                    });
            }
        }
        else
        {
            const uri = `${REACT_APP_API_URL}/v1/prices/${broker}/\
                ${product}/${period}\
                ?count=1000`.replace(/\s/g, '');
            return await fetch(uri, reqOptions)
                .then(res => res = res.text())
                .then(res => {
                    res = res.replace(/\bNaN\b/g, null);
                    return JSON.parse(res);
                });
        }
    }

    async reconnectCharts()
    {
        let { charts } = this.state;

        for (let k in charts)
        {
            let chart = charts[k];

            // Reconnect chart live data
            this.connectChart(chart.broker, chart.product, chart.period);

            let last_ts = chart.timestamps[chart.timestamps.length-1] - this.getPeriodOffsetSeconds(chart.period);

            let timestamps = [];
            let asks = [];
            let bids = [];

            while (last_ts < moment().unix() - this.getPeriodOffsetSeconds(chart.period))
            {
                let data = await this.retrieveChartData(
                    chart.broker, chart.product, chart.period, 
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

    addChart = (broker, product, period, ohlc_data) =>
    {
        let { charts } = this.state;

        // this.connectChart(broker, product, period);

        const key = product + ':' + period;
        charts[key] = {
            broker: broker,
            product: product,
            period: period,
            timestamps: ohlc_data.ohlc.timestamps,
            asks: ohlc_data.ohlc.asks,
            bids: ohlc_data.ohlc.bids,
            next_timestamp: null,
            queue: []
        };

        this.generateMissingBars(charts[key]);

        this.setState({ charts });
        return charts[key];
    }

    addBacktestChart = (backtest_id, broker, product, period, ohlc_data) =>
    {
        let { backtestCharts } = this.state;
        if (!(backtest_id in backtestCharts))
        {
            backtestCharts[backtest_id] = {}
        }

        const key = product + ':' + period;
        backtestCharts[backtest_id][key] = {
            broker: broker,
            product: product,
            period: period,
            timestamps: ohlc_data.ohlc.timestamps,
            asks: ohlc_data.ohlc.asks,
            bids: ohlc_data.ohlc.bids,
            next_timestamp: null
        };

        this.generateMissingBars(backtestCharts[backtest_id][key]);

        this.setState({ backtestCharts });
        return backtestCharts[backtest_id][key];
    }

    getChart = (product, period) =>
    {
        const { charts } = this.state;
        return charts[product + ':' + period];
    }

    getBacktestChart = (backtest_id, product, period) =>
    {
        let { backtestCharts } = this.state;
        if (!(backtest_id in backtestCharts))
        {
            backtestCharts[backtest_id] = {}
        }
        return backtestCharts[backtest_id][product + ':' + period];
    }

    connectChart(broker, product, period)
    {
        const { sio } = this.state;
        sio.emit('subscribe', {
            broker_id: this.getCurrentStrategy(),
            field: 'ontick',
            items: {
                [product]: [period]
            }
        });
    }

    generateMissingBars(chart)
    {
        const off = this.getPeriodOffsetSeconds(chart.period);
        let ts = chart.timestamps[0];
        let c_weekend = this.getWeekendDates(ts);
        let result = {
            timestamps: [],
            asks: [],
            bids: []
        };
        for (let i = 0; i < chart.timestamps.length; i++)
        {
            const next_ts = chart.timestamps[i];
            const ask = chart.asks[i];
            const bid = chart.bids[i];
            
            while (ts <= next_ts)
            {
                if (ts >= c_weekend[0].unix())
                {
                    ts = c_weekend[1].unix();
                    c_weekend = this.getWeekendDates(ts);
                }

                result.timestamps.push(ts);

                if (ts !== next_ts)
                {
                    result.asks.push([null, null, null, null]);
                    result.bids.push([null, null, null, null]);
                }
                else
                {
                    result.asks.push(ask);
                    result.bids.push(bid);
                }
                ts += off;
            }
        }
        chart.timestamps = result.timestamps;
        chart.asks = result.asks;
        chart.bids = result.bids;
        return chart;
    }

    generateNextTimestamp(chart, now)
    {
        const off = this.getPeriodOffsetSeconds(chart.period);
        const last_ts = chart.timestamps[chart.timestamps.length-1];

        let ts;
        if (last_ts > now)
        {
            ts = last_ts;
        }
        else
        {
            ts = last_ts + off;
        }

        let c_weekend = this.getWeekendDates(ts);
        if (ts >= c_weekend[0].unix())
        {
            ts = c_weekend[1].unix();
            c_weekend = this.getWeekendDates(ts);
        }
        
        while (ts <= now)
        {
            chart.timestamps.push(ts);
            chart.asks.push([null,null,null,null]);
            chart.bids.push([null,null,null,null]);

            ts += off
            if (ts >= c_weekend[0].unix())
            {
                ts = c_weekend[1].unix();
                c_weekend = this.getWeekendDates(ts);
            }
        }
        // Set Next Timestamp
        chart.next_timestamp = ts;
    }

    handleChartUpdate = (item) =>
    {
        let { charts } = this.state;
        let chart = charts[item['product'] + ':' + item['period']];

        if (chart !== undefined)
        {
            const id = uuidv4();
            chart.queue.push(id);
            while(chart.queue.indexOf(id) !== 0);

            if (chart.next_timestamp === null)
            {
                if (!item['bar_end'])
                {
                    this.generateNextTimestamp(
                        chart, 
                        item['timestamp'] - this.getPeriodOffsetSeconds(item['period'])
                    );
                }
            }
            
            if (item['bar_end'])
            {
                // On Bar End
                chart.asks[chart.asks.length-1] = item['item']['ask'];
                chart.bids[chart.bids.length-1] = item['item']['bid'];
                this.generateNextTimestamp(chart, item['timestamp']);
                chart.timestamps.push(chart.next_timestamp);
                chart.asks.push([null,null,null,null]);
                chart.bids.push([null,null,null,null]);
            }
            else if (item['timestamp'] >= chart.next_timestamp)
            {
                // If real timestamp ahead of chart timestamp
                this.generateNextTimestamp(chart, item['timestamp']);
                chart.asks[chart.asks.length-1] = item['item']['ask'];
                chart.bids[chart.bids.length-1] = item['item']['bid'];
            }
            else
            {
                // Update Latest Bar
                chart.asks[chart.asks.length-1] = item['item']['ask'];
                chart.bids[chart.bids.length-1] = item['item']['bid'];
            }
    
            this.calculateAllChartIndicators(chart);

            this.setState({ charts });

            chart.queue.splice(0, 1);
        }
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

        this.generateMissingBars(chart);
        this.filterChart(chart, true);

        this.calculateAllChartIndicators(chart);

        this.setState({ charts });
    }

    updateBacktestChart = (backtest_id, product, period, ohlc_data) =>
    {
        let { backtestCharts } = this.state;
        const chart = backtestCharts[backtest_id][product + ':' + period];

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

        this.generateMissingBars(chart);
        this.filterChart(chart, true);

        this.setState({ backtestCharts });
    }

    filterChart = (chart, reset) =>
    {
        let i = chart.timestamps.length-1;
        let ts = chart.timestamps[i];
        let filteredTimestamps = [];
        let filteredAsks = [];
        let filteredBids = [];
        let until;

        if (reset || chart.filteredTimestamps === undefined)
        {
            until = 0;

            chart.filteredTimestamps = [];
            chart.filteredAsks = [];
            chart.filteredBids = [];
        }
        else
        {
            until = chart.filteredTimestamps[chart.filteredTimestamps.length-1];
        }

        while (ts > until && i >= 0)
        {
            if (chart.asks[i][0] !== null && chart.bids[i][0] !== null)
            {
                filteredTimestamps.unshift(ts)
                filteredAsks.unshift(chart.asks[i])
                filteredBids.unshift(chart.bids[i])
            }
            i--;
            ts = chart.timestamps[i];
        }
        chart.filteredTimestamps = chart.filteredTimestamps.concat(filteredTimestamps);
        chart.filteredAsks = chart.filteredAsks.concat(filteredAsks);
        chart.filteredBids = chart.filteredBids.concat(filteredBids);

        if (chart.asks[chart.asks.length-1][0] !== null && chart.bids[chart.bids.length-1][0] !== null)
        {
            chart.filteredAsks[chart.filteredAsks.length-1] = chart.asks[chart.asks.length-1];
            chart.filteredBids[chart.filteredBids.length-1] = chart.bids[chart.bids.length-1];
        }

        return chart;
    }

    findIndicator = (type, broker, product, period) =>
    {
        const { indicators } = this.state;
        for (let ind of indicators)
        {
            if (
                ind.type === type && 
                ind.broker === broker &&
                ind.product === product && 
                ind.period === period
            )
            {
                return ind;
            }
        }
        return undefined;
    }

    createIndicator = (type, broker, product, properties) =>
    {
        let { indicators } = this.state;
        const ind = new Indicator[type](broker, product, properties);
        indicators.push(ind);
        this.setState({ indicators });
        return ind;
    }

    calculateAllChartIndicators = (chart) =>
    {
        chart = this.filterChart(chart, false);

        const { indicators } = this.state;
        for (let ind of indicators)
        {
            if (ind.product === chart.product)
            {
                ind.calc(
                    [...chart.filteredTimestamps], 
                    [...chart.filteredAsks], 
                    [...chart.filteredBids]
                );
            }
        }
    }

    calculateIndicator = (ind, chart) =>
    {
        chart = this.filterChart(chart, false);
        /**  Retreive indicator data */
        ind.calc(
            [...chart.filteredTimestamps], 
            [...chart.filteredAsks], 
            [...chart.filteredBids]
        );
    }

    resetIndicators = (chart) =>
    {
        const { indicators } = this.state;
        for (let ind of indicators)
        {
            if (ind.product === chart.product)
            {
                ind.reset();
            }
        }
    }

    // getBacktestIndicator = (type, price, backtest_id, product, period) =>
    // {
    //     return Indicator[type][price][backtest_id + '/' + product][period];
    // }


    // calculateBacktestIndicator = (backtest_id, chart, price, ind) =>
    // {
    //     chart = this.filterChart(chart, false);
    //     /**  Retreive indicator data */
    //     Indicator[ind.type](
    //         backtest_id + '/' + chart.product,
    //         chart.filteredTimestamps, chart.filteredAsks, 
    //         chart.filteredBids, ind.properties
    //     );
    // }

    async requestStrategyStatusUpdate(strategy_id, broker_id, accounts, new_status)
    {
        const { REACT_APP_API_URL } = process.env;
        const reqOptions = {
            method: 'POST',
            headers: this.props.getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ accounts: accounts })
        }

        let res = await fetch(
            `${REACT_APP_API_URL}/v1/strategy/${strategy_id}/${new_status}/${broker_id}`,
            reqOptions
        );

        let { strategyInfo } = this.state;

        if (res.status === 200)
        {
            res = await res.json();
            if ('brokers' in res)
            {
                strategyInfo[strategy_id].brokers = res.brokers;
            }
            this.setState({ strategyInfo });
        }
        
        this.toolbar.setStatusMsg(null);
    }

    getAppContainer = () =>
    {
        return this.appContainer;
    }

    getCurrentStrategy = () =>
    {
        let { account } = this.state;

        if ('metadata' in account)
        {
            return account.metadata.current_strategy;
        }

        return undefined;
    }

    getStrategyInfo = (strategy_id) =>
    {
        const { strategyInfo } = this.state;
        return strategyInfo[strategy_id];
    }

    getStrategyAccountStatus = (strategy_id, account_id) =>
    {
        const { strategyInfo } = this.state;
        return strategyInfo[strategy_id].accounts[account_id];
    }

    async startScript(broker_id, account_id)
    {
        // this.toolbar.setStatusMsg('Starting strategy...');

        const { account, strategyInfo } = this.state;
        const strategy_id = account.metadata.current_strategy;
        await this.requestStrategyStatusUpdate(
            strategy_id, broker_id, [account_id], 'start'
        );
    }

    async stopScript(broker_id, account_id)
    {
        // this.toolbar.setStatusMsg('Stopping strategy...');

        const { account, strategyInfo } = this.state;
        const strategy_id = account.metadata.current_strategy;
        await this.requestStrategyStatusUpdate(
            strategy_id, broker_id, [account_id], 'stop'
        );
    }

    getWindowInfo = (strategy_id, item_id) =>
    {
        const strategy = this.getStrategyInfo(strategy_id);

        for (let i = 0; i < strategy.windows.length; i++)
        {
            if (strategy.windows[i].id === item_id) return strategy.windows[i];
        }
        return undefined;
    }

    getWindowById = (item_id) =>
    {
        if (this.is_loaded)
        {
            for (let i of this.strategy.windows)
            {
                if (i.getItemId() === item_id)
                {
                    return i;
                }
            }
        }
        return undefined;
    }

    windowExists  = (strategy_id, item_id) =>
    {
        return this.getWindowInfo(strategy_id, item_id) !== undefined;
    }

    addWindow = (strategy_id, window) =>
    {
        let { strategyInfo } = this.state;
        strategyInfo[strategy_id].windows.push(window);
        // Add to history
        const new_item = {
            id: window.id,
            action: 'add',
            item: {}
        }
        this.addHistory(strategy_id, new_item);

        this.setState({ strategyInfo });
    }

    closeWindow = (strategy_id, item_id) =>
    {
        let { strategyInfo } = this.state;
        for (let i = 0; i < strategyInfo[strategy_id].windows.length; i++)
        {
            const w = strategyInfo[strategy_id].windows[i];
            if (w.id === item_id)
            {
                strategyInfo[strategy_id].windows.splice(i,1);
                // Add to history
                const new_item = {
                    id: item_id,
                    action: 'close',
                    item: {}
                }
                this.addHistory(strategy_id, new_item);

                this.setState({ strategyInfo });
                return true;
            }
        }

        return false;
    }

    updateStrategyInfo = () =>
    {
        let { strategyInfo } = this.state;
        this.setState({ strategyInfo });
    }

    getStrategyWindows = (strategy_id) =>
    {
        const { strategyInfo } = this.state;
        if (strategyInfo.hasOwnProperty(strategy_id))
        {
            return strategyInfo[strategy_id].windows;
        }
        return undefined;
    }

    getStrategyWindowIds = (strategy_id) => 
    {
        const { strategyInfo } = this.state;
        let result = [];
        if (strategyInfo.hasOwnProperty(strategy_id))
        {
            for (let i of strategyInfo[strategy_id].windows)
            {
                result.push(i.id);
            }
        }
        return result;
    }

    clone = (obj) => {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }

    getCamera = () =>
    {
        return this.camera;
    }

    getContainerSize = () =>
    {
        return { 
            width: this.getAppContainer().clientWidth,
            height: this.getAppContainer().clientHeight
        }
    }

    setOpenStrategy = (e) =>
    {
        const strategy_id = e.target.getAttribute('name');

        let { account } = this.state;
        if (account.metadata.current_strategy !== strategy_id)
        {
            account.metadata.current_strategy = strategy_id;
            this.setState({ account });
        }
    }

    convertScreenUnitToWorldUnit = (unit) =>
    {
        const scale = this.getScale();
        const camera = this.getCamera();
        const container_size = this.getContainerSize();
        return camera.convertScreenUnitToWorldUnit(
            unit, container_size, scale
        );
    }

    convertWorldUnitToScreenUnit = (unit) =>
    {
        const scale = this.getScale();
        const camera = this.getCamera();
        const container_size = this.getContainerSize();
        return camera.convertWorldUnitToScreenUnit(
            unit, container_size, scale
        );
    }

    getScreenSize = (size) =>
    {
        const scale = this.getScale();
        const camera = this.getCamera();
        const container_size = this.getContainerSize();
        const result = camera.convertWorldUnitToScreenUnit(
            { x: size.width, y: size.height }, container_size, scale
        );
        return { width: result.x, height: result.y };
    }

    getStrategyId = () =>
    {
        return this.state.account.metadata.current_strategy;
    }

    getSize = () =>
    {
        return this.state.size;
    }

    getScale = () =>
    {
        return this.state.scale;
    }

    getPopup = () =>
    {
        return this.state.popup;
    }

    setPopup = (popup) =>
    {
        this.setState({ popup });
    }

    setPopupOpened = (opened) =>
    {
        let { popup } = this.state;
        popup.opened = opened
        this.setState({ popup });
    }

    setHovered = (name, is_hovered) =>
    {
        let { hovered } = this.state;
        hovered[name] = is_hovered;
        this.setState({ is_hovered });
    }

    getHistory = () =>
    {
        return this.state.history;
    }

    getLastHistoryAction = (id, action) =>
    {
        const { history } = this.state;
        for (let i of history)
        {
            if (i.id === id && i.action === action) return history;
        }
        return null;
    }

    getSio = () =>
    {
        return this.state.sio;
    }

    isHistoryItemsEqual = (x, y) =>
    {
        if (x === undefined || x.id !== y.id || x.action !== y.action) return false;
        
        if (typeof x.item === "object")
        {   
            let i = undefined;
            for (i in x.item)
            {
                if (y.item.hasOwnProperty(i))
                {
                    if (x[i] !== y[i]) return false;
                }
            }
        }
        else
        {
            return x.item === y.item;
        }

        return true;
    }

    addToSave = (strategy_id, item_ids) =>
    {
        let { toSave, lastChange } = this.state;
        if (!toSave.hasOwnProperty(strategy_id))
            toSave[strategy_id] = [];

        for (let i of item_ids)
        {
            if (!toSave[strategy_id].includes(i))
                toSave[strategy_id].push(i);
        }

        lastChange = new Date().getTime();
        this.onSaveTimeout();
        this.setState({ toSave, lastChange });
    }

    addHistory = (strategy_id, new_item) =>
    {
        let { history } = this.state;
        this.addToSave(strategy_id, [new_item.id]);
        
        if (!history.hasOwnProperty(strategy_id))
        {
            history[strategy_id] = [];
        }
        
        history[strategy_id].push(new_item);
        history[strategy_id] = history[strategy_id].slice(Math.max(history[strategy_id].length-10,0));
        
        this.setState({ history });
    }

    deleteHistory = (idx) =>
    {
        let { history } = this.state;
        history.splice(idx, 1);
        this.setState({ history });
    }

    undo = () =>
    {
        let { history } = this.state;
        return history.pop();
    }

    redo = () =>
    {

    }

    onSaveTimeout = () =>
    {
        setTimeout(() => {
            let { toSave, lastChange } = this.state;
            if (this.isSave())
            {
                this.save(this.clone(toSave), this.handleSaveResult.bind(this));
                lastChange = new Date().getTime();
                toSave = {};
                this.setState({ toSave, lastChange });
            }
        }, (WAIT_FOR_SAVE+1)*1000);
    } 

    handleSaveResult(result)
    {
        if (result.length > 0)
        {
            let { toSave } = this.state;
            // Re populate save with failed window IDs
            let s_id = undefined;
            for (s_id in result)
            {
                for (let i of result[s_id])
                {
                    if (!toSave.hasOwnProperty(s_id))
                        toSave[s_id] = [];
                    if (!toSave[s_id].includes(i))
                        toSave[s_id].push(i);
                }
            }
    
            this.setState({ toSave });
            this.onSaveTimeout();
        }
    }

    isSave = () =>
    {
        const { lastChange } = this.state;
        if (lastChange !== null)
        {
            return (new Date().getTime() - lastChange/1000) >= WAIT_FOR_SAVE;
        }
        else
        {
            return false;
        }
    }

    async save(toSave, handleSaveResult)
    {
        const { REACT_APP_API_URL } = process.env;
        let s_id = undefined;
        let to_update = {};
        let to_delete = {};
        // Organise into appropriate groups
        for (s_id in toSave)
        {
            to_update[s_id] = { windows: [] };
            to_delete[s_id] = { windows: [] };

            if (!s_id.includes('/backtest/'))
            {
                to_update[s_id].account = this.getCurrentAccount(s_id);
            }

            for (let i of toSave[s_id])
            {
                if (this.windowExists(s_id, i))
                {
                    to_update[s_id].windows.push(this.getWindowInfo(s_id, i));
                } 
                else
                {
                    to_delete[s_id].windows.push(i);
                }
            }
        }

        // Update API

        let result = {};
        // PUT
        var requestOptions = {
            method: 'PUT',
            credentials: 'include',
            headers: this.props.getHeaders()
        };
        for (s_id in to_update)
        {
            requestOptions.body = JSON.stringify(to_update[s_id]);
            const res = await fetch(`${REACT_APP_API_URL}/v1/strategy/${s_id}/gui`, requestOptions);
            const status = res.status;

            if (status !== 200)
            {
                // Re populate save with failed window IDs
                for (let i of to_update[s_id].windows)
                {
                    if (!result.hasOwnProperty(s_id))
                        result[s_id] = { windows: [] };
                    if (!result[s_id].windows.includes(i.id))
                        result[s_id].windows.push(i.id);
                }
            }
        }
        
        // DELETE
        var requestOptions = {
            method: 'DELETE',
            credentials: 'include',
            headers: this.props.getHeaders()
        };
        for (s_id in to_delete)
        {
            requestOptions.body = JSON.stringify(to_delete[s_id]);
            const res = await fetch(`${REACT_APP_API_URL}/v1/strategy/${s_id}/gui`, requestOptions);
            const status = res.status;

            if (status !== 200)
            {
                // Re populate save with failed window IDs
                for (let i of to_delete[s_id].windows)
                {
                    if (!result.hasOwnProperty(s_id))
                        result[s_id] = { windows: [] };
                    if (!result[s_id].windows.includes(i))
                        result[s_id].windows.push(i);
                }
            }
        }

        handleSaveResult(result);
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
        const dt = moment.utc(ts*1000);
        return (
            (dt.format('ddd') === 'Fri' && parseInt(dt.format('H')) >= 17) ||
            (dt.format('ddd') === 'Sat') ||
            (dt.format('ddd') === 'Sun' && parseInt(dt.format('H')) < 17)
        );
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
        return moment.utc((ts + off * i * direction) * 1000);
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
        return moment.utc((ts + off * i * direction) * 1000);
    }

    getCurrentAccount = (strategy_id) =>
    {
        const strategy = this.getStrategyInfo(strategy_id);

        if (strategy !== undefined)
        {
            return strategy.account;
        }
        else
        {
            return undefined;
        }
    }

    getMousePos = () =>
    {
        return this.state.mouse_pos;
    }

    getKeys = () =>
    {
        return this.state.keys;
    }
}

const SPACEBAR = 32;
const WAIT_FOR_SAVE = 5;

export default StrategyApp;