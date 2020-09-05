import React, { Component } from 'react';
import Indicators from './strategyapp/Indicators';
import io from 'socket.io-client';
import Chart from './strategyapp/windows/chart/Chart';
import moment from "moment-timezone";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCircle
} from '@fortawesome/pro-solid-svg-icons';
import { 
    faBars, faHandshakeAlt, faChartLine, faChartPie, 
    faLightbulb, faCode, faHistory, faChevronRight, faChevronDown
} from '@fortawesome/pro-regular-svg-icons';
import { 
    faTimes, faPlus, faSort, faReceipt, faSlidersVSquare, faCode as faCodeLight,
    faFileInvoice, faChartBar, faTools, faTicketAlt, faLayerGroup, faHandshakeAltSlash,
    faHandPaper, faQuestionCircle, faHandshakeAlt as faHandshakeAltLight
} from '@fortawesome/pro-light-svg-icons'
import Strategy from './strategyapp/Strategy';

class StrategyApp extends Component
{
    state = {
        sio: null,
        account: {},
        strategy_info: {},
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

        this.setActivationElem = elem => {
            this.activationElem = elem;
        }
        this.setActivationDropdown = elem => {
            this.activationDropdown = elem;
        }
        this.setChartsElem = elem => {
            this.chartsElem = elem;
        }
        this.setChartsDropdown = elem => {
            this.chartsDropdown = elem;
        }
        this.setStatsElem = elem => {
            this.statsElem = elem;
        }
        this.setStatsDropdown = elem => {
            this.statsDropdown = elem;
        }
        this.setUtilsElem = elem => {
            this.utilsElem = elem;
        }
        this.setUtilsDropdown = elem => {
            this.utilsDropdown = elem;
        }
        this.setScriptElem = elem => {
            this.scriptElem = elem;
        }
        this.setBacktestElem = elem => {
            this.backtestElem = elem;
        }

    }

    async componentDidMount()
    {
        const user_id = await this.props.checkAuthorization();
        this.props.setUserId(user_id);

        if (user_id !== null)
        {
            let { sio } = this.state;
    
            // Connect to API socket
            // sio = this.handleSocket();
            // this.setState({ sio });
            
            // Retrieve user specific strategy informations
            const account = await this.retrieveGuiInfo();
            await this.retrieveStrategies(account.metadata.open_strategies);
        }
    }

