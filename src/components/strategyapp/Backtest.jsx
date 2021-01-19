import React, { Component } from 'react';
import WindowWrapper from './WindowWrapper';
import WindowShadow from './WindowShadow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine } from '@fortawesome/pro-light-svg-icons';

class Backtest extends Component 
{
    constructor(props)
    {
        super(props);

        this.backtest_transactions = null;

        this.state = {
            sio: undefined,
            current_page: 0,
            current_idx: 0,
            current_timestamp: 0,
            positions: [],
            orders: [],
            drawings: {},
            input_variables: {},
            log: [],
            transactions: {
                'Time': [], 'Type': [], 'Instrument': [],
                'Size': [], 'Price': [], 'StopLoss': [], 
                'TakeProfit': [], 'Amount': []
            },
            hide_shadows: false,
            reference_timestamp: 0,
            selected_offset: 0,
            selected_chart: null
        }

        this.retrieveReport = this.retrieveReport.bind(this);

        this.windows = [];

        this.addWindowsRef = elem => {
            this.windows.push(elem);
        }
    }

    async componentDidMount()
    {
        if (this.getStrategyInfo().name)
        {
            document.title = this.getStrategyInfo().name + ' \u00B7 AlgoWolf';
        }
        else
        {
            document.title = 'Algorithmic Trading Platform \u00B7 AlgoWolf';
        }
        this.backtest_transactions = (await this.props.retrieveTransactions(this.props.id)).transactions;

        let strategy = this.getStrategyInfo();
        this.handleTransactions(strategy.properties.end);

        this.props.setShowLoadScreen(false);

        console.log(strategy.info);
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
        const { hide_shadows } = this.state;
        const current_page = this.props.getPage();

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
        const current_page = this.props.getPage();

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
                            isDemo={this.props.isDemo}
                            strategy_id={this.props.id}
                            removeWindowsRef={this.removeWindowsRef}
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
                            getPopup={this.props.getPopup}
                            // Window Funcs
                            closeWindow={this.props.closeWindow}
                            windowExists={this.props.windowExists}
                            getWindowById={this.props.getWindowById}
                            getMetadata={this.props.getMetadata}
                            setMetadata={this.props.setMetadata}
                            isTopWindow={this.props.isTopWindow}
                            getTopWindow={this.props.getTopWindow}
                            setTopWindow={this.props.setTopWindow}
                            retrieveReport={this.retrieveReport}
                            moveWindow={this.props.moveWindow}
                            hideShadows={this.hideShadows}
                            setChartPositionsByTimestamp={this.setChartPositionsByTimestamp}
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
                            getTransactions={this.getTransactions}
                            getCurrentTimestamp={this.getCurrentTimestamp}
                            setCurrentTimestamp={this.setCurrentTimestamp}
                            setSelectedOffset={this.setSelectedOffset}
                            getSelectedOffset={this.getSelectedOffset}
                            setSelectedChart={this.setSelectedChart}
                            getSelectedChart={this.getSelectedChart}
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

        if (gen_windows.length === 0)
        {
            return (
                <div className='window message'>
                    <div>This page has no open windows!</div>
                    <div>
                        <div>Try adding a chart</div>
                        <FontAwesomeIcon className='window message-icon' icon={faChartLine} />
                    </div>
                </div>
            );
        }
        else
        {
            return gen_windows;
        }
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

    findIndicator = (type, broker, product, chart_period, period) =>
    {
        return this.props.findIndicator(this.props.id, type, broker, product, chart_period, period);
    }

    createIndicator = (type, broker, product, chart_period, properties) =>
    {
        return this.props.createIndicator(this.props.id, type, broker, product, chart_period, properties);
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

    updateInfo = () =>
    {
        for (let w of this.windows)
        {
            if (w !== null && w.getInnerElement() !== null)
            {
                if (w.getInnerElement().updateInfo !== undefined)
                {
                    const mouse_pos = this.props.getMousePos();
                    w.getInnerElement().updateInfo({ 
                        x: mouse_pos.x, 
                        y: mouse_pos.y - this.props.getAppContainer().offsetTop 
                    });
                }
            }
        }
    }

    handleKeys = () =>
    {
        const keys = this.props.getKeys();
        const { selected_offset } = this.state;
        
        if (keys.includes(ARROW_RIGHT))
        {
            const { current_timestamp } = this.state;
            this.handleTransactions(this.getRoundedTimestamp(current_timestamp + selected_offset));
            this.updateInfo();
        }
        if (keys.includes(ARROW_LEFT))
        {
            const { current_timestamp } = this.state;
            this.handleTransactions(this.getRoundedTimestamp(current_timestamp - selected_offset));
            this.updateInfo();
        }
    }

    handleCreatePosition = (positions, trans, transactions) =>
    {
        positions.push(trans.item.new);

        // Create Transaction
        transactions['Time'].push(trans.timestamp);
        transactions['Type'].push(trans.type.replace('_', ' ').toUpperCase());
        transactions['Instrument'].push(trans.item.new.product.replace('_', ' '));
        transactions['Size'].push(trans.item.new.lotsize);
        transactions['Price'].push(trans.item.new.entry_price);
        transactions['StopLoss'].push(trans.item.new.sl);
        transactions['TakeProfit'].push(trans.item.new.tp);
        transactions['Amount'].push(0);
    }

    handleCreatePositionFromOrder = (positions, orders, trans, transactions) =>
    {
        for (let i = 0; i < orders.length; i++)
        {
            if (orders[i].order_id === trans.item.prev.order_id)
            {
                orders.splice(i, 1);
            }
        }
        positions.push(trans.item.new);

        // Create Transaction
        transactions['Time'].push(trans.timestamp);
        transactions['Type'].push(trans.type.replace('_', ' ').toUpperCase());
        transactions['Instrument'].push(trans.item.new.product.replace('_', ' '));
        transactions['Size'].push(trans.item.new.lotsize);
        transactions['Price'].push(trans.item.new.entry_price);
        transactions['StopLoss'].push(trans.item.new.sl);
        transactions['TakeProfit'].push(trans.item.new.tp);
        transactions['Amount'].push(0);
    }

    handleClosePosition = (positions, trans, transactions) =>
    {
        for (let i = 0; i < positions.length; i++)
        {
            if (positions[i].order_id === trans.item.new.order_id)
            {
                positions.splice(i, 1);
            }
        }

        // Create Transaction
        transactions['Time'].push(trans.timestamp);
        transactions['Type'].push(trans.type.replace('_', ' ').toUpperCase());
        transactions['Instrument'].push(trans.item.new.product.replace('_', ' '));
        transactions['Size'].push(trans.item.new.lotsize);
        transactions['Price'].push(trans.item.new.close_price);
        transactions['StopLoss'].push(trans.item.new.sl);
        transactions['TakeProfit'].push(trans.item.new.tp);
        transactions['Amount'].push(0);
    }

    handleCreateOrder = (orders, trans, transactions) =>
    {
        orders.push(trans.item.new);

        // Create Transaction
        transactions['Time'].push(trans.timestamp);
        transactions['Type'].push(trans.type.replace('_', ' ').toUpperCase());
        transactions['Instrument'].push(trans.item.new.product.replace('_', ' '));
        transactions['Size'].push(trans.item.new.lotsize);
        transactions['Price'].push(trans.item.new.entry_price);
        transactions['StopLoss'].push(trans.item.new.sl);
        transactions['TakeProfit'].push(trans.item.new.tp);
        transactions['Amount'].push(0);
    }

    handleCancelOrder = (orders, trans, transactions) =>
    {
        for (let i = 0; i < orders.length; i++)
        {
            if (orders[i].order_id === trans.item.new.order_id)
            {
                orders.splice(i, 1);
            }
        }

        // Create Transaction
        transactions['Time'].push(trans.timestamp);
        transactions['Type'].push(trans.type.replace('_', ' ').toUpperCase());
        transactions['Instrument'].push(trans.item.new.product.replace('_', ' '));
        transactions['Size'].push(trans.item.new.lotsize);
        transactions['Price'].push(trans.item.new.entry_price);
        transactions['StopLoss'].push(trans.item.new.sl);
        transactions['TakeProfit'].push(trans.item.new.tp);
        transactions['Amount'].push(0);
    }

    handleModify = (positions, orders, trans, transactions) =>
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

        // Create Transaction
        transactions['Time'].push(trans.timestamp);
        transactions['Type'].push(trans.type.replace('_', ' ').toUpperCase());
        transactions['Instrument'].push(trans.item.new.product.replace('_', ' '));
        transactions['Size'].push(trans.item.new.lotsize);
        transactions['Price'].push(trans.item.new.entry_price);
        transactions['StopLoss'].push(trans.item.new.sl);
        transactions['TakeProfit'].push(trans.item.new.tp);
        transactions['Amount'].push(0);
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
        info[trans.timestamp] = trans.item;
    }

    handleCreateLog = (log, trans) =>
    {
        log.push(trans);
    }

    handleTransactions = (dest_timestamp) =>
    {
        if (this.backtest_transactions !== null)
        {
            let { current_idx, current_timestamp, positions, orders, drawings, info, log, transactions } = this.state;
            const backtest_transactions = this.getBacktestTransactions();
    
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
                transactions = {
                    'Time': [], 'Type': [], 'Instrument': [],
                    'Size': [], 'Price': [], 'StopLoss': [], 
                    'TakeProfit': [], 'Amount': []
                };
            }
            current_timestamp = dest_timestamp;
    
            for (current_idx; current_idx < backtest_transactions.length; current_idx++)
            {
                const t = backtest_transactions[current_idx];
                if (t.timestamp > current_timestamp) break;
                
                switch (t.type)
                {
                    case 'marketentry':
                        this.handleCreatePosition(positions, t, transactions);
                        break;
                    case 'limitentry':
                    case 'stopentry':
                        this.handleCreatePositionFromOrder(positions, orders, t, transactions);
                        break;
                    case 'limitorder':
                    case 'stoporder':
                        this.handleCreateOrder(orders, t, transactions);
                        break;
                    case 'positionclose':
                    case 'stoploss':
                    case 'takeprofit':
                        this.handleClosePosition(positions, t, transactions);
                        break;
                    case 'ordercancel':
                        this.handleCancelOrder(orders, t, transactions);
                        break;
                    case 'modify':
                        this.handleModify(positions, orders, t, transactions);
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

    getBacktestTransactions = () =>
    {
        return this.backtest_transactions;
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

    getTransactions = () =>
    {
        return this.state.transactions;
    }

    getInfo = (product, period) =>
    {
        if (product in this.getStrategyInfo().info)
        {
            if (period in this.getStrategyInfo().info[product])
            {
                return this.getStrategyInfo().info[product][period];
            }
        }
        return {};
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

    setChartPositionsByTimestamp = (timestamp) =>
    {
        const strategy = this.getStrategyInfo();

        for (let w of strategy.windows)
        {
            if (w.type === 'chart')
            {
                let metadata = this.props.getMetadata(this.props.id, w.id);
                if (metadata === undefined)
                {
                    metadata = {};
                }
                if (!('actions' in metadata))
                {
                    metadata.actions = {}
                }
                metadata.actions['setPosByTimestamp'] = [timestamp];
                this.props.setMetadata(this.props.id, w.id, metadata);
            }
        }
    }

    getRoundedTimestamp = (timestamp) =>
    {
        const { reference_timestamp, selected_offset } = this.state;
        return timestamp - (timestamp - reference_timestamp) % selected_offset
    }

    async retrieveReport(name)
    {
        const strategy_id = this.props.id.split('/backtest/')[0];
        const backtest_id = this.props.id.split('/backtest/')[1];

        return await this.props.retrieveReport(strategy_id, backtest_id, name);
    }

    isLoaded = () =>
    {
        return true;
    }

    setSelectedOffset = (reference_timestamp, selected_offset) =>
    {
        this.setState({ reference_timestamp, selected_offset });
    }

    getSelectedOffset = () =>
    {
        return this.state.selected_offset;
    }

    setSelectedChart = (selected_chart) =>
    {
        this.setState({ selected_chart });
    }

    getSelectedChart = () =>
    {
        return this.state.selected_chart;
    }

    removeWindowsRef = (elem) =>
    {
        this.windows.splice(this.windows.indexOf(elem), 1);
    }

}

const ARROW_LEFT = 37;
const ARROW_UP = 38;
const ARROW_RIGHT = 39;
const ARROW_DOWN = 40;

export default Backtest;