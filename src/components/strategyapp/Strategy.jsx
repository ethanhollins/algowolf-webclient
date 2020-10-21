import React, { Component } from 'react';
import WindowWrapper from './WindowWrapper';
import WindowShadow from './WindowShadow';
import io from 'socket.io-client';
import { faSolarSystem } from '@fortawesome/pro-light-svg-icons';

class Strategy extends Component 
{
    constructor(props)
    {
        super(props);

        this.windows = [];

        this.addWindowsRef = elem => {
            this.windows.push(elem);
        }
    }

    state = {
        sio: undefined,
        current_page: 0,
        hide_shadows: faSolarSystem,
        log: {},
        info: {},
        input_variables: {},
    }

    async componentDidMount()
    {
        this.getStrategyData();
        
        const sio = this.handleSocket();
        this.setState({ sio });
    }

    componentWillUnmount()
    {
        const { sio } = this.state;
        if (sio !== undefined) sio.disconnect();
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
                            updateInfo={this.props.updateInfo}
                            updateInputVariables={this.props.updateInputVariables}
                            getCurrentAccount={this.getCurrentAccount}
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
                            // Other Window Functions
                            getLog={this.getLog}
                            getInfo={this.getInfo}
                            getInputVariables={this.getInputVariables}
                        />
                    )
                }
            }
        }
        return gen_windows;
    }

    getStrategyData()
    {
        let { log, info, input_variables } = this.state;

        const strategy = this.getStrategyInfo();
        // Get Logs
        const loaded_logs = strategy.logs;
        if (loaded_logs !== undefined)
            log = Object.assign({}, log, loaded_logs);

        // Get Info
        const loaded_info = strategy.info;
        if (loaded_info !== undefined)
            info = Object.assign({}, info, loaded_info);

        // Get Control Panel
        const loaded_input_variables = strategy.input_variables;
        if (loaded_input_variables !== undefined)
        input_variables = Object.assign({}, input_variables, loaded_input_variables);

        this.setState({ log, info, input_variables });
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
            for (let k in data)
            {
                // Handle chart important events
                if (data[k].type === 'marketentry')
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
            }

            // Add to transaction history
        });

        socket.on('ongui', (data) =>
        {
            console.log(data);
            if (data.type === 'create_drawing')
            {
                this.createDrawing(data.account_id, data.item.layer, data.item);
            }
            else if (data.type === 'create_drawings')
            {
                for (let d of data.items)
                {
                    this.createDrawing(data.account_id, data.layer, d);
                }
            }
            else if (data.type === 'delete_drawings')
            {
                for (let d of data.items)
                {
                    this.deleteDrawing(data.account_id, data.layer, d);
                }
            }
            else if (data.type === 'delete_drawing_layer')
            {
                this.deleteDrawingLayer(data.account_id, data.layer);
            }
            else if (data.type === 'delete_all_drawings')
            {
                this.deleteAllDrawings(data.account_id);
            }
            else if (data.type === 'create_log')
            {
                this.createLog(data.account_id, data);
            }
            else if (data.type === 'create_info')
            {
                this.createInfo(data.account_id, data);
            }
        });

        return socket;
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

    hideShadows = (hide_shadows) =>
    {
        this.setState({ hide_shadows });
    }

    handleKeys = () =>
    {

    }

    addPosition = (position) =>
    {
        let strategy = this.getStrategyInfo();

        if (strategy !== undefined)
        {
            strategy.positions.push(position);
            this.props.updateStrategyInfo();
        }
    }

    updatePosition = (position) =>
    {
        let strategy = this.getStrategyInfo();

        if (strategy !== undefined)
        {
            for (let j = 0; j < strategy.positions.length; j++)
            {
                if (strategy.positions[j].order_id === position.order_id)
                {
                    strategy.positions[j] = position;
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
            for (let j = 0; j < strategy.positions.length; j++)
            {
                if (strategy.positions[j].order_id === position.order_id)
                    strategy.positions.splice(j, 1);
            }
            this.props.updateStrategyInfo();
        }
    }

    getDrawingIdx = (strategy, account_id, layer, id) =>
    {
        if (strategy !== undefined)
        {
            if (account_id in strategy.drawings)
            {
                const drawings = strategy.drawings[account_id][layer];
                for (let i = 0; i < drawings.length; i++)
                {
                    const d = drawings[i];
                    if (d.id === id) return i;
                }
            }
        }
        return undefined
    }

    createDrawing = (account_id, layer, drawing) =>
    {
        let strategy = this.getStrategyInfo();

        if (strategy !== undefined)
        {
            if (!(account_id in strategy.drawings))
            {
                strategy.drawings[account_id] = {};
            }

            if (!(layer in strategy.drawings[account_id]))
            {
                strategy.drawings[account_id][layer] = [];
            }

            if (this.getDrawingIdx(strategy, account_id, layer, drawing.id) === undefined)
            {
                strategy.drawings[account_id][layer].push(drawing);
            } 
            this.props.updateStrategyInfo();
        }
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

    deleteDrawingLayer = (account_id, layer) =>
    {
        let strategy = this.getStrategyInfo();

        if (strategy !== undefined)
        {
            if (account_id in strategy.drawings)
            {
                if (layer in strategy.drawings[account_id])
                {
                    delete strategy.drawings[layer];
                }
                this.props.updateStrategyInfo();
            }
        }
    }

    deleteAllDrawings = (account_id) =>
    {
        let strategy = this.getStrategyInfo();

        if (strategy !== undefined)
        {
            strategy.drawings = {}
            this.props.updateStrategyInfo();
        }
    }

    createLog = (account_id, data) =>
    {
        let { log } = this.state;

        if (!(account_id in log))
        {
            log[account_id] = [];
        }

        log[account_id].push(data);
        this.setState({ log });
    }

    createInfo = (account_id, data) =>
    {
        let { info } = this.state;
        if (!(data.timestamp in info))
        {
            info[data.timestamp] = [];
        }

        info[data.timestamp].push(data.item);
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

    getDrawings = () =>
    {
        let strategy = this.getStrategyInfo();
        return strategy.drawings;
    }

    getPositions = () =>
    {
        const current_account = this.getCurrentAccount();
        let strategy = this.getStrategyInfo();
        let positions = [];

        if (current_account !== undefined)
        {
            for (let pos of strategy.positions)
            {
                if (pos.account_id === current_account)
                {
                    positions.push(pos);
                }
            }
        }

        return positions;
    }

    getOrders = () =>
    {
        const current_account = this.getCurrentAccount();
        let strategy = this.getStrategyInfo();
        let orders = [];

        if (current_account !== undefined)
        {
            for (let order of strategy.orders)
            {
                if (order.account_id === current_account)
                {
                    orders.push(order);
                }
            }
        }

        return orders;
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
        return null;
    }

    switchAccount = (account_id) =>
    {
        let strategy = this.getStrategyInfo();
        
        if (strategy !== undefined)
        {
            strategy.account = account_id;
            this.props.updateStrategyInfo();
        }
    }

    getAccounts = () =>
    {
        let strategy = this.getStrategyInfo();

        if (strategy !== undefined)
        {
            let accounts = Object.keys(strategy.accounts);
            let start = accounts.splice(accounts.indexOf('papertrader'), 1);
            return start.concat(accounts.sort());
        }
    }

    getCurrentAccount = () =>
    {
        const accounts = this.getAccounts();
        let strategy = this.getStrategyInfo();

        if (accounts !== undefined && accounts.length > 0)
        {
            let current_account = strategy.account;
            if (!accounts.includes(current_account))
            {
                current_account = accounts[0];
                this.switchAccount(current_account);
            }

            return current_account;
        }
    }

}

const ARROW_LEFT = 37;
const ARROW_UP = 38;
const ARROW_RIGHT = 39;
const ARROW_DOWN = 40;

export default Strategy;