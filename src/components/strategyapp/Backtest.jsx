import React, { Component } from 'react';
import WindowWrapper from './WindowWrapper';
import WindowShadow from './WindowShadow';

class Backtest extends Component 
{
    constructor(props)
    {
        super(props);

        let strategy = this.getStrategyInfo();
        const current_timestamp = strategy.properties.start;
        this.state = {
            sio: undefined,
            current_page: 0,
            current_idx: 0,
            current_timestamp: current_timestamp,
            positions: [],
            orders: [],
            drawings: {},
            info: [],
            logs: []
        }
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
                            info={w}
                            strategy_id={this.props.id}
                            clone={this.props.clone}
                            getAppContainer={this.props.getAppContainer}
                            convertScreenUnitToWorldUnit={this.props.convertScreenUnitToWorldUnit}
                            convertWorldUnitToScreenUnit={this.props.convertWorldUnitToScreenUnit}
                            getSize={this.props.getSize}
                            getScale={this.props.getScale}
                            getChartElement={this.props.getChartElement}
                            getStrategyInfo={this.props.getStrategyInfo}
                            updateStrategyInfo={this.props.updateStrategyInfo}
                            getKeys={this.props.getKeys}
                            setPopup={this.props.setPopup}
                            // Window Funcs
                            closeWindow={this.props.closeWindow}
                            windowExists={this.props.windowExists}
                            isTopWindow={this.props.isTopWindow}
                            setTopWindow={this.props.setTopWindow}
                            moveWindow={this.props.moveWindow}
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
                            getIndicator={this.getIndicator}
                            calculateIndicator={this.calculateIndicator}
                            getPeriodOffsetSeconds={this.props.getPeriodOffsetSeconds}
                            getCountDate={this.props.getCountDate}
                            getCountDateFromDate={this.props.getCountDateFromDate}
                            getDrawings={this.getDrawings}
                            getPositions={this.getPositions}
                            getOrders={this.getOrders}
                            getCurrentTimestamp={this.getCurrentTimestamp}
                        />
                    )
                }
            }
        }
        return gen_windows;
    }

    addChart = (product, period, ohlc_data) =>
    {
        return this.props.addChart(this.props.id, product, period, ohlc_data)
    }

    getChart = (product, period) =>
    {
        return this.props.getChart(this.props.id, product, period)
    }

    updateChart = (product, period, ohlc_data) =>
    {
        return this.props.updateChart(this.props.id, product, period, ohlc_data)
    }

    getIndicator = (type, price, product, period) =>
    {
        return this.props.getIndicator(type, price, this.props.id, product, period)
    }

    calculateIndicator = (chart, price, ind) =>
    {
        return this.props.calculateIndicator(this.props.id, chart, price, ind)
    }

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

    handleKeys = () =>
    {
        const keys = this.props.getKeys();
        
        if (keys.includes(ARROW_RIGHT))
        {
            console.log('->');
            const { current_timestamp } = this.state;
            this.handleTransactions(current_timestamp + this.props.getPeriodOffsetSeconds('M1'));
        }
        else if (keys.includes(ARROW_LEFT))
        {
            console.log('<-');
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
        info.push(trans.item);
    }

    handleCreateLog = (logs, trans) =>
    {
        logs.push(trans.item);
    }

    handleTransactions = (dest_timestamp) =>
    {
        let { current_idx, current_timestamp, positions, orders, drawings, info, logs } = this.state;
        const transactions = this.getTransactions();

        if (dest_timestamp === current_timestamp) return;
        else if (dest_timestamp < current_timestamp)
        {
            // Reset all vars and start from beginning
            current_idx = 0;
            positions = orders = info = logs = [];
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
                    this.handleCreateLog(logs, t);
                    break;
            }
        }

        this.setState({ current_idx, current_timestamp, positions, orders, drawings, info, logs });
    }

    // GETTERS

    getStrategyInfo = () =>
    {
        const strategy_id = this.props.id;
        return this.props.getStrategyInfo(strategy_id);
    }

    getTransactions = () =>
    {
        let strategy = this.getStrategyInfo();

        if (strategy !== undefined)
        {
            return strategy.transactions;
        }
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

    getCurrentTimestamp = () =>
    {
        return this.state.current_timestamp;
    }

}

const ARROW_LEFT = 37;
const ARROW_UP = 38;
const ARROW_RIGHT = 39;
const ARROW_DOWN = 40;

const URI = 'http://127.0.0.1:5000';

export default Backtest;