    render()
    {
        if (this.props.getUserId !== null)
        {
            return (
                <div className='main container'>
    
                <div className='chart_app'>
                    <div 
                        ref={this.setAppContainerRef}
                        className='app container'
                    >
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
                    
    
                    <div className='toolbox body noselect' onDragStart={this.onDragStart}>
                        <div>
                            <div className='toolbox item row'>
                                <FontAwesomeIcon className='toolbox icon' icon={faBars} />
                            </div>
                            <div className='toolbox item row'>
                                <span className='toolbox label right-space'>Account: ZVS567</span>
                                <div className='toolbox item btn'>
                                    <FontAwesomeIcon className='toolbox selection-icon' icon={faChevronDown} />
                                </div>
                            </div>
                            <div className='toolbox item right-space'>
                                <div ref={this.setActivationElem} className='toolbox item row btn'>
                                    <FontAwesomeIcon className='toolbox icon red_btn' icon={faHandshakeAlt} />
                                    <span className='toolbox label'>Go Live</span>
                                </div>
                                <div className='toolbox item btn' onClick={this.onActivationDropdown}>
                                    <FontAwesomeIcon className='toolbox selection-icon' icon={faChevronDown} />
                                </div>
                                <div ref={this.setActivationDropdown} className='toolbox dropdown' style={{display: 'none'}}>
                                    <div>
                                        <span className='toolbox left'>
                                            <FontAwesomeIcon icon={faHandshakeAltLight} className='toolbox left-icon' /><span>Go Live</span>
                                        </span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faQuestionCircle} className='toolbox right-icon' /></span>
                                    </div>
                                   <div>
                                        <span className='toolbox left'>
                                            <FontAwesomeIcon icon={faHandshakeAltSlash} className='toolbox left-icon' /><span>Go Offline</span>
                                        </span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faQuestionCircle} className='toolbox right-icon' /></span>
                                    </div>
                                    <div>
                                        <span className='toolbox left'>
                                            <FontAwesomeIcon icon={faHandPaper} className='toolbox left-icon' /><span>Stop Trading</span>
                                        </span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faQuestionCircle} className='toolbox right-icon' /></span>
                                    </div>
                                </div>
                            </div>
                            <div className='toolbox item row status'>
                                <FontAwesomeIcon className='toolbox icon' icon={faCircle} />
                                <span className='toolbox label'>Papertrading</span>
                            </div>
                            <div className='toolbox separator' />
                            <div className='toolbox item'>
                                <div ref={this.setChartsElem} className='toolbox item row btn' onClick={this.onChartsDropdown}>
                                    <FontAwesomeIcon className='toolbox icon green_btn' icon={faChartLine} />
                                    <span className='toolbox label'>Charts</span>
                                </div>
                                <div ref={this.setChartsDropdown} className='toolbox dropdown' style={{display: 'none'}}>
                                    <div>
                                        <span className='toolbox left'>Cryptocurrencies</span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon' /></span>
                                    </div>
                                    <div>
                                        <span className='toolbox left'>Currencies</span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon' /></span>
                                    </div>
                                    <div>
                                        <span className='toolbox left'>Stocks</span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon' /></span>
                                    </div>
                                    <div>
                                        <span className='toolbox left'>Indicies</span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon' /></span>
                                    </div>
                                    <div>
                                        <span className='toolbox left'>Futures</span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon' /></span>
                                    </div>
                                    <div>
                                        <span className='toolbox left'>Bonds</span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon' /></span>
                                    </div>
                                </div>
                            </div>
                            <div className='toolbox item'>
                                <div ref={this.setStatsElem} className='toolbox item row btn' onClick={this.onStatsDropdown}>
                                    <FontAwesomeIcon className='toolbox icon purple_btn' icon={faChartPie} />
                                    <span className='toolbox label'>Stats</span>
                                </div>
                                <div ref={this.setStatsDropdown} className='toolbox dropdown' style={{display: 'none'}}>
                                    <div>
                                        <span className='toolbox left'>
                                            <FontAwesomeIcon icon={faChartBar} className='toolbox left-icon' /><span>Graphs</span>
                                        </span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon' /></span>
                                    </div>
                                    <div>
                                        <span className='toolbox left'>
                                            <FontAwesomeIcon icon={faFileInvoice} className='toolbox left-icon' /><span>Reports</span>
                                        </span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon' /></span>
                                    </div>
                                </div>
                            </div>
                            <div className='toolbox item'>
                                <div ref={this.setUtilsElem} className='toolbox item row btn' onClick={this.onUtilsDropdown}>
                                    <FontAwesomeIcon className='toolbox icon yellow_btn' icon={faLightbulb} />
                                    <span className='toolbox label'>Utilities</span>
                                </div>
                                <div ref={this.setUtilsDropdown} className='toolbox dropdown' style={{display: 'none'}}>
                                    <div>
                                        <span className='toolbox left'>
                                            <FontAwesomeIcon icon={faSort} className='toolbox left-icon' /><span>Positions/Orders</span>
                                        </span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faPlus} className='toolbox right-icon' /></span>
                                    </div>
                                    <div>
                                        <span className='toolbox left'>
                                            <FontAwesomeIcon icon={faTicketAlt} className='toolbox left-icon' /><span>Ticket</span>
                                        </span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faPlus} className='toolbox right-icon' /></span>
                                    </div>
                                    <div>
                                        <span className='toolbox left'>
                                            <FontAwesomeIcon icon={faReceipt} className='toolbox left-icon' /><span>Transactions</span>
                                        </span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faPlus} className='toolbox right-icon' /></span>
                                    </div>
                                    <div>
                                        <span className='toolbox left'>
                                            <FontAwesomeIcon icon={faSlidersVSquare} className='toolbox left-icon' /><span>Control Center</span>
                                        </span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faPlus} className='toolbox right-icon' /></span>
                                    </div>
                                    <div>
                                        <span className='toolbox left'>
                                            <FontAwesomeIcon icon={faLayerGroup} className='toolbox left-icon' /><span>Drawing Layers</span>
                                        </span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faPlus} className='toolbox right-icon' /></span>
                                    </div>
                                    <div>
                                        <span className='toolbox left'>
                                            <FontAwesomeIcon icon={faTools} className='toolbox left-icon' /><span>Toolbox</span>
                                        </span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faPlus} className='toolbox right-icon' /></span>
                                    </div>
                                    <div>
                                        <span className='toolbox left'>
                                            <FontAwesomeIcon icon={faCodeLight} className='toolbox left-icon' /><span>Script Editor</span>
                                        </span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faPlus} className='toolbox right-icon' /></span>
                                    </div>
                                </div>
                            </div>
                            <div className='toolbox separator' />
                            <div className='toolbox item'>
                                <div ref={this.setScriptElem} className='toolbox item row btn'>
                                    <FontAwesomeIcon className='toolbox icon orange_btn' icon={faCode} />
                                    <span className='toolbox label'>Script</span>
                                </div>
                            </div>
                            <div className='toolbox item'>
                                <div ref={this.setBacktestElem} className='toolbox item row btn'>
                                    <FontAwesomeIcon className='toolbox icon blue_btn' icon={faHistory} />
                                    <span className='toolbox label'>Backtest</span>
                                </div>
                            </div>
                        </div>
                        {/* {this.generateActivationButtons()} */}
                    </div> 
                    <div className='toolbox_shadow'/> 
                </div>
    
                </div>
            );
        }
        else
        {
            return <React.Fragment />;
        }
        
    }

    onDragStart(e)
    {
        e.preventDefault();
    }

    generateStrategyTabs = () =>
    {
        const { account, strategy_info } = this.state;
        let tabs = [];
        if (Object.keys(strategy_info).length > 0)
        {
            let i = '';
            for (i in strategy_info)
            {
                const s = strategy_info[i];
                let className = 'tab item';
                if (account.metadata.current_strategy === i)
                {
                    className += ' selected'
                }
                tabs.push(
                    <div key={i} className={className}>
                        {s.name}
                        <FontAwesomeIcon className='tab btn' icon={faTimes} />
                    </div>
                );      
            }
        }

        return tabs;
    }

    // generateActivationButtons()
    // {
    //     let { account, strategy_info, statusMsg } = this.state;
    //     if (account.metadata !== undefined)
    //     {
    //         const current_strategy = account.metadata.current_strategy;
    //         if (strategy_info[current_strategy] !== undefined)
    //         {
    //             const status = this.getStrategyAccountStatus(
    //                 current_strategy, 
    //                 Object.keys(strategy_info[current_strategy].accounts)[0]
    //             );

    //             if (status === 'live')
    //             {   
    //                 if (statusMsg === undefined) statusMsg = 'Live';
    //                 let status_class_name = 'live_status';
    //                 if (statusMsg !== 'Live') status_class_name = 'working_status'
                        
    //                 return (
    //                     <React.Fragment>
    //                         <span className='toolbox-space'/>

    //                         <div className='toolbox-item' id='orange_btn' onClick={this.goOffline.bind(this)} >
    //                             <FontAwesomeIcon 
    //                                 className='toolbox-btn' 
    //                                 icon={faHandshakeSlash} 
    //                                 width={Math.round(2.1*(640/512))+'vh'} 
    //                                 height='2.1vh' 
    //                             />
    //                             <span className='toolbox-label'>
    //                                 Go Offline
    //                             </span>
    //                         </div>

    //                         <span className='toolbox-space'/>
    
    //                         <div className='toolbox-item' id='red_btn' onClick={this.terminate.bind(this)} >
    //                             <FontAwesomeIcon 
    //                                 className='toolbox-item toolbox-btn' 
    //                                 icon={faStopCircle} 
    //                                 width={Math.round(2.1*(512/512))+'vh'} 
    //                                 height='2.1vh' 
    //                             />
    //                             <span className='toolbox-label'>
    //                                 Terminate
    //                             </span>
    //                         </div>

    //                         <span className='toolbox-space'/>

    //                         <div className='toolbox-item' id={status_class_name} >
    //                             <FontAwesomeIcon 
    //                                 className='toolbox-item toolbox-btn' 
    //                                 icon={faCircle} 
    //                                 width='0.8vh' 
    //                                 height='0.8vh' 
    //                             />
    //                         </div>
    //                         <div ref={this.setStatusIndicator} className='toolbox-item' id={status_class_name} >
    //                             <span className='status-label'>
    //                                 {statusMsg}
    //                             </span>
    //                         </div>
    //                     </React.Fragment>
    //                 );
    //             }
    //             else if (status === 'offline') 
    //             {
    //                 if (statusMsg === undefined) statusMsg = 'Offline';
    //                 let status_class_name = 'offline_status';
    //                 if (statusMsg !== 'Offline') status_class_name = 'working_status'

    //                 return (
    //                     <React.Fragment>
    //                         <span className='toolbox-space'/>
                            
    //                         <div className='toolbox-item' id='blue_btn' onClick={this.goLive.bind(this)}>
    //                             <FontAwesomeIcon 
    //                                 className='toolbox-btn'
    //                                 icon={faHandshake} 
    //                                 width={Math.round(2.25*(640/512))+'vh'} 
    //                                 height='2.25vh' 
    //                             />
    //                             <span className='toolbox-label'>
    //                                 Go Live
    //                             </span>
    //                         </div>
    
    //                         <span className='toolbox-space'/>
    
    //                         <div className='toolbox-item' id='red_btn' onClick={this.terminate.bind(this)} >
    //                             <FontAwesomeIcon 
    //                                 className='toolbox-item toolbox-btn' 
    //                                 icon={faStopCircle} 
    //                                 width={Math.round(2.1*(512/512))+'vh'} 
    //                                 height='2.1vh' 
    //                             />
    //                             <span className='toolbox-label'>
    //                                 Terminate
    //                             </span>
    //                         </div>

    //                         <span className='toolbox-space'/>

    //                         <div className='toolbox-item' id={status_class_name} >
    //                             <FontAwesomeIcon 
    //                                 className='toolbox-item toolbox-btn' 
    //                                 icon={faCircle} 
    //                                 width='0.8vh' 
    //                                 height='0.8vh' 
    //                             />
    //                         </div>
    //                         <div ref={this.setStatusIndicator} className='toolbox-item' id={status_class_name} >
    //                             <span className='status-label'>
    //                                 {statusMsg}
    //                             </span>
    //                         </div>
    //                     </React.Fragment>
    //                 );
    //             }
    //         }

    //     }
    //     return;
    // }

    generateStrategy()
    {
        let { account } = this.state;

        if ('metadata' in account)
        {
            const current_strategy = account.metadata.current_strategy;
            if (account.metadata.open_strategies.includes(current_strategy))
            {
                return <Strategy
                    id={current_strategy}
                    getAppContainer={this.getAppContainer}
                    getScale={this.getScale}
                    getStrategyInfo={this.getStrategyInfo}
                    getChartElement={this.getChartElement}
                    // Window Funcs
                    closeWindow={this.closeWindow}
                />
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

    onActivationDropdown = (e) =>
    {
        if (this.activationDropdown.style.display === 'none')
        {
            this.activationDropdown.style.display = 'block';
            const btn_rect = this.activationElem.getBoundingClientRect();
            this.activationDropdown.style.left = parseInt(btn_rect.x) + 'px';
        }
        else
        {
            this.activationDropdown.style.display = 'none';
        }
    }

    onChartsDropdown = (e) =>
    {
        if (this.chartsDropdown.style.display === 'none')
        {
            this.chartsDropdown.style.display = 'block';
            const btn_rect = this.chartsElem.getBoundingClientRect();
            this.chartsDropdown.style.left = parseInt(btn_rect.x) + 'px';
        }
        else
        {
            this.chartsDropdown.style.display = 'none';
        }
    }

    onStatsDropdown = (e) =>
    {
        if (this.statsDropdown.style.display === 'none')
        {
            this.statsDropdown.style.display = 'block';
            const btn_rect = this.statsElem.getBoundingClientRect();
            this.statsDropdown.style.left = parseInt(btn_rect.x) + 'px';
        }
        else
        {
            this.statsDropdown.style.display = 'none';
        }
    }

    onUtilsDropdown = (e) =>
    {
        if (this.utilsDropdown.style.display === 'none')
        {
            this.utilsDropdown.style.display = 'block';
            const btn_rect = this.utilsElem.getBoundingClientRect();
            this.utilsDropdown.style.left = parseInt(btn_rect.x) + 'px';
        }
        else
        {
            this.utilsDropdown.style.display = 'none';
        }
    }

    onBacktestDropdown = (e) =>
    {
        if (this.backtestDropdown.style.display === 'none')
        {
            this.backtestDropdown.style.display = 'block';
            const btn_rect = this.backtestElem.getBoundingClientRect();
            this.backtestDropdown.style.left = parseInt(btn_rect.x) + 'px';
        }
        else
        {
            this.backtestDropdown.style.display = 'none';
        }
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
                Object.keys(this.state.strategy_info)
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
        let { account, username } = this.state;

        const reqOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'username': username
            },
            credentials: 'include'
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
        let { strategy_info, username } = this.state;

        /** Retrieve strategy info */
        const reqOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'username': username
            },
            credentials: 'include'
        }

        for (let i = 0; i < strategy_ids.length; i++)
        {
            strategy_info[strategy_ids[i]] = await fetch(
                `${URI}/v1/strategy/` +
                strategy_ids[i] + '/gui',
                reqOptions
            )
                .then(res => res.json());
        }

        // this.subscribeStrategies(strategy_ids);

        this.setState({ strategy_info });
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
                const uri = `${URI}/v1/prices/oanda/\
                ${product}/${period}\
                ?from=${from.format('YYYY-MM-DDTHH:mm:ss')}Z\
                &to=${to.format('YYYY-MM-DDTHH:mm:ss')}Z\
                &tz=${tz}`.replace(/\s/g, '');
                return await fetch(uri)
                    .then(res => res.json());
            }
            else
            {
                const uri = `${URI}/v1/prices/oanda/\
                ${product}/${period}\
                ?from=${from.format('YYYY-MM-DDTHH:mm:ss')}Z\
                &count=1000&tz=${tz}`.replace(/\s/g, '');

                return await fetch(uri)
                    .then(res => res.json());
            }
        }
        else
        {
            const uri = `${URI}/v1/prices/oanda/\
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

        // this.connectChart(product, period);
        
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
            `${URI}/v1/strategy/${strategy_id}/${new_status}?accounts=${accounts.join(',')}`,
            reqOptions
        );

        let { account, strategy_info, statusMsg } = this.state;

        if (res.status === 200)
        {
            res = await res.json();
            strategy_info[res.strategy_id].accounts = res.accounts;
            this.setState({ strategy_info });
        }
        
        statusMsg = Object.values(strategy_info[account.metadata.current_strategy].accounts)[0];
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

    getStrategyInfo = (strategy_id) =>
    {
        const { strategy_info } = this.state;
        return strategy_info[strategy_id];
    }

    addStrategyWindow = (strategy_id, window) =>
    {

    }

    updateStrategyWindow = (strategy_id, item_id, window) =>
    {

    }

    addPositions = (strategy_id, positions) =>
    {
        let { strategy_info } = this.state;
        let strategy = strategy_info[strategy_id];

        if (strategy !== undefined)
        {
            strategy.positions = strategy.positions.concat(positions);
            this.setState({ strategy_info });
        }
    }

    updatePositions = (strategy_id, positions) =>
    {
        let { strategy_info } = this.state;
        let strategy = strategy_info[strategy_id];

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
            this.setState({ strategy_info });
        }
    }

    deletePositions = (strategy_id, positions) =>
    {
        let { strategy_info } = this.state;
        let strategy = strategy_info[strategy_id];

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
            this.setState({ strategy_info });
        }
    }

    addDrawings = (strategy_id, item_id, drawings) =>
    {
        let { strategy_info } = this.state;
        let item = this.getWindowInfo(strategy_id, item_id);
        item.properties.drawings = item.properties.drawings.concat(drawings);
        this.setState({ strategy_info });
    }

    deleteDrawings = (strategy_id, item_id, drawings) =>
    {
        let { strategy_info } = this.state;
        let item = this.getWindowInfo(strategy_id, item_id);
        item.properties.drawings = [];
        this.setState({ strategy_info });
    }

    getStrategyAccountStatus = (strategy_id, account_id) =>
    {
        const { strategy_info } = this.state;
        return strategy_info[strategy_id].accounts[account_id];
    }

    async goLive()
    {
        let { statusMsg } = this.state;
        statusMsg = 'Going live...';
        this.setState({ statusMsg });

        const { account, strategy_info } = this.state;
        const strategy_id = account.metadata.current_strategy;
        await this.requestStrategyStatusUpdate(
            strategy_id, 
            Object.keys(strategy_info[strategy_id].accounts), 
            'live'
        );
    }

    async goOffline()
    {
        let { statusMsg } = this.state;
        statusMsg = 'Going offline...';
        this.setState({ statusMsg });

        const { account, strategy_info } = this.state;
        const strategy_id = account.metadata.current_strategy;
        await this.requestStrategyStatusUpdate(
            strategy_id, 
            Object.keys(strategy_info[strategy_id].accounts), 
            'offline'
        );
    }

    async terminate()
    {
        let { statusMsg } = this.state;
        statusMsg = 'Terminating...';
        this.setState({ statusMsg });

        const { account, strategy_info } = this.state;
        const strategy_id = account.metadata.current_strategy;
        await this.requestStrategyStatusUpdate(
            strategy_id, 
            Object.keys(strategy_info[strategy_id].accounts), 
            'terminate'
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

    windowExists  = (strategy_id, item_id) =>
    {
        return this.getWindowInfo(strategy_id, item_id) !== undefined;
    }

    closeWindow = (strategy_id, item_id) =>
    {
        let { strategy_info } = this.state;
        for (let i = 0; i < strategy_info[strategy_id].windows.length; i++)
        {
            const w = strategy_info[strategy_id].windows[i];
            if (w.id === item_id)
            {
                strategy_info[strategy_id].windows.splice(i,1);
                this.setState({ strategy_info });
                return true;
            }
        }

        return false;
    }

    getChartElement = (strategy_id, item_id, getTopOffset, getScreenPos, getWindowInfo, getKeys) =>
    {
        return (<Chart
            strategy_id={strategy_id}
            item_id={item_id}
            // Universal Props
            getTopOffset={getTopOffset}
            getScreenPos={getScreenPos}
            getWindowInfo={getWindowInfo}
            getKeys={getKeys}

            // Window Props
            retrieveChartData={this.retrieveChartData}
            addChart={this.addChart}
            getChart={this.getChart}
            updateChart={this.updateChart}
            calculateIndicator={this.calculateIndicator}
            getPeriodOffsetSeconds={this.getPeriodOffsetSeconds}
            getCountDate={this.getCountDate}
            getCountDateFromDate={this.getCountDateFromDate}
            getStrategyInfo={this.getStrategyInfo}
            windowExists={this.windowExists}
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

const URI = 'http://127.0.0.1:5000';

export default StrategyApp;