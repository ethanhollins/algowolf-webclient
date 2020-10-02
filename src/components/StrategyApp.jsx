import React, { Component } from 'react';
import Camera from './strategyapp/Camera';
import Indicators from './strategyapp/Indicators';
import io from 'socket.io-client';
import moment from "moment-timezone";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCircle, 
} from '@fortawesome/pro-solid-svg-icons';
import { 
    faBars,  faChartLine, faChartPie, 
    faLightbulb, faCode, faHistory, faChevronRight, faChevronDown, faTools, faExpandArrowsAlt, faLink, faExpandAlt, faToolbox
} from '@fortawesome/pro-regular-svg-icons';
import { 
    faTimes, faPlus, faSort, faReceipt, faSlidersVSquare, faCode as faCodeLight,
    faFileInvoice, faChartBar, faTicketAlt, faLayerGroup, faHandshakeAltSlash,
    faHandPaper, faQuestionCircle, faHandshakeAlt, faUser
} from '@fortawesome/pro-light-svg-icons';
import Strategy from './strategyapp/Strategy';
import Popup from './strategyapp/Popup';
import Backtest from './strategyapp/Backtest';

class StrategyApp extends Component
{
    state = {
        sio: null,
        account: {},
        strategyInfo: {},
        positions: [],
        orders: [],
        page: 0,
        charts: {},
        backtestCharts: {},
        size: {
            width: 0, height: 0
        },
        scale: { x: 100, y: 100 },
        statusMsg: undefined,
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
        this.onMouseUp = this.onMouseUp.bind(this);
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);

        this.setAppContainerRef = elem => {
            this.appContainer = elem;
        };
        this.setCameraRef = elem =>
        {
            this.camera = elem;
        }
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
        this.setToolsElem = elem => {
            this.toolsElem = elem;
        }
        this.setUtilsDropdown = elem => {
            this.utilsDropdown = elem;
        }
        this.setToolsDropdown = elem => {
            this.toolsDropdown = elem;
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
        this.updateWindowDimensions();
        window.addEventListener("mouseup", this.onMouseUp);
        window.addEventListener("resize", this.update);

        const user_id = await this.props.checkAuthorization();
        this.props.setUserId(user_id);

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
    }

