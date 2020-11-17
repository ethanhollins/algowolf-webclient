import React, { Component } from 'react';
import WindowWrapper from './WindowWrapper';
import WindowShadow from './WindowShadow';

class Backtest extends Component 
{
    constructor(props)
    {
        super(props);

        this.transactions = null;

        this.state = {
            sio: undefined,
            current_page: 0,
            current_idx: 0,
            current_timestamp: 0,
            positions: [],
            orders: [],
            drawings: {},
            info: {},
            input_variables: {},
            log: [],
            hide_shadows: false
        }

        this.windows = [];

        this.addWindowsRef = elem => {
            this.windows.push(elem);
        }
    }

    async componentDidMount()
    {
        this.transactions = (await this.props.retrieveTransactions(this.props.id)).transactions;

        let strategy = this.getStrategyInfo();
        this.handleTransactions(strategy.properties.end);
    }

    render() {
        return (
            <React.Fragment>
            
            <div className='shadow container'>
                {this.generateShadows()}
            </div>

            <div className='window container'>
                {this.generateWindows()}
            </div>
            
            </React.Fragment>
        );
    }

    generateShadows()
    {
        const { current_page, hide_shadows } = this.state;

        let gen_windows = [];

        const strategy_info = this.props.getStrategyInfo(this.props.id);
        let i = '';
        if (!hide_shadows && strategy_info !== undefined)
        {
            for (i in strategy_info.windows)
            {
                const w = strategy_info.windows[i];
    
                if (w.page === current_page)
                {
                    gen_windows.push(
                        <WindowShadow
                            key={w.id}
                            info={w}
                            strategy_id={this.props.id}
                            getAppContainer={this.props.getAppContainer}
                            convertScreenUnitToWorldUnit={this.props.convertScreenUnitToWorldUnit}
                            convertWorldUnitToScreenUnit={this.props.convertWorldUnitToScreenUnit}
                            getSize={this.props.getSize}
                            getScale={this.props.getScale}
                            getCamera={this.props.getCamera}
                        />
                    )
                }
            }
        }
        return gen_windows;
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
                            ref={this.addWindowsRef}
                            info={w}
                            strategy_id={this.props.id}
                            clone={this.props.clone}
                            getAppContainer={this.props.getAppContainer}
                            convertScreenUnitToWorldUnit={this.props.convertScreenUnitToWorldUnit}
                            convertWorldUnitToScreenUnit={this.props.convertWorldUnitToScreenUnit}
                            getMousePos={this.props.getMousePos}
                            getSize={this.props.getSize}
                            getScale={this.props.getScale}
                            getChartElement={this.props.getChartElement}
                            getStrategyInfo={this.props.getStrategyInfo}
                            updateStrategyInfo={this.props.updateStrategyInfo}
                            getCurrentAccount={this.getCurrentAccount}
                            updateInfo={this.props.updateInfo}
                            getKeys={this.props.getKeys}
                            setPopup={this.props.setPopup}
                            // Window Funcs
                            closeWindow={this.props.closeWindow}
                            windowExists={this.props.windowExists}
                            getWindowById={this.props.getWindowById}
                            isTopWindow={this.props.isTopWindow}
                            getTopWindow={this.props.getTopWindow}
                            setTopWindow={this.props.setTopWindow}
                            moveWindow={this.props.moveWindow}
                            hideShadows={this.hideShadows}
                            // History Functions
                            addHistory={this.props.addHistory}
                            getHistory={this.props.getHistory}
                            getLastHistoryAction={this.props.getLastHistoryAction}
                            deleteHistory={this.props.deleteHistory}
                            // Chart Functions
                            retrieveChartData={this.props.retrieveChartData}
                            addChart={this.addChart}
                            getChart={this.getChart}
                            updateChart={this.updateChart}
                            findIndicator={this.findIndicator}
                            createIndicator={this.createIndicator}
                            getIndicator={this.getIndicator}
                            calculateIndicator={this.props.calculateIndicator}
                            resetIndicators={this.props.resetIndicators}
                            getPeriodOffsetSeconds={this.props.getPeriodOffsetSeconds}
                            getCountDate={this.props.getCountDate}
                            getCountDateFromDate={this.props.getCountDateFromDate}
                            getDrawings={this.getDrawings}
                            getPositions={this.getPositions}
                            getOrders={this.getOrders}
                            getCurrentTimestamp={this.getCurrentTimestamp}
                            setCurrentTimestamp={this.setCurrentTimestamp}
                            // Log Functions
                            getLog={this.getLog}
                            getInfo={this.getInfo}
                            updateInfo={this.props.updateInfo}
                            getGlobalInputVariables={this.getGlobalInputVariables}
                            getCurrentGlobalVariablesPreset={this.getCurrentGlobalVariablesPreset}
                            getLocalInputVariables={this.getLocalInputVariables}
                            getCurrentLocalVariablesPreset={this.getCurrentLocalVariablesPreset}
                            updateInputVariables={this.updateInputVariables}
                            isLoaded={this.isLoaded}
                        />
                    )
                }
            }
        }
        return gen_windows;
    }

    addChart = (broker, product, period, ohlc_data) =>
    {
        return this.props.addChart(this.props.id, broker, product, period, ohlc_data)
    }

    getChart = (broker, product, period) =>
    {
        return this.props.getChart(this.props.id, broker, product, period)
    }

    updateChart = (product, period, ohlc_data) =>
    {
        return this.props.updateChart(this.props.id, product, period, ohlc_data)
    }

    getIndicator = (type, price, product, period) =>
    {
        return this.props.getIndicator(type, price, this.props.id, product, period)
    }

    findIndicator = (type, broker, product, period) =>
    {
        return this.props.findIndicator(this.props.id, type, broker, product, period);
    }

    createIndicator = (type, broker, product, properties) =>
    {
        return this.props.createIndicator(this.props.id, type, broker, product, properties);
    }

    // calculateIndicator = (chart, price, ind) =>
    // {
    //     return this.props.calculateIndicator(this.props.id, chart, price, ind)
    // }

    subscribe()
    {
        const { sio } = this.state;
        sio.emit(
            'subscribe', 
            {
                'strategy_id': this.props.id,
                'field': 'ontrade'
            }
        );
    }

    hideShadows = (hide_shadows) =>
    {
        this.setState({ hide_shadows });
    }

    handleKeys = () =>
    {
        const keys = this.props.getKeys();
        
        if (keys.includes(ARROW_RIGHT))
        {
            const { current_timestamp } = this.state;
            this.handleTransactions(current_timestamp + this.props.getPeriodOffsetSeconds('M1'));
        }
        if (keys.includes(ARROW_LEFT))
        {
            const { current_timestamp } = this.state;
            this.handleTransactions(current_timestamp - this.props.getPeriodOffsetSeconds('M1'));
        }
    }

    handleCreatePosition = (positions, trans) =>
    {
        positions.push(trans.item.new);
    }

    handleClosePosition = (positions, trans) =>
    {
        for (let i = 0; i < positions.length; i++)
        {
            if (positions[i].order_id === trans.item.new.order_id)
            {
                positions.splice(i, 1);
            }
        }
    }

    handleCreateOrder = (orders, trans) =>
    {
        orders.push(trans.item.new);
    }

    handleCancelOrder = (orders, trans) =>
    {
        for (let i = 0; i < orders.length; i++)
        {
            if (orders[i].order_id === trans.item.new.order_id)
            {
                orders.splice(i, 1);
            }
        }
    }

    handleModify = (positions, orders, trans) =>
    {
        const item = trans.item.new;
        if (item.order_type === 'limitorder' || item.order_type === 'stoporder')
        {
            for (let i = 0; i < orders.length; i++)
            {
                if (orders[i].order_id === item.order_id)
                {
                    orders[i] = item;
                }
            }
        }
        else
        {
            for (let i = 0; i < positions.length; i++)
            {
                if (positions[i].order_id === item.order_id)
                {
                    positions[i] = item;
                }
            }
        }
    }

    handleCreateDrawing = (drawings, trans) =>
    {
        const item = trans.item;
        if (!(item.layer in drawings))
        {
            drawings[item.layer] = [];
        }

        drawings[item.layer].push(trans.item);
    }

    handleClearDrawingLayer = (drawings, trans) =>
    {
        if (trans.item in drawings)
        {
            drawings[trans.item] = [];
        }
    }

    handleClearAllDrawings = (drawings, trans) =>
    {
        for (let i in drawings)
        {
            drawings[i] = [];
        }
    }

    handleCreateInfo = (info, trans) =>
    {
        // info.push(trans.item);
    }

    handleCreateLog = (log, trans) =>
    {
        log.push(trans);
    }

    handleTransactions = (dest_timestamp) =>
    {
        if (this.transactions !== null)
        {
            let { current_idx, current_timestamp, positions, orders, drawings, info, log } = this.state;
            const transactions = this.getTransactions();
    
            if (dest_timestamp === current_timestamp) return;
            else if (dest_timestamp < current_timestamp)
            {
                // Reset all vars and start from beginning
                current_idx = 0;
                positions = [];
                orders = [];
                info = [];
                log = [];
                drawings = {};
            }
            current_timestamp = dest_timestamp;
    
            for (current_idx; current_idx < transactions.length; current_idx++)
            {
                const t = transactions[current_idx];
                if (t.timestamp > current_timestamp) break;
    
                switch (t.type)
                {
                    case 'marketentry':
                    case 'limitentry':
                    case 'stopentry':
                        this.handleCreatePosition(positions, t);
                        break;
                    case 'limitorder':
                    case 'stoporder':
                        this.handleCreateOrder(orders, t);
                        break;
                    case 'positionclose':
                    case 'stoploss':
                    case 'takeprofit':
                        this.handleClosePosition(positions, t);
                        break;
                    case 'ordercancel':
                        this.handleCancelOrder(orders, t);
                        break;
                    case 'modify':
                        this.handleModify(positions, orders, t);
                        break;
                    case 'create_drawing':
                        this.handleCreateDrawing(drawings, t);
                        break;
                    case 'clear_drawing_layer':
                        this.handleClearDrawingLayer(drawings, t);
                        break;
                    case 'clear_all_drawings':
                        this.handleClearAllDrawings(drawings, t);
                        break;
                    case 'create_info':
                        this.handleCreateInfo(info, t);
                        break;
                    case 'create_log':
                        this.handleCreateLog(log, t);
                        break;
                }
            }
    
            this.setState({ current_idx, current_timestamp, positions, orders, drawings, info, log });
        }

    }

    // GETTERS

    getStrategyInfo = () =>
    {
        const strategy_id = this.props.id;
        return this.props.getStrategyInfo(strategy_id);
    }

    getTransactions = () =>
    {
        return this.transactions;
    }

    getDrawings = () =>
    {
        return this.state.drawings;
    }

    getPositions = () =>
    {
        return this.state.positions;
    }

    getOrders = () =>
    {
        return this.state.orders;
    }

    getLog = () =>
    {
        return this.state.log;
    }

    getInfo = () =>
    {
        return this.state.info;
    }

    getInputVariables = () =>
    {
        return this.state.input_variables;
    }

    getCurrentTimestamp = () =>
    {
        return this.state.current_timestamp;
    }

    setCurrentTimestamp = (timestamp) =>
    {
        this.handleTransactions(timestamp);
    }

    getCurrentAccount = () =>
    {
        return 'BACKTEST.ACCOUNT_1';
    }

    async setCurrentAccount()
    {
        
    }

    getGlobalInputVariables = () =>
    {
        return {};
    }

    getLocalInputVariables = () =>
    {
        return {};
    }

    getAllCurrentInputVariables = () =>
    {
        return {};
    }

    updateInputVariables = (local_variables, global_variables) =>
    {
        
    }

    setLocalInputVariables = (account_id, data) =>
    {
        
    }

    getCurrentGlobalVariablesPreset = () =>
    {
        return 'Preset 1';
    }

    setCurrentGlobalVariablesPreset = () =>
    {
        
    }

    getCurrentLocalVariablesPreset = () =>
    {
        return 'Preset 1';
    }

    setCurrentLocalVariablesPreset = () =>
    {
        
    }

    switchLocalVariablesPreset = (account_id, data) =>
    {
        
    }

    isLoaded = () =>
    {
        return true;
    }

}

const ARROW_LEFT = 37;
const ARROW_UP = 38;
const ARROW_RIGHT = 39;
const ARROW_DOWN = 40;

export default Backtest;