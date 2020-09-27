import React, { Component } from 'react';
import WindowWrapper from './WindowWrapper';
import WindowShadow from './WindowShadow';
import io from 'socket.io-client';

class Backtest extends Component 
{
    state = {
        sio: undefined,
        current_page: 0,
        start: undefined,
        end: undefined
    }

    componentDidMount()
    {
        // const sio = this.handleSocket();
        // this.setState({ sio });
    }

    componentWillUnmount()
    {
        // const { sio } = this.state;
        // sio.disconnect();
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
            if (data.type === 'create_drawings')
            {
                for (let d of data.items)
                {
                    this.createDrawing(data.layer, d);
                }
            }
            else if (data.type === 'delete_drawings')
            {
                for (let d of data.items)
                {
                    this.deleteDrawing(data.layer, d);
                }
            }
            else if (data.type === 'delete_drawing_layer')
            {
                this.deleteDrawingLayer(data.layer);
            }
            else if (data.type === 'delete_all_drawings')
            {
                this.deleteAllDrawings();
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

    addPosition = (position) =>
    {
        const strategy_id = this.props.id;
        let strategy = this.props.getStrategyInfo(strategy_id);

        if (strategy !== undefined)
        {
            strategy.positions.push(position);
            this.props.updateStrategyInfo();
        }
    }

    updatePosition = (position) =>
    {
        const strategy_id = this.props.id;
        let strategy = this.props.getStrategyInfo(strategy_id);

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
        const strategy_id = this.props.id;
        let strategy = this.props.getStrategyInfo(strategy_id);

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

    getDrawingIdx = (layer, id) =>
    {
        const strategy_id = this.props.id;
        let strategy = this.props.getStrategyInfo(strategy_id);

        if (strategy !== undefined)
        {
            const drawings = strategy.drawings[layer];
            for (let i = 0; i < drawings.length; i++)
            {
                const d = drawings[i];
                if (d.id === id) return i;
            }
        }
        return undefined
    }

    createDrawing = (layer, drawing) =>
    {
        const strategy_id = this.props.id;
        let strategy = this.props.getStrategyInfo(strategy_id);

        if (strategy !== undefined)
        {
            if (this.getDrawingIdx(layer, drawing.id) === undefined)
            {
                strategy.drawings[layer].push(drawing);
            } 
            this.props.updateStrategyInfo();
        }
    }

    deleteDrawing = (layer, drawing_id) =>
    {
        const strategy_id = this.props.id;
        let strategy = this.props.getStrategyInfo(strategy_id);

        if (strategy !== undefined)
        {
            const idx = this.getDrawingIdx(layer, drawing_id);
            if (idx !== undefined)
            {
                strategy.drawings[layer].splice(idx, 1);
            }
            this.props.updateStrategyInfo();
        }
    }

    deleteDrawingLayer = (layer) =>
    {
        const strategy_id = this.props.id;
        let strategy = this.props.getStrategyInfo(strategy_id);

        if (strategy !== undefined)
        {
            if (layer in strategy.drawings)
            {
                delete strategy.drawings[layer];
            }
            this.props.updateStrategyInfo();
        }
    }

    deleteAllDrawings = () =>
    {
        const strategy_id = this.props.id;
        let strategy = this.props.getStrategyInfo(strategy_id);

        if (strategy !== undefined)
        {
            strategy.drawings = {}
            this.props.updateStrategyInfo();
        }
    }

}

const URI = 'http://127.0.0.1:5000';

export default Backtest;