    componentWillUnmount()
    {
        window.removeEventListener("mouseup", this.onMouseUp);
        window.removeEventListener("resize", this.update);
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
                    
    
                    <div className='toolbox body noselect' onDragStart={this.onDragStart}>
                        <div>
                            <div className='toolbox item row'>
                                <FontAwesomeIcon className='toolbox icon' icon={faBars} />
                            </div>
                            <div className='toolbox item row'>
                                <FontAwesomeIcon className='toolbox icon small black' icon={faUser} />
                                <span className='toolbox label right-space'>ZVS567</span>
                                <div className='toolbox item btn'>
                                    <FontAwesomeIcon className='toolbox selection-icon' icon={faChevronDown} />
                                </div>
                            </div>
                            <div className='toolbox item right-space'>
                                <div ref={this.setActivationElem} className='toolbox item row btn'>
                                    <FontAwesomeIcon id='live_icon' className='toolbox icon red_btn' icon={faHandshakeAlt} />
                                    <span className='toolbox label'>Go Live</span>
                                </div>
                                <div className='toolbox item btn' onClick={this.onActivationDropdown}>
                                    <FontAwesomeIcon className='toolbox selection-icon' icon={faChevronDown} />
                                </div>
                                <div ref={this.setActivationDropdown} className='toolbox dropdown' style={{display: 'none'}}>
                                    <div onClick={this.onActivationDropdownItem}>
                                        <span className='toolbox left'>
                                            <FontAwesomeIcon icon={faHandshakeAlt} className='toolbox left-icon' /><span>Go Live</span>
                                        </span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faQuestionCircle} className='toolbox right-icon' /></span>
                                    </div>
                                   <div onClick={this.onActivationDropdownItem}>
                                        <span className='toolbox left'>
                                            <FontAwesomeIcon icon={faHandshakeAltSlash} className='toolbox left-icon' /><span>Go Offline</span>
                                        </span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faQuestionCircle} className='toolbox right-icon' /></span>
                                    </div>
                                    <div onClick={this.onActivationDropdownItem}>
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
                                    <FontAwesomeIcon className='toolbox icon orange_btn' icon={faChartLine} />
                                    <span className='toolbox label'>Charts</span>
                                </div>
                                <div ref={this.setChartsDropdown} className='toolbox dropdown' style={{display: 'none'}}>
                                    <div onClick={this.onChartsDropdownItem} name='cryptocurrencies'>
                                        <span className='toolbox left'>Cryptocurrencies</span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon' /></span>
                                    </div>
                                    <div onClick={this.onChartsDropdownItem} name='currencies'>
                                        <span className='toolbox left'>Currencies</span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon' /></span>
                                    </div>
                                    <div onClick={this.onChartsDropdownItem} name='stocks'>
                                        <span className='toolbox left'>Stocks</span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon' /></span>
                                    </div>
                                    <div onClick={this.onChartsDropdownItem} name='indicies'>
                                        <span className='toolbox left'>Indicies</span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon' /></span>
                                    </div>
                                    <div onClick={this.onChartsDropdownItem} name='futures'>
                                        <span className='toolbox left'>Futures</span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon' /></span>
                                    </div>
                                    <div onClick={this.onChartsDropdownItem} name='bonds'>
                                        <span className='toolbox left'>Bonds</span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon' /></span>
                                    </div>
                                </div>
                            </div>
                            <div className='toolbox item'>
                                <div ref={this.setStatsElem} className='toolbox item row btn' onClick={this.onStatsDropdown}>
                                    <FontAwesomeIcon className='toolbox icon orange_btn' icon={faChartPie} />
                                    <span className='toolbox label'>Stats</span>
                                </div>
                                <div ref={this.setStatsDropdown} className='toolbox dropdown' style={{display: 'none'}}>
                                    <div onClick={this.onStatsDropdownItem}>
                                        <span className='toolbox left'>
                                            <FontAwesomeIcon icon={faChartBar} className='toolbox left-icon' /><span>Graphs</span>
                                        </span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon' /></span>
                                    </div>
                                    <div onClick={this.onStatsDropdownItem}>
                                        <span className='toolbox left'>
                                            <FontAwesomeIcon icon={faFileInvoice} className='toolbox left-icon' /><span>Reports</span>
                                        </span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon' /></span>
                                    </div>
                                </div>
                            </div>
                            <div className='toolbox item'>
                                <div ref={this.setUtilsElem} className='toolbox item row btn' onClick={this.onUtilsDropdown}>
                                    <FontAwesomeIcon className='toolbox icon orange_btn' icon={faLightbulb} />
                                    <span className='toolbox label'>Utilities</span>
                                </div>
                                <div ref={this.setUtilsDropdown} className='toolbox dropdown' style={{display: 'none'}}>
                                    <div onClick={this.onUtilsDropdownItem}>
                                        <span className='toolbox left'>
                                            <FontAwesomeIcon icon={faSort} className='toolbox left-icon' /><span>Positions/Orders</span>
                                        </span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faPlus} className='toolbox right-icon' /></span>
                                    </div>
                                    <div onClick={this.onUtilsDropdownItem}>
                                        <span className='toolbox left'>
                                            <FontAwesomeIcon icon={faTicketAlt} className='toolbox left-icon' /><span>Ticket</span>
                                        </span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faPlus} className='toolbox right-icon' /></span>
                                    </div>
                                    <div onClick={this.onUtilsDropdownItem}>
                                        <span className='toolbox left'>
                                            <FontAwesomeIcon icon={faReceipt} className='toolbox left-icon' /><span>Transactions</span>
                                        </span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faPlus} className='toolbox right-icon' /></span>
                                    </div>
                                    <div onClick={this.onUtilsDropdownItem}>
                                        <span className='toolbox left'>
                                            <FontAwesomeIcon icon={faSlidersVSquare} className='toolbox left-icon' /><span>Control Center</span>
                                        </span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faPlus} className='toolbox right-icon' /></span>
                                    </div>
                                    <div onClick={this.onUtilsDropdownItem}>
                                        <span className='toolbox left'>
                                            <FontAwesomeIcon icon={faLayerGroup} className='toolbox left-icon' /><span>Drawing Layers</span>
                                        </span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faPlus} className='toolbox right-icon' /></span>
                                    </div>
                                    <div onClick={this.onUtilsDropdownItem}>
                                        <span className='toolbox left'>
                                            <FontAwesomeIcon icon={faCodeLight} className='toolbox left-icon' /><span>Script Editor</span>
                                        </span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faPlus} className='toolbox right-icon' /></span>
                                    </div>
                                </div>
                            </div>
                            <div className='toolbox item'>
                                <div ref={this.setToolsElem} className='toolbox item row btn' onClick={this.onToolsDropdown}>
                                    <FontAwesomeIcon className='toolbox icon orange_btn' icon={faTools} />
                                    <span className='toolbox label'>Tools</span>
                                </div>
                                <div ref={this.setToolsDropdown} className='toolbox dropdown' style={{display: 'none'}}>
                                    <div onClick={this.onToolsDropdownItem}>
                                        <span className='toolbox left'>
                                            <FontAwesomeIcon icon={faExpandArrowsAlt} className='toolbox left-icon' /><span>Move</span>
                                        </span>
                                    </div>
                                    <div onClick={this.onToolsDropdownItem}>
                                        <span className='toolbox left'>
                                            <FontAwesomeIcon icon={faLink} className='toolbox left-icon' /><span>Link</span>
                                        </span>
                                    </div>
                                    <div onClick={this.onToolsDropdownItem}>
                                        <span className='toolbox left'>
                                            <FontAwesomeIcon icon={faExpandAlt} className='toolbox left-icon' /><span>Resize</span>
                                        </span>
                                    </div>
                                    <div onClick={this.onToolsDropdownItem}>
                                        <span className='toolbox left'>
                                            <FontAwesomeIcon icon={faToolbox} className='toolbox left-icon' /><span>Toolbox</span>
                                        </span>
                                        <span className='toolbox right'><FontAwesomeIcon icon={faPlus} className='toolbox right-icon' /></span>
                                    </div>
                                </div>
                            </div>
                            <div className='toolbox separator' />
                            <div className='toolbox item'>
                                <div ref={this.setScriptElem} className='toolbox item row btn'>
                                    <FontAwesomeIcon className='toolbox icon blue_btn' icon={faCode} />
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
                    </div> 
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
        let { account } = this.state;

        if ('metadata' in account)
        {
            const current_strategy = account.metadata.current_strategy;
            if (account.metadata.open_strategies.includes(current_strategy))
            {
                if (current_strategy.includes('/backtest/'))
                {
                    return <Backtest
                        id={current_strategy}
                        clone={this.clone}
                        getAppContainer={this.getAppContainer}
                        convertScreenUnitToWorldUnit={this.convertScreenUnitToWorldUnit}
                        convertWorldUnitToScreenUnit={this.convertWorldUnitToScreenUnit}
                        getSize={this.getSize}
                        getScale={this.getScale}
                        getStrategyInfo={this.getStrategyInfo}
                        updateStrategyInfo={this.updateStrategyInfo}
                        getChartElement={this.getChartElement}
                        getCamera={this.getCamera}
                        getSio={this.getSio}
                        setPopup={this.setPopup}
                        // Window Funcs
                        closeWindow={this.closeWindow}
                        windowExists={this.windowExists}
                        isTopWindow={this.isTopWindow}
                        setTopWindow={this.setTopWindow}
                        // History Functions
                        addHistory={this.addHistory}
                        getHistory={this.getHistory}
                        getLastHistoryAction={this.getLastHistoryAction}
                        deleteHistory={this.deleteHistory}
                        // Chart Functions
                        retrieveChartData={this.retrieveChartData}
                        addChart={this.addBacktestChart}
                        getChart={this.getBacktestChart}
                        updateChart={this.updateBacktestChart}
                        getIndicator={this.getBacktestIndicator}
                        calculateIndicator={this.calculateBacktestIndicator}
                        getPeriodOffsetSeconds={this.getPeriodOffsetSeconds}
                        getCountDate={this.getCountDate}
                        getCountDateFromDate={this.getCountDateFromDate}
                    />
                }
                else
                {
                    return <Strategy
                        id={current_strategy}
                        clone={this.clone}
                        getAppContainer={this.getAppContainer}
                        convertScreenUnitToWorldUnit={this.convertScreenUnitToWorldUnit}
                        convertWorldUnitToScreenUnit={this.convertWorldUnitToScreenUnit}
                        getSize={this.getSize}
                        getScale={this.getScale}
                        getStrategyInfo={this.getStrategyInfo}
                        updateStrategyInfo={this.updateStrategyInfo}
                        getChartElement={this.getChartElement}
                        getCamera={this.getCamera}
                        getSio={this.getSio}
                        setPopup={this.setPopup}
                        // Window Funcs
                        closeWindow={this.closeWindow}
                        windowExists={this.windowExists}
                        isTopWindow={this.isTopWindow}
                        setTopWindow={this.setTopWindow}
                        // History Functions
                        addHistory={this.addHistory}
                        getHistory={this.getHistory}
                        getLastHistoryAction={this.getLastHistoryAction}
                        deleteHistory={this.deleteHistory}
                        // Chart Functions
                        retrieveChartData={this.retrieveChartData}
                        addChart={this.addChart}
                        getChart={this.getChart}
                        updateChart={this.updateChart}
                        getIndicator={this.getIndicator}
                        calculateIndicator={this.calculateIndicator}
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

    onToolsDropdown = (e) =>
    {
        if (this.toolsDropdown.style.display === 'none')
        {
            this.toolsDropdown.style.display = 'block';
            const btn_rect = this.toolsElem.getBoundingClientRect();
            this.toolsDropdown.style.left = parseInt(btn_rect.x) + 'px';
        }
        else
        {
            this.toolsDropdown.style.display = 'none';
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

    onActivationDropdownItem = (e) =>
    {
        this.activationDropdown.style.display = 'none';
    }

    onChartsDropdownItem = (e) =>
    {
        this.chartsDropdown.style.display = 'none';

        // const popup = {
        //     type: 'windows-charts',
        //     size: {
        //         width: 75,
        //         height: 60
        //     },
        //     opened: e.target.getAttribute('name')
        // }
        const popup = {
            type: 'chart-settings',
            size: {
                width: 60,
                height: 75
            },
            opened: 'general'
        }
        this.setPopup(popup);
    }

    onStatsDropdownItem = (e) =>
    {
        this.statsDropdown.style.display = 'none';
    }

    onUtilsDropdownItem = (e) =>
    {
        this.utilsDropdown.style.display = 'none';
    }

    onToolsDropdownItem = (e) =>
    {
        this.toolsDropdown.style.display = 'none';
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

    closeTemporaryWindows(mouse_pos)
    {
        if (this.activationDropdown.style.display !== 'none')
        {
            if (!this.isWithinBounds(this.activationDropdown.getBoundingClientRect(), mouse_pos))
                this.activationDropdown.style.display = 'none';
        }
        if (this.chartsDropdown.style.display !== 'none')
        {
            if (!this.isWithinBounds(this.chartsDropdown.getBoundingClientRect(), mouse_pos))
                this.chartsDropdown.style.display = 'none';
        }
        if (this.statsDropdown.style.display !== 'none')
        {
            if (!this.isWithinBounds(this.statsDropdown.getBoundingClientRect(), mouse_pos))
                this.statsDropdown.style.display = 'none';
        }
        if (this.utilsDropdown.style.display !== 'none')
        {
            if (!this.isWithinBounds(this.utilsDropdown.getBoundingClientRect(), mouse_pos))
                this.utilsDropdown.style.display = 'none';
        }
        if (this.toolsDropdown.style.display !== 'none')
        {
            if (!this.isWithinBounds(this.toolsDropdown.getBoundingClientRect(), mouse_pos))
                this.toolsDropdown.style.display = 'none';
        }
    }

    onMouseUp(e)
    {
        const mouse_pos = {
            x: e.clientX, y: e.clientY
        }
        this.closeTemporaryWindows(mouse_pos);
    }

    update()
    {
        this.updateWindowDimensions();
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
        let { account } = this.state;

        const reqOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
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
        let { strategyInfo } = this.state;

        /** Retrieve strategy info */
        const reqOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        }

        for (let i = 0; i < strategy_ids.length; i++)
        {
            strategyInfo[strategy_ids[i]] = Object.assign(
                {}, strategyInfo[strategy_ids[i]],
                await fetch(
                    `${URI}/v1/strategy/` +
                    strategy_ids[i],
                    reqOptions
                ).then(res => res.json())
            );

        }

        this.setState({ strategyInfo });
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

        this.connectChart(product, period);

        const key = product + ':' + period;
        charts[key] = {
            product: product,
            period: period,
            timestamps: ohlc_data.ohlc.timestamps,
            asks: ohlc_data.ohlc.asks,
            bids: ohlc_data.ohlc.bids,
            next_timestamp: null
        };

        this.generateMissingBars(charts[key]);
        this.generateNextTimestamp(charts[key]);

        this.setState({ charts });
        return charts[key];
    }

    addBacktestChart = (backtest_id, product, period, ohlc_data) =>
    {
        let { backtestCharts } = this.state;
        if (!(backtest_id in backtestCharts))
        {
            backtestCharts[backtest_id] = {}
        }

        const key = product + ':' + period;
        backtestCharts[backtest_id][key] = {
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

    connectChart(product, period)
    {
        const { sio } = this.state;
        sio.emit('subscribe', {
            'strategy_id': this.getCurrentStrategy(),
            'field': 'ontick',
            'items': [
                {
                    'broker': 'oanda',
                    'product': product,
                    'period': period
                }
            ]
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

    generateNextTimestamp(chart)
    {
        const off = this.getPeriodOffsetSeconds(chart.period);        
        const ask_close = chart.asks[chart.asks.length-1][3];
        const bid_close = chart.bids[chart.bids.length-1][3];

        let ts = chart.timestamps[chart.timestamps.length-1] + off;
        let c_weekend = this.getWeekendDates(ts);
        if (ts >= c_weekend[0].unix())
        {
            ts = c_weekend[1].unix();
            c_weekend = this.getWeekendDates(ts);
        }
        
        while (ts < moment.utc().unix())
        {
            chart.timestamps.push(ts);
            chart.asks.push([ask_close,ask_close,ask_close,ask_close]);
            chart.bids.push([bid_close,bid_close,bid_close,bid_close]);

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
        
        chart.asks[chart.asks.length-1] = item['item']['ask'];
        chart.bids[chart.bids.length-1] = item['item']['bid'];

        if (item['bar_end'])
        {
            // Add new bar
            chart.timestamps.push(chart.next_timestamp);
            chart.asks.push([null,null,null,null]);
            chart.bids.push([null,null,null,null]);

            this.generateNextTimestamp(chart);
        }

        this.setState({ charts });
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

    getIndicator = (type, price, product, period) =>
    {
        return Indicators[type][price][product][period];
    }

    calculateIndicator = (chart, price, ind) =>
    {
        chart = this.filterChart(chart, false);
        /**  Retreive indicator data */
        Indicators[ind.type](
            chart.product,
            chart.filteredTimestamps, chart.filteredAsks, 
            chart.filteredBids, ind.properties
        );
    }

    getBacktestIndicator = (type, price, backtest_id, product, period) =>
    {
        return Indicators[type][price][backtest_id + '/' + product][period];
    }


    calculateBacktestIndicator = (backtest_id, chart, price, ind) =>
    {
        chart = this.filterChart(chart, false);
        /**  Retreive indicator data */
        Indicators[ind.type](
            backtest_id + '/' + chart.product,
            chart.filteredTimestamps, chart.filteredAsks, 
            chart.filteredBids, ind.properties
        );
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

        let { account, strategyInfo, statusMsg } = this.state;

        if (res.status === 200)
        {
            res = await res.json();
            strategyInfo[res.strategy_id].accounts = res.accounts;
            this.setState({ strategyInfo });
        }
        
        statusMsg = Object.values(strategyInfo[account.metadata.current_strategy].accounts)[0];
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
        const { strategyInfo } = this.state;
        return strategyInfo[strategy_id];
    }

    getStrategyAccountStatus = (strategy_id, account_id) =>
    {
        const { strategyInfo } = this.state;
        return strategyInfo[strategy_id].accounts[account_id];
    }

    async goLive()
    {
        let { statusMsg } = this.state;
        statusMsg = 'Going live...';
        this.setState({ statusMsg });

        const { account, strategyInfo } = this.state;
        const strategy_id = account.metadata.current_strategy;
        await this.requestStrategyStatusUpdate(
            strategy_id, 
            Object.keys(strategyInfo[strategy_id].accounts), 
            'live'
        );
    }

    async goOffline()
    {
        let { statusMsg } = this.state;
        statusMsg = 'Going offline...';
        this.setState({ statusMsg });

        const { account, strategyInfo } = this.state;
        const strategy_id = account.metadata.current_strategy;
        await this.requestStrategyStatusUpdate(
            strategy_id, 
            Object.keys(strategyInfo[strategy_id].accounts), 
            'offline'
        );
    }

    async terminate()
    {
        let { statusMsg } = this.state;
        statusMsg = 'Terminating...';
        this.setState({ statusMsg });

        const { account, strategyInfo } = this.state;
        const strategy_id = account.metadata.current_strategy;
        await this.requestStrategyStatusUpdate(
            strategy_id, 
            Object.keys(strategyInfo[strategy_id].accounts), 
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
        let s_id = undefined;
        let to_update = {};
        let to_delete = {};
        // Organise into appropriate groups
        for (s_id in toSave)
        {
            to_update[s_id] = [];
            to_delete[s_id] = [];
            for (let i of toSave[s_id])
            {
                if (this.windowExists(s_id, i))
                {
                    to_update[s_id].push(this.getWindowInfo(s_id, i));
                } 
                else
                {
                    to_delete[s_id].push(i);
                }
            }
        }

        // Update API

        let result = {};
        // PUT
        var requestOptions = {
            method: 'PUT',
            credentials: 'include',
            headers: {
                "Content-Type": "application/json"
            }
        };
        for (s_id in to_update)
        {
            requestOptions.body = JSON.stringify({items: to_update[s_id]});
            const res = await fetch(`${URI}/v1/strategy/${s_id}/gui`, requestOptions);
            const status = res.status;

            if (status !== 200)
            {
                // Re populate save with failed window IDs
                for (let i of to_update[s_id])
                {
                    if (!result.hasOwnProperty(s_id))
                        result[s_id] = [];
                    if (!result[s_id].includes(i.id))
                        result[s_id].push(i.id);
                }
            }
        }
        
        // DELETE
        var requestOptions = {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                "Content-Type": "application/json"
            }
        };
        for (s_id in to_delete)
        {
            requestOptions.body = JSON.stringify({items: to_delete[s_id]});
            const res = await fetch(`${URI}/v1/strategy/${s_id}/gui`, requestOptions);
            const status = res.status;

            if (status !== 200)
            {
                // Re populate save with failed window IDs
                for (let i of to_delete[s_id])
                {
                    if (!result.hasOwnProperty(s_id))
                        result[s_id] = [];
                    if (!result[s_id].includes(i))
                        result[s_id].push(i);
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
}

const WAIT_FOR_SAVE = 5;
const URI = 'http://127.0.0.1:5000';

export default StrategyApp;