import React, { Component } from 'react';
import WindowWrapper from './WindowWrapper';
import WindowShadow from './WindowShadow';
import io from 'socket.io-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine } from '@fortawesome/pro-light-svg-icons';
import { v4 as uuidv4 } from 'uuid';

class Strategy extends Component 
{
    constructor(props)
    {
        super(props);

        this.windows = [];

        this.retrieveAccountInfo = this.retrieveAccountInfo.bind(this);
        this.retrieveReport = this.retrieveReport.bind(this);
        this.setCurrentAccount = this.setCurrentAccount.bind(this);

        this.addWindowsRef = elem => {
            this.windows.push(elem);
        }

        this.gui_queue = [];
    }

    state = {
        sio: undefined,
        hide_shadows: false,
        loaded: [],
        transactions: {},
        positions: [],
        orders: [],
        drawings: {},
        logs: {},
        info: {},
        input_variables: {},
        variables_preset: {},
        selected_chart: null,
        event_queue: [],
        current_idx: 0,
        current_timestamp: 0,
        selected_offset: 0
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

        // await this.props.updatePositions();
        // await this.props.updateOrders();

        await this.setCurrentAccount();
        this.setCurrentGlobalVariablesPreset();

        const sio = this.handleSocket();

        this.setState({ sio });

        this.props.setShowLoadScreen(false);
    }

    componentDidUpdate()
    {
        this.handleEventQueue();
    }

    componentWillUnmount()
    {
        const { sio } = this.state;
        if (sio !== undefined) sio.disconnect();
    }

