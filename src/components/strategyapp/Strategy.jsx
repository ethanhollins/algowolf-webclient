import React, { Component } from 'react';
import WindowWrapper from './WindowWrapper';
import WindowShadow from './WindowShadow';
import io from 'socket.io-client';

class Strategy extends Component 
{
    state = {
        sio: undefined,
        current_page: 0,
        hide_shadows: false
    }

    componentDidMount()
    {
        const sio = this.handleSocket();
        this.setState({ sio });
    }

    componentWillUnmount()
    {
        const { sio } = this.state;
        sio.disconnect();
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
                            hideShadows={this.hideShadows}
                            // History Functions
                            addHistory={this.props.addHistory}
                            getHistory={this.props.getHistory}
                            getLastHistoryAction={this.props.getLastHistoryAction}
                            deleteHistory={this.props.deleteHistory}
                            // Chart Functions
                            retrieveChartData={this.props.retrieveChartData}
                            addChart={this.props.addChart}
                            getChart={this.props.getChart}
                            updateChart={this.props.updateChart}
                            getIndicator={this.props.getIndicator}
                            calculateIndicator={this.props.calculateIndicator}
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

    ontrade = (data) =>
    {
        
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

    getDrawingIdx = (layer, id) =>
    {
        let strategy = this.getStrategyInfo();

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
        let strategy = this.getStrategyInfo();

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
        let strategy = this.getStrategyInfo();

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
        let strategy = this.getStrategyInfo();

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
        let strategy = this.getStrategyInfo();

        if (strategy !== undefined)
        {
            strategy.drawings = {}
            this.props.updateStrategyInfo();
        }
    }

    getStrategyInfo = () =>
    {
        const strategy_id = this.props.id;
        return this.props.getStrategyInfo(strategy_id);
    }

    getDrawings = () =>
    {
        let strategy = this.getStrategyInfo();
        return strategy.drawings;
    }

    getPositions = () =>
    {
        let strategy = this.getStrategyInfo();
        return strategy.positions;
    }

    getOrders = () =>
    {
        let strategy = this.getStrategyInfo();
        return strategy.orders;
    }

    getCurrentTimestamp = () =>
    {
        return null;
    }

}

const ARROW_LEFT = 37;
const ARROW_UP = 38;
const ARROW_RIGHT = 39;
const ARROW_DOWN = 40;

const URI = 'http://127.0.0.1:5000';

export default Strategy;