    render() {
        if (this.getCurrentAccount() !== undefined)
        {
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
        else
        {
            return <React.Fragment />;
        }
    }

    generateShadows()
    {
        const { hide_shadows } = this.state;
        const current_page = this.props.getPage();

        let gen_windows = [];

        const strategy_info = this.props.getStrategyInfo(this.props.id);
        const current_account = this.getCurrentAccount();
        let i = '';
        if (!hide_shadows && strategy_info !== undefined && current_account !== undefined)
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
        const current_account = this.getCurrentAccount();
        let i = '';
        if (strategy_info !== undefined && current_account !== undefined)
        {
            for (i in strategy_info.windows)
            {
                const w = strategy_info.windows[i];
    
                if (w.page === current_page)
                {
                    gen_windows.push(
                        <WindowWrapper
                            key={w.id + '-' + current_account}
                            ref={this.addWindowsRef}
                            info={w}
                            isDemo={this.props.isDemo}
                            strategy_id={this.props.id}
                            removeWindowsRef={this.removeWindowsRef}
                            clone={this.props.clone}
                            getAppContainer={this.props.getAppContainer}
                            getContainerSize={this.props.getContainerSize}
                            convertScreenUnitToWorldUnit={this.props.convertScreenUnitToWorldUnit}
                            convertWorldUnitToScreenUnit={this.props.convertWorldUnitToScreenUnit}
                            getMousePos={this.props.getMousePos}
                            getSize={this.props.getSize}
                            getScale={this.props.getScale}
                            getChartElement={this.props.getChartElement}
                            getStrategyInfo={this.props.getStrategyInfo}
                            updateStrategyInfo={this.props.updateStrategyInfo}
                            getCurrentAccount={this.getCurrentAccount}
                            getKeys={this.props.getKeys}
                            setPopup={this.props.setPopup}
                            getPopup={this.props.getPopup}
                            convertIncomingPositionSize={this.props.convertIncomingPositionSize}
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
                            // History Functions
                            addHistory={this.props.addHistory}
                            getHistory={this.props.getHistory}
                            getLastHistoryAction={this.props.getLastHistoryAction}
                            deleteHistory={this.props.deleteHistory}
                            // Chart Functions
                            connectChart={this.props.connectChart}
                            retrieveChartData={this.props.retrieveChartData}
                            addChart={this.props.addChart}
                            getChart={this.props.getChart}
                            updateChart={this.props.updateChart}
                            findIndicator={this.props.findIndicator}
                            createIndicator={this.props.createIndicator}
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
                            setSelectedOffset={this.setSelectedOffset}
                            getSelectedOffset={this.getSelectedOffset}
                            setSelectedChart={this.setSelectedChart}
                            getSelectedChart={this.getSelectedChart}
                            // Other Window Functions
                            getLog={this.getLog}
                            getInfo={this.getInfo}
                            updateInfo={this.props.updateInfo}
                            getTimezones={this.props.getTimezones}
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

    uint8arrayToString = (myUint8Arr) =>
    {
        return String.fromCharCode.apply(null, myUint8Arr);
    }

    handleSocket()
    {
        const { REACT_APP_STREAM_URL } = process.env;
        const socket = io(`${REACT_APP_STREAM_URL}/user`, {
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
            console.log('connected ' + this.props.id);
            this.subscribe();
        });

        socket.on('disconnect', () =>
        {
            console.log('Disconnected ' + this.props.id)
        });

        socket.on('ontrade', (data) =>
        {
            const { current_timestamp, transactions } = this.state;

            for (let k in data)
            {
                // Handle chart important events
                if (
                    data[k].type === 'marketentry' ||
                    data[k].type === 'stopentry' ||
                    data[k].type === 'limitentry'
                )
                {
                    this.addPosition(
                        data[k].item
                    );
                }
                else if (data[k].type === 'modify')
                {
                    this.updatePosition(
                        data[k].item
                    );
                    this.updateOrder(
                        data[k].item
                    );
                }
                else if (
                    data[k].type === 'positionclose' ||
                    data[k].type === 'stoploss' ||
                    data[k].type === 'takeprofit'
                )
                {
                    this.deletePosition(
                        data[k].item
                    );
                }
                else if (
                    data[k].type === 'stoporder' ||
                    data[k].type === 'limitorder'
                )
                {
                    this.addOrder(
                        data[k].item
                    );
                }
                else if (
                    data[k].type === 'ordercancel'
                )
                {
                    this.deleteOrder(
                        data[k].item
                    );
                }
                transactions[data[k].item.account_id].push(data[k]);
            }

            if (current_timestamp === null)
            {
                this.handleTransactions(current_timestamp);
            }
        });

        socket.on('ongui', this.addToEventQueue);

        return socket;
    }

    addToEventQueue = (data) =>
    {
        let { event_queue } = this.state;
        event_queue.push(data);
        this.setState({ event_queue });
    }

    handleEventQueue = () =>
    {
        let { event_queue } = this.state;
        if (event_queue.length > 0)
        {
            this.onGui(event_queue[0]);
            event_queue.splice(0, 1);
            this.setState({ event_queue });
        }
    }

    handleLiveTransactions = (data, transactions) =>
    {
        if (!(data.account_id in transactions))
        {
            transactions[data.account_id] = [];
        }

        if (data.type === 'create_drawing')
        {
            // this.createDrawing(data.account_id, data.item.layer, data.item);
            transactions[data.account_id].push(data);
            return true;
        }
        else if (data.type === 'create_drawings')
        {
            for (let d of data.items)
            {
                // this.createDrawing(data.account_id, data.layer, d);
                transactions[data.account_id].push(data);
            }
            return true;
        }
        else if (data.type === 'clear_drawing_layer')
        {
            // this.clearDrawingLayer(data.account_id, data.item);
            transactions[data.account_id].push(data);
            return true;
        }
        else if (data.type === 'clear_all_drawings')
        {
            // this.clearAllDrawings(data.account_id);
            transactions[data.account_id].push(data);
            return true;
        }
        else if (data.type === 'create_log')
        {
            // this.createLog(data.account_id, data);
            transactions[data.account_id].push(data);
            return true;
        }
        else if (data.type === 'create_info')
        {
            this.createInfo(data.account_id, data);
        }
        else if (data.type === 'activation')
        {
            this.setActivation(data);
        }

        return false;
    }

    onGui = (data) =>
    {
        let { transactions, current_timestamp } = this.state;
        let update = false;
        if (data.type === 'message_queue')
        {
            for (let i of data.item)
            {
                update = this.handleLiveTransactions(i, transactions) || update;
            }
        }
        else
        {
            update = this.handleLiveTransactions(data, transactions) || update;
        }
        
        if (update && current_timestamp === null)
        {
            this.handleTransactions(current_timestamp);
        }
    }

    subscribe()
    {
        const { sio } = this.state;
        let strategy = this.getStrategyInfo();
        for (let broker_id in strategy.brokers)
        {
            sio.emit(
                'subscribe', 
                {
                    'broker_id': broker_id,
                    'field': 'ontrade'
                }
            );
        }
    }

    hideShadows = (hide_shadows) =>
    {
        this.setState({ hide_shadows });
    }

    handleKeys = () =>
    {
        const keys = this.props.getKeys();
        const { selected_offset } = this.state;
        
        if (keys.includes(ARROW_RIGHT))
        {
            const { current_timestamp } = this.state;
            this.handleTransactions(this.getRoundedTimestamp(current_timestamp + selected_offset));
            // this.updateInfo();
        }
        if (keys.includes(ARROW_LEFT))
        {
            const { current_timestamp } = this.state;
            this.handleTransactions(this.getRoundedTimestamp(current_timestamp - selected_offset));
            // this.updateInfo();
        }
    }

    addPosition = (position) =>
    {
        let strategy = this.getStrategyInfo();

        if (strategy !== undefined)
        {
            const broker_id = this.getCurrentAccount().split('.')[0];
            
            // Delete existing order
            this.deleteOrder(position);

            strategy.brokers[broker_id].positions.push(position);
            this.props.updateStrategyInfo();
        }
    }

    updatePosition = (position) =>
    {
        let strategy = this.getStrategyInfo();

        if (strategy !== undefined)
        {
            const broker_id = this.getCurrentAccount().split('.')[0];

            for (let j = 0; j < strategy.brokers[broker_id].positions.length; j++)
            {
                if (strategy.brokers[broker_id].positions[j].order_id === position.order_id)
                {
                    strategy.brokers[broker_id].positions[j] = position;
                }
            }
            this.props.updateStrategyInfo();
        }
    }

    deletePosition = (position) =>
    {
        let strategy = this.getStrategyInfo();

        if (strategy !== undefined)
        {
            const broker_id = this.getCurrentAccount().split('.')[0];

            for (let j = 0; j < strategy.brokers[broker_id].positions.length; j++)
            {
                if (strategy.brokers[broker_id].positions[j].order_id === position.order_id)
                    strategy.brokers[broker_id].positions.splice(j, 1);
            }
            this.props.updateStrategyInfo();
        }
    }

    addOrder = (order) =>
    {
        let strategy = this.getStrategyInfo();

        if (strategy !== undefined)
        {
            const broker_id = this.getCurrentAccount().split('.')[0];
            
            strategy.brokers[broker_id].orders.push(order);
            this.props.updateStrategyInfo();
        }
    }

    updateOrder = (order) =>
    {
        let strategy = this.getStrategyInfo();

        if (strategy !== undefined)
        {
            const broker_id = this.getCurrentAccount().split('.')[0];

            for (let j = 0; j < strategy.brokers[broker_id].orders.length; j++)
            {
                if (strategy.brokers[broker_id].orders[j].order_id === order.order_id)
                {
                    strategy.brokers[broker_id].orders[j] = order;
                }
            }
            this.props.updateStrategyInfo();
        }
    }

    deleteOrder = (order) =>
    {
        let strategy = this.getStrategyInfo();

        if (strategy !== undefined)
        {
            const broker_id = this.getCurrentAccount().split('.')[0];

            for (let j = 0; j < strategy.brokers[broker_id].orders.length; j++)
            {
                if (strategy.brokers[broker_id].orders[j].order_id === order.order_id)
                    strategy.brokers[broker_id].orders.splice(j, 1);
            }
            this.props.updateStrategyInfo();
        }
    }

    handleCreatePosition = (positions, trans) =>
    {
        positions.push(trans.item);
    }

    handleCreatePositionFromOrder = (positions, orders, trans) =>
    {
        for (let i = 0; i < orders.length; i++)
        {
            if (orders[i].order_id === trans.item.prev.order_id)
            {
                orders.splice(i, 1);
            }
        }
        positions.push(trans.item);
    }

    handleClosePosition = (positions, trans) =>
    {
        for (let i = 0; i < positions.length; i++)
        {
            if (positions[i].order_id === trans.item.order_id)
            {
                positions.splice(i, 1);
            }
        }
    }

    handleCreateOrder = (orders, trans) =>
    {
        orders.push(trans.item);
    }

    handleCancelOrder = (orders, trans) =>
    {
        for (let i = 0; i < orders.length; i++)
        {
            if (orders[i].order_id === trans.item.order_id)
            {
                orders.splice(i, 1);
            }
        }
    }

    handleModify = (positions, orders, trans) =>
    {
        const item = trans.item;
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

    getDrawingIdx = (drawings, account_id, layer, id) =>
    {

        if (account_id in drawings)
        {
            const layer_drawings = drawings[account_id][layer];
            for (let i = 0; i < layer_drawings.length; i++)
            {
                const d = layer_drawings[i];
                if (d.id === id) return i;
            }
        }
        return undefined
    }

    setDrawings = (account_id, data) =>
    {
        let { drawings } = this.state;

        if (!(account_id in drawings))
        {
            drawings[account_id] = {};
        }

        for (let layer in data)
        {
            if (!(layer in drawings[account_id]))
            {
                drawings[account_id][layer] = [];
            }

            for (let drawing of data[layer])
            {
                if (this.getDrawingIdx(drawings, account_id, layer, drawing.id) === undefined)
                {
                    drawings[account_id][layer].push(drawing);
                } 
            }
        }

        this.setState({ drawings });
    }

    createDrawing = (account_id, layer, drawing, drawings) =>
    {
        let update;
        if (!drawings)
        {
            update = true;
            drawings = this.state.drawings;
        }
        else
        {
            update = false;
        }

        if (!(account_id in drawings))
        {
            drawings[account_id] = {};
        }

        if (!(layer in drawings[account_id]))
        {
            drawings[account_id][layer] = [];
        }

        if (this.getDrawingIdx(drawings, account_id, layer, drawing.id) === undefined)
        {
            drawings[account_id][layer].push(drawing);
        }

        if (update)
            this.setState({ drawings });
    }

    deleteDrawing = (account_id, layer, drawing_id) =>
    {
        let strategy = this.getStrategyInfo();

        if (strategy !== undefined)
        {
            const idx = this.getDrawingIdx(strategy, layer, drawing_id);
            if (idx !== undefined)
            {
                strategy.drawings[layer].splice(idx, 1);
            }
            this.props.updateStrategyInfo();
        }
    }

    clearDrawingLayer = (account_id, layer, drawings) =>
    {
        let update;
        if (!drawings)
        {
            update = true;
            drawings = this.state.drawings;
        }
        else
        {
            update = false;
        }

        if (account_id in drawings && layer in drawings[account_id])
        {
            drawings[account_id][layer] = [];
        }

        if (update)
            this.setState({ drawings });
    }

    clearAllDrawings = (account_id, drawings) =>
    {
        let update;
        if (!drawings)
        {
            update = true;
            drawings = this.state.drawings;
        }
        else
        {
            update = false;
        }

        if (account_id in drawings)
        {
            drawings[account_id] = {};
        }

        if (update)
            this.setState({ drawings });
    }

    setLogs = (account_id, data) =>
    {
        let { logs } = this.state;

        if (!(account_id in logs))
        {
            logs[account_id] = [];
        }

        logs[account_id] = logs[account_id].concat(data);
        this.setState({ logs });
    }

    createLog = (account_id, data, logs) =>
    {
        let update;
        if (!logs)
        {
            update = true;
            logs = this.state.logs;
        }
        else
        {
            update = false;
        }

        if (!(account_id in logs))
        {
            logs[account_id] = [];
        }
        logs[account_id].push(data);
        if (update)
            this.setState({ logs });
    }

    setInfo = (account_id, data) =>
    {
        let { info } = this.state;
        info = Object.assign({}, info, data);
        this.setState({ info });
    }

    createInfo = (account_id, data) =>
    {
        let { info } = this.state;

        if (!(data.product in info))
        {
            info[data.product] = {};
        }
        if (!(data.period in info[data.product]))
        {
            info[data.product][data.period] = {};
        }
        if (!(String(data.timestamp) in info[data.product][data.period]))
        {
            info[data.product][data.period][String(data.timestamp)] = [];
        }

        info[data.product][data.period][String(data.timestamp)].push(data.item);
        this.setState({ info });
    }

    handleTransactions = (dest_timestamp) =>
    {
        // TODO:
        //  - BLOCK LIVE TRANSACTION UPDATES IF CURRENT TIMESTAMP NOT NULL
        //  - ADD LIVE TRANSACTIONS TO TRANSACTION LIST THEN USE handleTransactions to update
        //  - HANDLE POSITION/ORDER EVENTS. Options:
        //        - SAVE AND SEND MSG DIRECTLY FROM API 
        //          (THIS ALLOWS LOOKING BACKWARDS WITH SCRIPT NOT RUNNING e.g manual)
        //  - HANDLE ON TRADE (ADD TO TRANSACTIONS)
        const account_code = this.getCurrentAccount();
        let { current_idx, current_timestamp, drawings, logs, positions, orders, transactions } = this.state;
        
        if (current_timestamp !== null && dest_timestamp === current_timestamp) return;
        else if (
            (dest_timestamp !== null && current_timestamp === null) ||
            dest_timestamp < current_timestamp
        )
        {
            // Reset all vars and start from beginning
            current_idx = 0;
            logs[account_code] = [];
            drawings[account_code] = {};
        }
        current_timestamp = dest_timestamp;
        if (account_code in transactions)
        {
            transactions = transactions[account_code];
            for (current_idx; current_idx < transactions.length; current_idx++)
            {
                const t = transactions[current_idx];
                if (!t) continue;
                
                if (current_timestamp && t.timestamp > current_timestamp) break;
                
                switch (t.type)
                {
                    case 'marketentry':
                        this.handleCreatePositionFromOrder(positions, orders, t);
                        break;
                    case 'limitentry':
                    case 'stopentry':
                        this.handleCreatePositionFromOrder(positions, orders, t);
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
                        this.createDrawing(account_code, t.item.layer, t.item, drawings);
                        break;
                    case 'clear_drawing_layer':
                        this.clearDrawingLayer(account_code, t.item, drawings);
                        break;
                    case 'clear_all_drawings':
                        this.clearAllDrawings(account_code, drawings);
                        break;
                    case 'create_log':
                        this.createLog(account_code, t, logs);
                        break;
                }
            }
            
            this.setState({ current_idx, current_timestamp, drawings, logs, positions, orders });
        }
    }

    getRoundedTimestamp = (timestamp) =>
    {
        const { reference_timestamp, selected_offset } = this.state;
        return timestamp - (timestamp - reference_timestamp) % selected_offset
    }

    setActivation = (data) =>
    {
        let strategy = this.getStrategyInfo();

        if (strategy !== undefined)
        {
            for (let account_id in data.accounts)
            {
                strategy.brokers[data.broker_id].accounts[account_id].strategy_status = data.accounts[account_id];
            }
            this.props.updateStrategyInfo();
        }
    }

    getStrategyInfo = () =>
    {
        const strategy_id = this.props.id;
        return this.props.getStrategyInfo(strategy_id);
    }

    getWindows = () =>
    {
        return this.windows;
    }

    getPositions = () =>
    {
        let strategy = this.getStrategyInfo();
        let positions = [];

        if (strategy !== undefined)
        {
            let current_account = this.getCurrentAccount();
            const broker_id = current_account.split('.')[0];
            const account_id = current_account.split('.')[1];

            for (let pos of strategy.brokers[broker_id].positions)
            {
                if (pos.account_id === account_id)
                {
                    positions.push(pos);
                }
            }
        }

        return positions;
    }

    getOrders = () =>
    {
        let strategy = this.getStrategyInfo();
        let orders = [];

        if (strategy !== undefined)
        {
            let current_account = this.getCurrentAccount();
            const broker_id = current_account.split('.')[0];
            const account_id = current_account.split('.')[1];

            for (let order of strategy.brokers[broker_id].orders)
            {
                if (order.account_id === account_id)
                {
                    orders.push(order);
                }
            }
        }

        return orders;
    }

    getDrawings = () =>
    {
        let current_account = this.getCurrentAccount();
        if (current_account in this.state.drawings)
        {
            return this.state.drawings[current_account];
        }
        
        return {};
    }

    getLog = () =>
    {
        let current_account = this.getCurrentAccount();
        
        if (current_account in this.state.logs)
        {
            return this.state.logs[current_account];
        }
        return {};
    }

    getInfo = (product, period) =>
    {
        const { info } = this.state;
        if (product in info)
        {
            if (period in info[product])
            {
                return info[product][period];
            }
        }
        return {};
    }

    getGlobalInputVariables = () =>
    {
        const strategy = this.getStrategyInfo();
        
        if (strategy.input_variables !== undefined)
        {
            return strategy.input_variables;
        }
        return {};
    }

    getLocalInputVariables = () =>
    {
        let current_account = this.getCurrentAccount();
        if (current_account in this.state.input_variables)
        {
            return this.state.input_variables[current_account];
        }
        return {};
    }

    getCurrentTimestamp = () =>
    {
        return null;
    }

    switchAccount = (account_id) =>
    {
        let strategy = this.getStrategyInfo();
        
        if (strategy !== undefined)
        {
            strategy.account = account_id;
            this.props.updateStrategyInfo();
            this.setCurrentLocalVariablesPreset();
        }
    }

    getBrokers = () =>
    {
        const strategy = this.getStrategyInfo();

        if (strategy !== undefined)
        {
            let accounts = Object.keys(strategy.brokers);
            let start = accounts.splice(accounts.indexOf(this.props.id), 1);
            return start.concat(accounts.sort());
        }
    }

    getAccounts = (broker_id) =>
    {
        let strategy = this.getStrategyInfo();
        if (strategy !== undefined)
        {
            return Object.keys(strategy.brokers[broker_id].accounts);
        }
    }

    getCurrentAccount = () =>
    {
        const strategy = this.getStrategyInfo();
        const brokers = this.getBrokers();

        if (brokers !== undefined && strategy.account !== undefined)
        {
            let current = strategy.account.split('.');
            if (current.length >= 2)
            {
                const broker_id = current[0];
                const current_account = current[1];
                const accounts = this.getAccounts(broker_id);
                if (accounts !== undefined && accounts.includes(current_account))
                {
                    return strategy.account;
                }
            }
        }
    }

    setSelectedOffset = (reference_timestamp, selected_offset) =>
    {
        this.setState({ reference_timestamp, selected_offset });
    }

    getSelectedOffset = () =>
    {
        return this.state.selected_offset;
    }

    getCurrentTimestamp = () =>
    {
        return this.state.current_timestamp;
    }

    setCurrentTimestamp = (current_timestamp) =>
    {
        this.handleTransactions(current_timestamp);
    }

    async setCurrentAccount()
    {
        let current_account = this.getCurrentAccount();
        let strategy = this.getStrategyInfo();

        if (current_account === undefined)
        {
            strategy.account = this.props.id + '.papertrader';
            this.props.updateStrategyInfo();
        }

        await this.retrieveAccountInfo(strategy.account);
    }

    getAllCurrentInputVariables = () =>
    {
        const global_preset = this.getCurrentGlobalVariablesPreset();
        const local_preset = this.getCurrentLocalVariablesPreset();
        
        return Object.assign({}, 
            this.getGlobalInputVariables()[global_preset], 
            this.getLocalInputVariables()[local_preset]
        );
    }

    updateInputVariables = (local_variables, global_variables) =>
    {
        // Update Strategy Variables
        this.props.updateStrategyInputVariables(this.props.id, global_variables);

        // Update Account Variables
        let { accounts } = this.state;
        const current_account = this.getCurrentAccount();
        const broker_id = current_account.split('.')[0];
        const account_id = current_account.split('.')[1];
        const local_result = this.props.updateAccountInputVariables(this.props.id, broker_id, account_id, local_variables);

        for (let name in local_result)
        {
            accounts[current_account].input_variables[name] = local_result[name];
        }
        this.setState({ accounts });
    }

    setLocalInputVariables = (account_id, data) =>
    {
        let { input_variables } = this.state;
        input_variables[account_id] = data;
        this.setState({ input_variables });
    }

    getCurrentGlobalVariablesPreset = () =>
    {
        const strategy = this.getStrategyInfo();

        if (strategy !== undefined && strategy.variables_preset !== undefined)
        {
            return strategy.variables_preset;
        }
    }

    setCurrentGlobalVariablesPreset = () =>
    {
        let preset = this.getCurrentGlobalVariablesPreset();

        if (preset === undefined)
        {
            let strategy = this.getStrategyInfo();
            if (Object.keys(strategy.input_variables).length > 0)
            {
                strategy.variables_preset = Object.keys(strategy.input_variables)[0];
            }
            this.props.updateStrategyInfo();
        }
    }

    getCurrentLocalVariablesPreset = () =>
    {
        let current_account = this.getCurrentAccount();
        
        if (current_account in this.state.variables_preset)
        {
            return this.state.variables_preset[current_account];
        }
    }

    setCurrentLocalVariablesPreset = () =>
    {
        let { variables_preset } = this.state;

        let preset = this.getCurrentLocalVariablesPreset();
        if (preset === undefined)
        {
            const input_variables = this.getLocalInputVariables();
            if (Object.keys(input_variables).length > 0)
            {
                let current_account = this.getCurrentAccount();
                variables_preset[current_account] = Object.keys(input_variables)[0];
                this.setState({ variables_preset });
            }
        }
    }

    switchLocalVariablesPreset = (account_id, data) =>
    {
        let { variables_preset } = this.state;
        variables_preset[account_id] = data;
        this.setState({ variables_preset });
    }

    setSelectedChart = (selected_chart) =>
    {
        this.setState({ selected_chart });
    }

    getSelectedChart = () =>
    {
        return this.state.selected_chart;
    }

    async retrieveAccountInfo(account_code)
    {
        let { loaded, transactions } = this.state;

        if (!loaded.includes(account_code))
        {
            const broker_id = account_code.split('.')[0];
            const account_id = account_code.split('.')[1];
            const account_info = await this.props.retrieveAccountInfo(this.props.id, broker_id, account_id);
    
            // Set Account Info
            if (account_info.transactions !== undefined)
            {
                if (account_code in transactions)
                {
                    transactions[account_code] = account_info.transactions.concat(transactions[account_code]);
                }
                else
                {
                    transactions[account_code] = account_info.transactions;
                }
            }
            // if (account_info.drawings !== undefined)
            //     this.setDrawings(account_code, account_info.drawings);
            // if (account_info.logs !== undefined)
            //     this.setLogs(account_code, account_info.logs);
            if (account_info.info !== undefined)
                this.setInfo(account_code, account_info.info);
            if (account_info.input_variables !== undefined)
                this.setLocalInputVariables(account_code, account_info.input_variables);
            if (account_info.preset !== undefined)
                this.switchLocalVariablesPreset(account_code, account_info.preset);
            else
                this.setCurrentLocalVariablesPreset();
    
            loaded.push(account_code);
            this.setState({ loaded, transactions });
            this.setCurrentTimestamp(null);
        }
    }

    async retrieveReport(name)
    {
        const account_code = this.getCurrentAccount();
        const broker_id = account_code.split('.')[0];
        const account_id = account_code.split('.')[1];

        return await this.props.retrieveReport(this.props.id, broker_id, account_id, name);
    }

    isLoaded = () =>
    {
        return this.state.loaded.includes(this.getCurrentAccount());
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

export default Strategy;