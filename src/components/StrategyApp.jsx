import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Camera from './strategyapp/Camera';
import Indicator from './strategyapp/Indicator';
import io from 'socket.io-client';
import moment from "moment-timezone";
import _ from 'underscore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleUp, faHistory } from '@fortawesome/pro-regular-svg-icons';
import { faTimes, faPlus, faMinus, faAngleRight, faAngleLeft } from '@fortawesome/pro-light-svg-icons';
import Strategy from './strategyapp/Strategy';
import StrategyToolbar from './strategyapp/StrategyToolbar';
import EmptyToolbar from './strategyapp/EmptyToolbar';
import Backtest from './strategyapp/Backtest';
import BacktestToolbar from './strategyapp/BacktestToolbar';
import Popup from './strategyapp/Popup';
import { ReactSVG } from 'react-svg';
import NotificationWindow from './strategyapp/NotificationWindow';

class StrategyApp extends Component
{
    state = {
        checkLogin: false,
        user_id: null,
        sio: null,
        keys: [],
        account: {},
        strategyInfo: {},
        metadata: {},
        positions: [],
        orders: [],
        page: 0,
        charts: {},
        broker_charts: {},
        chart_queues: {},
        backtestCharts: {},
        indicators: [],
        backtest_indicators: {},
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
        lastChange: null,
        show_load_screen: true,
        strategyOnConnect: null,
        notifications: [],
        notifTimerSet: false
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
        this.onWindowFocus = this.onWindowFocus.bind(this);
        
        this.getPopup = this.getPopup.bind(this);
        this.setPopup = this.setPopup.bind(this);
        
        this.updateInfo = this.updateInfo.bind(this);
        this.loadChart = this.loadChart.bind(this);
        this.connectChart = this.connectChart.bind(this);
        this.socketConnect = this.socketConnect.bind(this);
        this.reconnectCharts = this.reconnectCharts.bind(this);
        this.retrieveAllBrokers = this.retrieveAllBrokers.bind(this);
        this.retrieveStrategies = this.retrieveStrategies.bind(this);
        this.retrieveStrategyDetails = this.retrieveStrategyDetails.bind(this);
        this.retrieveAccountInfo = this.retrieveAccountInfo.bind(this);
        this.retrieveReport = this.retrieveReport.bind(this);
        this.retrieveBacktestReport = this.retrieveBacktestReport.bind(this);
        this.retrieveTransactions = this.retrieveTransactions.bind(this);
        this.retrieveChartData = this.retrieveChartData.bind(this);
        this.updateStrategyInputVariables = this.updateStrategyInputVariables.bind(this);
        this.updateAccountInputVariables = this.updateAccountInputVariables.bind(this);
        this.subscribeEmail = this.subscribeEmail.bind(this);
        this.handleSocket = this.handleSocket.bind(this);
        this.updateCurrentAccount = this.updateCurrentAccount.bind(this);
        this.updateAccountMetadata = this.updateAccountMetadata.bind(this);

        this.setAppContainerRef = elem => {
            this.appContainer = elem;
        };
        this.setPagesRef = elem => {
            this.pages = elem;
        }
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
        window.addEventListener("focus", this.onWindowFocus);

        let { checkLogin } = this.state;
        
        const user_id = await this.props.checkAuthorization();
        console.log(user_id);
        checkLogin = true;
        this.setState({ user_id, checkLogin });

        let { sio } = this.state;
        
        // Connect to API socket
        const account = await this.retrieveGuiInfo();
        sio = this.handleSocket();
        this.setState({ sio });
        let strategyInfo = await this.retrieveStrategies(account.metadata.open_strategies, account);
        for (let i in strategyInfo)
        {
            if (i in account.strategies)
            {
                strategyInfo[i].name = account.strategies[i].name;
            }
        }

        this.setState({ account, strategyInfo });
    
        // setTimeout(() => {
        //     this.addNotification();
        //     this.addNotification();
        // }, 10*1000);

        // Retrieve user specific strategy informations
        if (this.props.isDemo)
        {
            // const user_id = await this.props.checkAuthorization();
            // if (!user_id)
            // {
            //     const popup = {
            //         type: 'sign-up-prompt',
            //         size: {
            //             pixelWidth: 550,
            //             pixelHeight: 520
            //         },
            //         image: '/request_access_prison_paycheck.png',
            //         fade: true,
            //         permanent: true
            //     };
            //     this.setPopup(popup);
            // }
            // else
            // {
            //     const user_data = await this.retrieveHolyGrailUser();
            //     if (Object.keys(user_data).length > 0)
            //     {
            //         if (!user_data.approved)
            //         {
            //             const popup = {
            //                 type: 'request-demo-access',
            //                 size: {
            //                     pixelWidth: 550,
            //                     pixelHeight: 340
            //                 },
            //                 image: '/request_access_prison_paycheck.png',
            //                 fade: true,
            //                 permanent: true,
            //                 properties: {
            //                     user_data: user_data,
            //                     hasRequested: true
            //                 }
            //             };
            //             this.setPopup(popup);
            //         }
            //     }
            //     else
            //     {
            //         const popup = {
            //             type: 'request-demo-access',
            //             size: {
            //                 pixelWidth: 550,
            //                 pixelHeight: 340
            //             },
            //             image: '/request_access_prison_paycheck.png',
            //             fade: true,
            //             permanent: true,
            //             properties: {
            //                 user_data: {},
            //                 hasRequested: false
            //             }
            //         };
            //         this.setPopup(popup);
            //     }
            // }
            this.props.visitorCounter();
        }
        else if (!user_id)
        {
            console.log('GO BACK')
            // window.location = '/login';
        }

        const popup = {
            type: 'getting-started',
            size: {
                pixelWidth: 740,
                pixelHeight: 600
            },
            fade: true
        };
        this.setPopup(popup);

        this.is_loaded = true;
    }

    componentWillUnmount()
    {
        window.removeEventListener("mousemove", this.onMouseMoveThrottled);
        window.removeEventListener("mouseup", this.onMouseUp);
        window.removeEventListener("resize", this.update);
        window.removeEventListener("keydown", this.onKeyDown);
        window.removeEventListener("keyup", this.onKeyUp);
        window.addEventListener("focus", this.onWindowFocus);

        this.is_loaded = false;
    }

    componentDidUpdate()
    {
        let { chart_queues } = this.state;
        for (let key in chart_queues)
        {
            if (chart_queues[key].length > 0)
            {
                this.handleChartUpdate(chart_queues[key][0]);
            }
        }
    }

    render()
    {
        const { checkLogin } = this.state;
        if (checkLogin && (this.props.getUserId() !== null || this.props.isDemo))
        {
            return (
                <div className='main-app container'>

                <div 
                    className='chart_app' 
                >
                    <div
                        ref={this.setPagesRef}
                        className='app pages'
                    >
                        {this.generatePages()}
                        
                    </div>

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
                            <div className='tab item add' onClick={this.onSelectStrategy}>
                                <FontAwesomeIcon className='tab btn' icon={faPlus} />
                            </div>
                        </div>
                    </div>
                    
                    {this.generateToolbar()}
                    <div className='toolbox_shadow'/> 

                    {this.generateNotifications()}

                    <Popup
                        isDemo={this.props.isDemo}
                        history={this.props.history}
                        getUserId={this.props.getUserId}
                        getHeaders={this.props.getHeaders}
                        addWindow={this.addWindow}
                        windowExists={this.windowExists}
                        isWithinBounds={this.isWithinBounds}
                        isTopWindow={this.isTopWindow}
                        getContainerSize={this.getContainerSize}
                        getWindowInfo={this.getWindowInfo}
                        getPopup={this.getPopup}
                        getPopupElem={this.getPopupElem}
                        setPopup={this.setPopup}
                        setPopupOpened={this.setPopupOpened}
                        getSize={this.getSize}
                        retrieveAllBrokers={this.retrieveAllBrokers}
                        getStrategyId={this.getStrategyId}
                        getStrategyInfo={this.getStrategyInfo}
                        retrieveStrategies={this.retrieveStrategies}
                        getAllStrategyInfo={this.getAllStrategyInfo}
                        updateStrategyInfo={this.updateStrategyInfo}
                        retrieveStrategyDetails={this.retrieveStrategyDetails}
                        setHovered={this.setHovered}
                        subscribeEmail={this.subscribeEmail}
                        onFirstVisit={this.onFirstVisit}
                        getTimezones={this.getTimezones}
                        resetIndicators={this.resetIndicators}
                        findIndicator={this.findIndicator}
                        calculateAllChartIndicators={this.calculateAllChartIndicators}
                        addToSave={this.addToSave}
                        getAccountMetadata={this.getAccountMetadata}
                        updateAccountMetadata={this.updateAccountMetadata}
                    />
                    
                    
                </div>
                
                {this.showLoadScreen()}

                {this.showMobileMessage()}

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
        // e.preventDefault();
    }

    showLoadScreen = () =>
    {
        const { show_load_screen } = this.state;

        return (
            <div 
                className='main load'
                style={ !show_load_screen ? {display: 'none'} : {} }
            >
                <div className='main load-item'>
                    <div>
                        <ReactSVG className='main load-img' src={process.env.PUBLIC_URL + "/wolf-logo.svg"} />
                    </div>
                    {/* <div className='main load-text'>Loading</div> */}
                </div>
            </div>
        )
    }

    showMobileMessage = () => 
    {
        if (this.mobileCheck())
        {
            return( 
                <div 
                    className='main load mobile'
                >
                    <div className='main load-item mobile'>
                        <div>
                            <ReactSVG className='mobile img' src={process.env.PUBLIC_URL + "/wolf-logo.svg"} />
                        </div>
                        <div className='mobile text'>Sorry this app is currently unavailable on mobile.</div>
                    </div>
                </div>
            )
        }
    }

    generatePages = () =>
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
                const strategy = strategyInfo[current_strategy];
                let current_page = strategy.current_page;
                if (current_page === undefined)
                {
                    current_page = 0;
                }

                const width = 100 / strategy.pages.length;

                let page_items = [];
                for (let i = 0; i < strategy.pages.length; i++)
                {
                    let name = strategy.pages[i];

                    let item_class = 'page item-inner';
                    if (i === current_page)
                    {
                        item_class += ' selected';
                    }
                    page_items.push(
                        <div 
                            key={i}
                            className='page item'
                            style={{
                                width: `calc(${width}% - 10px)`
                            }}
                            name={i}
                            onClick={this.gotoPage.bind(this)}
                        >
                            <div className={item_class}>
                            <div className='page item-name'>{name}</div>
                            </div>
                        </div>
                    );
                }

                let arrow_left_class = 'page icon';
                if (current_page === 0)
                {
                    arrow_left_class += ' disabled';
                }
                let arrow_right_class = 'page icon';
                if (current_page === strategy.pages.length - 1)
                {
                    arrow_right_class += ' disabled';
                }
                let add_page_class = 'page icon';
                if (strategy.pages === 10)
                {
                    add_page_class += ' disabled';
                }

                return (
                    <React.Fragment>

                    <div className='page item-group'>
                        {page_items}
                    </div>

                    <div className='page tools-group'>
                        <div className={arrow_left_class} onClick={this.pageLeft.bind(this)}>
                            <FontAwesomeIcon className='page icon-inner' icon={faAngleLeft} />
                        </div>
                        <div className={arrow_right_class} onClick={this.pageRight.bind(this)}>
                            <FontAwesomeIcon className='page icon-inner' icon={faAngleRight} />
                        </div>
                        <div className='page icon' onClick={this.deletePageConfirmation.bind(this)}>
                            <FontAwesomeIcon className='page icon-inner' icon={faMinus} />
                        </div>
                        <div className={add_page_class} onClick={this.addPage.bind(this)}>
                            <FontAwesomeIcon className='page icon-inner' icon={faPlus} />
                        </div>
                    </div>

                    </React.Fragment>
                );
            }
        }

    }

    generateStrategyTabs = () =>
    {
        const { account, strategyInfo } = this.state;
        let tabs = [];
        if (account.metadata && Object.keys(strategyInfo).length > 0)
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

                let background_color = "#ffffff";
                if (s.backgroundColor)
                {
                    background_color = s.backgroundColor;
                }

                const rgb = this.hexToRgb(background_color);
                let text_color;
                let close_btn_class = '';
                if (this.useBlackText(rgb))
                {
                    text_color = "#000";
                }
                else
                {
                    text_color = "#FFF";
                    close_btn_class = " light"
                }

                let icon;
                if (i.includes('/backtest/'))
                {
                    icon = <FontAwesomeIcon className='tab btn-icon' icon={faHistory} />;
                }

                tabs.push(
                    <div 
                        key={i} className={className} name={i} 
                        onClick={this.setOpenStrategy.bind(this)}
                        style={{ backgroundColor: background_color, borderBottomColor: background_color, color: text_color }}
                    >
                        {icon}
                        <span>{s.name}</span>
                        <FontAwesomeIcon className={'tab btn' + close_btn_class} icon={faTimes} name={i} onClick={this.onCloseTab} />
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
                return (
                    <div className='window message'>
                        <div>You have no strategies open!</div>
                        <div>
                            <div>Try opening/creating a strategy</div>
                            <FontAwesomeIcon className='window message-icon' id="no_strategy_msg" icon={faPlus} />
                        </div>
                    </div>
                );
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
                        isDemo={this.props.isDemo}
                        getAppContainer={this.getAppContainer}
                        getContainerSize={this.getContainerSize}
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
                        getPage={this.getPage}
                        setPopup={this.setPopup}
                        getPopup={this.getPopup}
                        setShowLoadScreen={this.setShowLoadScreen}
                        getTimezones={this.getTimezones}
                        convertIncomingPositionSize={this.convertIncomingPositionSize}
                        // Window Funcs
                        closeWindow={this.closeWindow}
                        windowExists={this.windowExists}
                        getWindowById={this.getWindowById}
                        getWindowInfo={this.getWindowInfo}
                        getMetadata={this.getMetadata}
                        setMetadata={this.setMetadata}
                        isTopWindow={this.isTopWindow}
                        getTopWindow={this.getTopWindow}
                        setTopWindow={this.setTopWindow}
                        retrieveReport={this.retrieveBacktestReport}
                        // History Functions
                        addHistory={this.addHistory}
                        getHistory={this.getHistory}
                        getLastHistoryAction={this.getLastHistoryAction}
                        deleteHistory={this.deleteHistory}
                        // Chart Functions
                        retrieveTransactions={this.retrieveTransactions}
                        retrieveChartData={this.retrieveChartData}
                        addChart={this.addBacktestChart}
                        deleteChart={this.deleteChart}
                        getChart={this.getBacktestChart}
                        updateChart={this.updateBacktestChart}
                        findIndicator={this.findBacktestIndicator}
                        createIndicator={this.createBacktestIndicator}
                        getIndicator={this.getBacktestIndicator}
                        calculateIndicator={this.calculateIndicator}
                        resetIndicators={this.resetIndicators}
                        getPeriodOffsetSeconds={this.getPeriodOffsetSeconds}
                        getCountDate={this.getCountDate}
                        getCountDateFromDate={this.getCountDateFromDate}
                        setCustomContextMenu={this.setCustomContextMenu}
                    />
                }
                else
                {
                    return <Strategy
                        key={current_strategy}
                        id={current_strategy}
                        ref={this.setStrategy}
                        clone={this.clone}
                        isDemo={this.props.isDemo}
                        getURI={this.props.getURI}
                        getCookies={this.props.getCookies}
                        getHeaders={this.props.getHeaders}
                        getAppContainer={this.getAppContainer}
                        getContainerSize={this.getContainerSize}
                        convertScreenUnitToWorldUnit={this.convertScreenUnitToWorldUnit}
                        convertWorldUnitToScreenUnit={this.convertWorldUnitToScreenUnit}
                        getMousePos={this.getMousePos}
                        getSize={this.getSize}
                        getScale={this.getScale}
                        reconnectCharts={this.reconnectCharts}
                        retrieveStrategies={this.retrieveStrategies}
                        retrieveAccountInfo={this.retrieveAccountInfo}
                        getStrategyInfo={this.getStrategyInfo}
                        updateStrategyInfo={this.updateStrategyInfo}
                        updateInfo={this.updateInfo}
                        updateStrategyInputVariables={this.updateStrategyInputVariables}
                        updateAccountInputVariables={this.updateAccountInputVariables}
                        getCurrentAccount={this.getCurrentAccount}
                        getChartElement={this.getChartElement}
                        getCamera={this.getCamera}
                        getSio={this.getSio}
                        getKeys={this.getKeys}
                        getPage={this.getPage}
                        setPopup={this.setPopup}
                        getPopup={this.getPopup}
                        setStatusMsg={this.setStatusMsg}
                        setShowLoadScreen={this.setShowLoadScreen}
                        getTimezones={this.getTimezones}
                        convertIncomingPositionSize={this.convertIncomingPositionSize}
                        setStrategyOnConnect={this.setStrategyOnConnect}
                        // Window Funcs
                        closeWindow={this.closeWindow}
                        windowExists={this.windowExists}
                        getWindowById={this.getWindowById}
                        getMetadata={this.getMetadata}
                        setMetadata={this.setMetadata}
                        isTopWindow={this.isTopWindow}
                        getTopWindow={this.getTopWindow}
                        setTopWindow={this.setTopWindow}
                        retrieveReport={this.retrieveReport}
                        // History Functions
                        addHistory={this.addHistory}
                        getHistory={this.getHistory}
                        getLastHistoryAction={this.getLastHistoryAction}
                        deleteHistory={this.deleteHistory}
                        // Chart Functions
                        connectChart={this.connectChart}
                        retrieveChartData={this.retrieveChartData}
                        addChart={this.addChart}
                        deleteChart={this.deleteChart}
                        getChart={this.getChart}
                        getBrokerChart={this.getBrokerChart}
                        addBrokerChart={this.addBrokerChart}
                        updateChart={this.updateChart}
                        findIndicator={this.findIndicator}
                        createIndicator={this.createIndicator}
                        calculateIndicator={this.calculateIndicator}
                        resetIndicators={this.resetIndicators}
                        getPeriodOffsetSeconds={this.getPeriodOffsetSeconds}
                        getCountDate={this.getCountDate}
                        getCountDateFromDate={this.getCountDateFromDate}
                        setCustomContextMenu={this.setCustomContextMenu}
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

        return (
            <div className='window message'>
                <div>This page has no open windows!</div>
                <div>
                    <div>Try adding a chart</div>
                    {/* <FontAwesomeIcon className='window message-icon' icon={faChartLine} /> */}
                </div>
            </div>
        );
    }

    generateToolbar() 
    {
        const current_strategy = this.getCurrentStrategy();

        if (current_strategy && this.strategy !== undefined)
        {
            if (current_strategy.includes('/backtest/'))
            {
                return <BacktestToolbar 
                    ref={this.setToolbarRef}
                    history={this.props.history}
                    isDemo={this.props.isDemo}
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
                    key={current_strategy}
                    ref={this.setToolbarRef}
                    history={this.props.history}
                    isDemo={this.props.isDemo}
                    hasBetaAccess={this.hasBetaAccess}
                    getCurrentStrategy={this.getCurrentStrategy}
                    updateStrategyInfo={this.updateStrategyInfo}
                    getStrategyComponent={this.getStrategyComponent}
                    getStrategyInfo={this.getStrategyInfo}
                    startScript={this.startScript.bind(this)}
                    stopScript={this.stopScript.bind(this)}
                    isWithinBounds={this.isWithinBounds}
                    setPopup={this.setPopup}
                    updateCurrentAccount={this.updateCurrentAccount}
                />
            }
        }
        else
        {
            return <EmptyToolbar 
                    key={current_strategy}
                    ref={this.setToolbarRef}
                    history={this.props.history}
                    isDemo={this.props.isDemo}
                    getCurrentStrategy={this.getCurrentStrategy}
                    updateStrategyInfo={this.updateStrategyInfo}
                    getStrategyComponent={this.getStrategyComponent}
                    getStrategyInfo={this.getStrategyInfo}
                    isWithinBounds={this.isWithinBounds}
                    setPopup={this.setPopup}
                />
        }
    }

    generateNotifications()
    {
        const { notifications, show_load_screen } = this.state;

        if (!show_load_screen)
        {
            let result = [];
            for (let i=0; i < notifications.length; i++)
            {
                const notif = notifications[i];
                result.push(
                    <NotificationWindow 
                        key={i} idx={i}
                        header={notif.header}
                        description={notif.description}
                    />
                );
            }
    
            return result;
        }
    }

    addNotification()
    {
        let { notifications } = this.state;
        if (notifications.length === 0)
        {
            this.deleteNotification();
        }

        notifications.push(
            {
                header: <span>Long Position Entered</span>,
                description: (
                    <React.Fragment>

                    <FontAwesomeIcon className='notif icon' icon={faArrowAltCircleUp} />
                    <span className='notif text'><strong>EUR/USD</strong> Long Position entered at <strong>1.12543</strong></span>

                    </React.Fragment>
                )
            }
        );
        this.setState({ notifications });
    }

    deleteNotification()
    {
        let { notifications, notifTimerSet } = this.state;
        notifTimerSet = true;
        this.setState({ notifTimerSet });

        setTimeout(() => {
            if (!document.hidden)
            {
                notifications.splice(0, 1);
                if (notifications.length > 0)
                {
                    this.deleteNotification();
                }
                else
                {
                    notifTimerSet = false;
                }
            }
            else
            {
                notifTimerSet = false;
            }
            this.setState({ notifications, notifTimerSet });

        }, 11*1000);
    }

    mobileCheck() 
    {
        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    };

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
        const { hovered, show_load_screen } = this.state;
        if (show_load_screen)
        {
            return null;
        }

        for (let k in hovered)
        {
            if (hovered[k]) return k;
        }

        // Check windows
        const strategy = this.getStrategyInfo(strategy_id);
        const windows = this.getStrategyWindows(strategy_id);
        windows.sort((a, b) => parseFloat(b.zIndex) - parseFloat(a.zIndex));
        for (let i of windows)
        {
            if (i.page === strategy.current_page)
            {
                const maximised = i.maximised;
                if (maximised)
                {
                    return i.id;
                }
            }
        }
        for (let i of windows)
        {
            if (i.page === strategy.current_page)
            {
                const pos = this.convertWorldUnitToScreenUnit(i.pos);
                const size = this.convertWorldUnitToScreenUnit({
                    x: i.size.width, y: i.size.height
                });
                const rect = {
                    x: pos.x, y: pos.y,
                    width: size.x, height: size.y
                }
                if (this.isWithinBounds(rect, mouse_pos))
                {
                    return i.id;
                }
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
        let page_windows = [];
        for (let i = 0; i < windows.length; i++)
        {
            if (windows[i].page === strategyInfo[strategy_id].current_page)
            {
                page_windows.push(windows[i]);
            }
        }
        let c_idx = page_windows.length-1;

        if (page_windows[0].id !== item_id)
        {
            for (let i = 0; i < page_windows.length; i++)
            {
                let w = page_windows[i];
                if (w.id === item_id)
                {
                    w.zIndex = page_windows.length;
                }
                else
                {
                    w.zIndex = c_idx;
                    c_idx--;
                }
            }
            // Add to history
            this.addToSave(strategy_id, this.getStrategyWindowIds(strategy_id), WAIT_FOR_SAVE);
    
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

        if (!keys.includes(SPACEBAR) && this.is_loaded && update_pos && this.strategy !== undefined)
        {
            this.setState({ mouse_pos });
            for (let w of this.strategy.windows)
            {
                if (w !== null && w.getInnerElement() !== null)
                {
                    if (w.getInnerElement().onMouseMoveThrottled !== undefined)
                    {
                        w.getInnerElement().onMouseMoveThrottled(mouse_pos);
                    }
                    if (w.getInnerElement().updateInfo !== undefined)
                    {
                        w.getInnerElement().updateInfo({ 
                            x: mouse_pos.x, 
                            y: mouse_pos.y - this.getAppContainer().offsetTop 
                        });
                    }
                }
                
            }
        }
    }

    updateInfo(mouse_pos)
    {
        if (this.is_loaded && this.strategy !== null)
        {
            for (let w of this.strategy.windows)
            {
                if (w && w.getInnerElement().updateInfo !== undefined)
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

    onWindowFocus(e)
    {
        const { notifications, notifTimerSet } = this.state;
        if (notifications.length > 0 && !notifTimerSet)
        {
            this.deleteNotification();
        }
    }

    update()
    {
        this.updateWindowDimensions();
    }

    async socketConnect()
    {   
        if (!this.props.isDemo || (this.props.isDemo && this.state.user_id))
        {
            const user_id = await this.props.checkAuthorization();
            if (!user_id)
            {
                window.location = '/logout';
            }
        }

        console.log('connected');

        let { account, strategyInfo } = this.state;
        if (Object.keys(strategyInfo).length > 0 && account.metadata && account.metadata.open_strategies.length > 0)
        {
            strategyInfo = await this.retrieveStrategies(
                Object.keys(strategyInfo),
                account
            );
            this.setState({ strategyInfo });
        }

        const { strategyOnConnect } = this.state;
        if (strategyOnConnect)
        {
            strategyOnConnect();
        }
    }

    reconnect = (socket) =>
    {
        socket.connect();
        setTimeout(() => {
            if (!socket.connected)
            {
                this.reconnect(socket);
            }
        }, 5*1000);
    }


    handleSocket()
    {
        const { REACT_APP_STREAM_URL } = process.env;
        const endpoint = `${REACT_APP_STREAM_URL}/user`
        const socket = io(endpoint, {
            reconnection: false,
            transportOptions: {
                polling: {
                    extraHeaders: {
                        Authorization: `Bearer ${this.props.getCookies().get('Authorization')}`
                    }
                }
            }
        });

        socket.on('connect', this.socketConnect.bind(this));

        socket.on('disconnect', () =>
        {
            this.reconnect(socket);
            console.log('Disconnected.')
        });

        socket.on('ontick', (data) =>
        {
            this.addToChartQueue(data);
        });

        return socket;
    }

    async retrieveGuiInfo()
    {
        const { REACT_APP_API_URL } = process.env;

        const reqOptions = {
            method: 'GET',
            headers: this.props.getHeaders(),
            credentials: 'include'
        }

        const res = await fetch(
            `${REACT_APP_API_URL}/v1/account`,
            reqOptions
        );
            
        if (res.status === 200)
        {
            return await res.json();
        }
        else if (res.status === 403)
        {
            window.location = '/logout';
        }
    }

    async retrieveAllBrokers()
    {
        const { REACT_APP_API_URL } = process.env;
        const reqOptions = {
            method: 'GET',
            headers: this.props.getHeaders(),
            credentials: 'include'
        }

        const res = await fetch(
            `${REACT_APP_API_URL}/broker`,
            reqOptions
        )

        if (res.status === 200)
        {
            return await res.json();
        }
        else if (res.status === 403)
        {
            window.location = '/logout';
        }
    }

    async retrieveStrategies(strategy_ids, account)
    {
        const { REACT_APP_API_URL } = process.env;
        let { strategyInfo } = this.state;

        if (!account)
        {
            account = this.state.account;
        }

        /** Retrieve strategy info */
        const reqOptions = {
            method: 'GET',
            headers: this.props.getHeaders(),
            credentials: 'include'
        }

        for (let i = 0; i < strategy_ids.length; i++)
        {
            const res = await fetch(
                `${REACT_APP_API_URL}/v1/strategy/${strategy_ids[i]}`,
                reqOptions
            );

            if (res.status === 200)
            {
                strategyInfo[strategy_ids[i]] = Object.assign(
                    {}, strategyInfo[strategy_ids[i]],
                    await res.json()
                );
            }
            else if (res.status === 403)
            {
                window.location = '/logout';
            }
        }

        if (!(account.metadata.current_strategy in strategyInfo))
        {
            this.setShowLoadScreen(false);
        }

        return strategyInfo;
    }

    async retrieveStrategyDetails()
    {
        const { REACT_APP_API_URL } = process.env;

        /** Retrieve strategy info */
        const reqOptions = {
            method: 'GET',
            headers: this.props.getHeaders(),
            credentials: 'include'
        }

        const res = await fetch(
            `${REACT_APP_API_URL}/v1/strategy/details`,
            reqOptions
        );

        if (res.status === 200)
        {
            return await res.json();
        }
        else if (res.status === 403)
        {
            window.location = '/logout';
        }
    }

    async retrieveAccountInfo(strategy_id, broker_id, account_id)
    {
        const { REACT_APP_API_URL } = process.env;

        /** Retrieve strategy info */
        const reqOptions = {
            method: 'GET',
            headers: this.props.getHeaders(),
            credentials: 'include'
        }

        const res = await fetch(
            `${REACT_APP_API_URL}/v1/strategy/${strategy_id}/${broker_id}/${account_id}`,
            reqOptions
        )
        
        if (res.status === 200)
        {
            return await res.json();
        }
        else if (res.status === 403)
        {
            window.location = '/logout';
        }
    }

    async retrieveReport(strategy_id, broker_id, account_id, name)
    {
        const { REACT_APP_API_URL } = process.env;

        /** Retrieve strategy info */
        const reqOptions = {
            method: 'GET',
            headers: this.props.getHeaders(),
            credentials: 'include'
        }

        const res = await fetch(
            `${REACT_APP_API_URL}/v1/strategy/${strategy_id}/${broker_id}/${account_id}/reports/${name}`,
            reqOptions
        );
        if (res.status === 200)
        {
            // .then(res => res.text())
            //         .then(res => {
            //             res = res.replace(/\bNaN\b/g, null);
            //             return JSON.parse(res);
            //         });
            const data = await res.text();
            return JSON.parse(data.replace(/\bNaN\b/g, null));
        }
        else if (res.status === 403)
        {
            window.location = '/logout';
        }
        else
        {
            return {};
        }
    }

    async retrieveBacktestReport(strategy_id, backtest_id, name)
    {
        const { REACT_APP_API_URL } = process.env;

        /** Retrieve strategy info */
        const reqOptions = {
            method: 'GET',
            headers: this.props.getHeaders(),
            credentials: 'include'
        }

        const res = await fetch(
            `${REACT_APP_API_URL}/v1/strategy/${strategy_id}/backtest/${backtest_id}/reports/${name}`,
            reqOptions
        );

        if (res.status === 200)
        {
            return await res.json();
        }
        else if (res.status === 403)
        {
            window.location = '/logout';
        }
        else
        {
            return {};
        }
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

        const res = await fetch(
            `${REACT_APP_API_URL}/v1/strategy/${strategy_id}/transactions`,
            reqOptions
        );

        if (res.status === 200)
        {
            return await res.json();
        }
        else if (res.status === 403)
        {
            window.location = '/logout';
        }
    }

    async updateAccountMetadata(metadata)
    {
        const { REACT_APP_API_URL } = process.env;
        const reqOptions = {
            method: 'POST',
            headers: this.props.getHeaders(),
            credentials: 'include',
            body: JSON.stringify({
                metadata: metadata
            })
        }

        let res = await fetch(
            `${REACT_APP_API_URL}/v1/account`,
            reqOptions
        );

        if (res.status === 200)
        {
            return true;
        }
        else if (res.status === 403)
        {
            window.location = '/logout';
        }
        else
        {
            return false;
        }
    }

    async updatePositions(broker_id)
    {

    }

    async updateOrders(broker_id)
    {

    }

    async updateStrategyInputVariables(strategy_id, input_variables)
    {
        const { REACT_APP_API_URL } = process.env;
        /** Retrieve strategy info */
        const reqOptions = {
            method: 'POST',
            headers: this.props.getHeaders(),
            credentials: 'include',
            body: JSON.stringify(input_variables)
        }

        let res = await fetch(
            `${REACT_APP_API_URL}/v1/strategy/${strategy_id}/variables`,
            reqOptions
        );

        if (res.status === 200)
        {
            const popup = {
                type: 'control-panel-update-message',
                size: {
                    pixelWidth: 550,
                    pixelHeight: 300
                },
                title: 'Update Successful',
                message: 'Your input variables have been updated successfully. Please restart the script if you wish to utilize your updates now.'
            };
            this.setPopup(popup);
            
            res = await res.json();
        }
        else if (res.status === 403)
        {
            window.location = '/logout';
        }
        else
        {
            const popup = {
                type: 'control-panel-update-message',
                size: {
                    pixelWidth: 550,
                    pixelHeight: 300
                },
                title: 'Failed to Update',
                message: 'Your input variables failed to update. Please try again.'
            };
            this.setPopup(popup);
        }

        let strategy = this.getStrategyInfo(strategy_id);
        for (let name in res.input_variables)
        {
            strategy.input_variables[name] = res.input_variables[name];
        }
        this.updateStrategyInfo();
    }

    async updateAccountInputVariables(strategy_id, broker_id, account_id, input_variables)
    {
        const { REACT_APP_API_URL } = process.env;
        /** Retrieve strategy info */
        const reqOptions = {
            method: 'POST',
            headers: this.props.getHeaders(),
            credentials: 'include',
            body: JSON.stringify(input_variables)
        }

        let res = await fetch(
            `${REACT_APP_API_URL}/v1/strategy/${strategy_id}/variables/${broker_id}/${account_id}`,
            reqOptions
        );

        if (res.status === 200)
        {
            res = await res.json();
        }
        else if (res.status === 403)
        {
            window.location = '/logout';
        }

        return res.input_variables;
    }

    async subscribeEmail(name, email)
    {
        const { REACT_APP_API_URL } = process.env;
        /** Retrieve strategy info */
        const reqOptions = {
            method: 'POST',
            headers: this.props.getHeaders(),
            credentials: 'include',
            body: JSON.stringify({
                name: name,
                email: email
            })
        }

        let res = await fetch(
            `${REACT_APP_API_URL}/v1/analytics/subscribe`,
            reqOptions
        );

        return res.status === 200;
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
                &count=${NUM_LOAD_BARS}&tz=${tz}`.replace(/\s/g, '');

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
                ?count=${NUM_LOAD_BARS}`.replace(/\s/g, '');
            return await fetch(uri, reqOptions)
                .then(res => res = res.text())
                .then(res => {
                    res = res.replace(/\bNaN\b/g, null);
                    return JSON.parse(res);
                });
        }
    }

    async reconnectCharts(broker_id, reset)
    {
        let { charts, broker_charts } = this.state;

        for (let k in charts)
        {
            let chart = charts[k];

            // Reconnect chart live data
            this.connectChart(broker_id, chart.broker, chart.product, chart.period);

            let data = await this.retrieveChartData(
                chart.broker, chart.product, chart.period, 
                this.getCountDateFromDate(chart.period, NUM_LOAD_BARS, moment.utc(), -1), 
                moment.utc(),
                'Australia/Melbourne'
            )
            chart = this.addChart(chart.broker, chart.product, chart.period, data);

            if (reset)
            {
                this.calculateAllChartIndicators(chart, reset);
            }

        }
        this.setState({ charts });

        for (let k in broker_charts)
        {
            let broker_chart = broker_charts[k];
            this.connectChart(broker_id, broker_chart.broker, broker_chart.product, broker_chart.period);
        }
    }

    addChart = (broker, product, period, ohlc_data) =>
    {
        let { charts } = this.state;

        const key = broker + ':' + product + ':' + period;
        charts[key] = {
            broker: broker,
            product: product,
            period: period,
            timestamps: ohlc_data.ohlc.timestamps,
            // asks: ohlc_data.ohlc.asks,
            mids: ohlc_data.ohlc.mids,
            // bids: ohlc_data.ohlc.bids,
            next_timestamp: null,
            lastPrice: 0
        };

        this.generateMissingBars(charts[key]);

        this.setState({ charts });
        return charts[key];
    }

    deleteChart = (broker, product, period) =>
    {
        let { charts } = this.state;
        const key = broker + ':' + product + ':' + period;
        delete charts[key];
        this.setState({ charts });
    }

    addBrokerChart = (broker, product, period) =>
    {
        let { broker_charts } = this.state;

        const key = broker + ':' + product + ':' + period;
        broker_charts[key] = {
            broker: broker,
            product: product,
            period: period,
            timestamp: null,
            ask: null,
            mid: null,
            bid: null
        };

        this.setState({ broker_charts });
        return broker_charts[key];
    }

    addBacktestChart = (backtest_id, broker, product, period, ohlc_data) =>
    {
        let { backtestCharts } = this.state;
        if (!(backtest_id in backtestCharts))
        {
            backtestCharts[backtest_id] = {}
        }

        const key = broker + ':' + product + ':' + period;
        backtestCharts[backtest_id][key] = {
            broker: broker,
            product: product,
            period: period,
            timestamps: ohlc_data.ohlc.timestamps,
            // asks: ohlc_data.ohlc.asks,
            mids: ohlc_data.ohlc.mids,
            // bids: ohlc_data.ohlc.bids,
            next_timestamp: null
        };

        this.generateMissingBars(backtestCharts[backtest_id][key]);

        this.setState({ backtestCharts });
        return backtestCharts[backtest_id][key];
    }

    getChart = (broker, product, period) =>
    {
        const { charts } = this.state;
        return charts[broker + ':' + product + ':' + period];
    }

    getBrokerChart = (broker, product, period) =>
    {
        const { broker_charts } = this.state;
        return broker_charts[broker + ':' + product + ':' + period];
    }

    getBacktestChart = (backtest_id, broker, product, period) =>
    {
        let { backtestCharts } = this.state;
        if (!(backtest_id in backtestCharts))
        {
            backtestCharts[backtest_id] = {}
        }
        return backtestCharts[backtest_id][broker + ':' + product + ':' + period];
    }

    async loadChart(broker_id, broker, product)
    {
        const { REACT_APP_API_URL } = process.env;
        const reqOptions = {
            method: 'POST',
            headers: this.props.getHeaders(),
            credentials: 'include',
            body: JSON.stringify({
                'broker': broker,
                'items': [product]
            })
        }

        const endpoint = `${REACT_APP_API_URL}/v1/strategy/${broker_id}/charts`;
        let res = await fetch(endpoint, reqOptions)
        
        if (res.status === 200)
        {
            return true;
        }
        else if (res.status === 403)
        {
            window.location = '/logout';
        }
        else
        {
            return false;
        }
    }

    connectChart(broker_id, broker, product, period)
    {
        const { sio } = this.state;

        this.loadChart(broker_id, broker, product);
        
        sio.emit('subscribe', {
            broker_id: broker_id,
            field: 'ontick',
            items: {
                [broker]: {
                    [product]: [period]
                }
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
            // asks: [],
            mids: []
            // bids: []
        };
        for (let i = 0; i < chart.timestamps.length; i++)
        {
            const next_ts = chart.timestamps[i];
            // const ask = chart.asks[i];
            const mid = chart.mids[i];
            // const bid = chart.bids[i];
            
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
                    // result.asks.push([null, null, null, null]);
                    result.mids.push([null, null, null, null]);
                    // result.bids.push([null, null, null, null]);
                }
                else
                {
                    // result.asks.push(ask);
                    result.mids.push(mid);
                    // result.bids.push(bid);
                }
                ts += off;
            }
        }
        chart.timestamps = result.timestamps;
        // chart.asks = result.asks;
        chart.mids = result.mids;
        // chart.bids = result.bids;
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
            // chart.asks.push([null,null,null,null]);
            chart.mids.push([null,null,null,null]);
            // chart.bids.push([null,null,null,null]);

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

    addToChartQueue = (item) =>
    {
        const key = item['broker'] + ':' + item['product'] + ':' + item['period'];

        let { chart_queues } = this.state;
        if (!(key in chart_queues))
        {
            chart_queues[key] = [];
        }

        if (item['period'] === 'TICK')
        {
            this.handleChartUpdate(item);
        }
        else
        {
            chart_queues[key].push(item);
            this.setState({ chart_queues });
        }
    }

    handleChartUpdate = (item) => 
    {
        let { charts, broker_charts, chart_queues } = this.state;
        const key = item['broker'] + ':' + item['product'] + ':' + item['period'];
        let chart;
        
        if (item['period'] === 'TICK')
        {
            chart = broker_charts[key];
            chart.timestamp = item['timestamp'];
            chart.ask = item['item']['ask'];
            chart.mid = item['item']['mid'];
            chart.bid = item['item']['bid'];

            this.setState({ broker_charts });
        }
        else
        {
            chart = charts[key];
            let queue = chart_queues[key];
    
            if (chart !== undefined)
            {
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
                    // chart.asks[chart.asks.length-1] = item['item']['ask'];
                    chart.lastPrice = chart.mids[chart.mids.length-1][3];
                    chart.mids[chart.mids.length-1] = item['item']['mid'];
                    // chart.bids[chart.bids.length-1] = item['item']['bid'];
                    this.generateNextTimestamp(chart, item['timestamp']);
                    chart.timestamps.push(chart.next_timestamp);
                    // chart.asks.push([null,null,null,null]);
                    chart.mids.push([null,null,null,null]);
                    // chart.bids.push([null,null,null,null]);

                    // if (this.strategy)
                    // {
                    //     this.strategy.advanceBar(this.getPeriodOffsetSeconds(item['period']));
                    // }
                }
                else if (item['timestamp'] >= chart.next_timestamp)
                {
                    // If real timestamp ahead of chart timestamp
                    this.generateNextTimestamp(chart, item['timestamp']);
                    // chart.asks[chart.asks.length-1] = item['item']['ask'];
                    chart.mids[chart.mids.length-1] = item['item']['mid'];
                    // chart.bids[chart.bids.length-1] = item['item']['bid'];
                }
                else if (!(item['timestamp'] < chart.next_timestamp - this.getPeriodOffsetSeconds(item['period'])))
                {
                    // Update Latest Bar
                    // chart.asks[chart.asks.length-1] = item['item']['ask'];
                    chart.lastPrice = chart.mids[chart.mids.length-1][3];
                    chart.mids[chart.mids.length-1] = item['item']['mid'];
                    // chart.bids[chart.bids.length-1] = item['item']['bid'];
                }
        
                this.calculateAllChartIndicators(chart);
                queue.splice(0, 1);
                
                this.setState({ charts, chart_queues });
                this.updateInfo();
        }
    
        }
    }

    updateChart = (broker, product, period, ohlc_data) =>
    {
        let { charts } = this.state;
        const chart = charts[broker + ':' + product + ':' + period];

        const dup = ohlc_data.timestamps.filter((val) =>
        {
            return chart.timestamps.indexOf(val) !== -1;
        });

        chart.timestamps = [
            ...ohlc_data.timestamps.slice(0,ohlc_data.timestamps.length-dup.length),
            ...chart.timestamps
        ];
        // chart.asks = [
        //     ...ohlc_data.asks.slice(0, ohlc_data.asks.length-dup.length), 
        //     ...chart.asks
        // ];
        chart.mids = [
            ...ohlc_data.mids.slice(0, ohlc_data.mids.length-dup.length), 
            ...chart.mids
        ];
        // chart.bids = [
        //     ...ohlc_data.bids.slice(0, ohlc_data.bids.length-dup.length), 
        //     ...chart.bids
        // ];

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
        // chart.asks = [
        //     ...ohlc_data.asks.slice(0, ohlc_data.asks.length-dup.length), 
        //     ...chart.asks
        // ];
        chart.mids = [
            ...ohlc_data.mids.slice(0, ohlc_data.mids.length-dup.length), 
            ...chart.mids
        ];
        // chart.bids = [
        //     ...ohlc_data.bids.slice(0, ohlc_data.bids.length-dup.length), 
        //     ...chart.bids
        // ];

        this.generateMissingBars(chart);
        this.filterChart(chart, true);

        this.setState({ backtestCharts });
    }

    filterChart = (chart, reset) =>
    {
        let i = chart.timestamps.length-1;
        let ts = chart.timestamps[i];
        let filteredTimestamps = [];
        // let filteredAsks = [];
        let filteredMids = [];
        // let filteredBids = [];
        let until;

        if (reset || chart.filteredTimestamps === undefined)
        {
            until = 0;

            chart.filteredTimestamps = [];
            // chart.filteredAsks = [];
            chart.filteredMids = [];
            // chart.filteredBids = [];
        }
        else
        {
            until = chart.filteredTimestamps[chart.filteredTimestamps.length-1];
        }

        while (ts > until && i >= 0)
        {
            if (chart.mids && chart.mids[i] && chart.mids[i][0] !== null && chart.mids[i][0] !== null)
            {
                filteredTimestamps.unshift(ts)
                // filteredAsks.unshift(chart.asks[i])
                filteredMids.unshift(chart.mids[i])
                // filteredBids.unshift(chart.bids[i])
            }
            i--;
            ts = chart.timestamps[i];
        }
        chart.filteredTimestamps = chart.filteredTimestamps.concat(filteredTimestamps);
        // chart.filteredAsks = chart.filteredAsks.concat(filteredAsks);
        chart.filteredMids = chart.filteredMids.concat(filteredMids);
        // chart.filteredBids = chart.filteredBids.concat(filteredBids);

        if (
            // chart.asks[chart.asks.length-1][0] !== null && 
            chart.mids[chart.mids.length-1][0] !== null
            // chart.bids[chart.bids.length-1][0] !== null
        )
        {
            // chart.filteredAsks[chart.filteredAsks.length-1] = chart.asks[chart.asks.length-1];
            chart.filteredMids[chart.filteredMids.length-1] = chart.mids[chart.mids.length-1];
            // chart.filteredBids[chart.filteredBids.length-1] = chart.bids[chart.bids.length-1];
        }

        return chart;
    }

    findIndicator = (type, broker, product, chart_period, period) =>
    {
        const { indicators } = this.state;
        for (let ind of indicators)
        {
            if (
                ind.type === type && 
                ind.broker === broker &&
                ind.product === product && 
                ind.chart_period === chart_period && 
                ind.period === period
            )
            {
                return ind;
            }
        }
        return undefined;
    }

    createIndicator = (type, broker, product, chart_period, properties, appearance) =>
    {
        let { indicators } = this.state;
        const ind = new Indicator[type](broker, product, chart_period, properties, appearance);
        indicators.push(ind);
        this.setState({ indicators });
        return ind;
    }

    findBacktestIndicator = (backtest_id, type, broker, product, chart_period, period) =>
    {
        const { backtest_indicators } = this.state;
        if (backtest_id in backtest_indicators)
        {
            for (let ind of backtest_indicators[backtest_id])
            {
                if (
                    ind.type === type && 
                    ind.broker === broker &&
                    ind.product === product && 
                    ind.chart_period === chart_period &&
                    ind.period === period
                )
                {
                    return ind;
                }
            }

        }
        return undefined;
    }

    createBacktestIndicator = (backtest_id, type, broker, product, chart_period, properties) =>
    {
        let { backtest_indicators } = this.state;

        if (!(backtest_id in backtest_indicators))
        {
            backtest_indicators[backtest_id] = [];
        }

        const ind = new Indicator[type](broker, product, chart_period, properties);
        backtest_indicators[backtest_id].push(ind);
        this.setState({ backtest_indicators });

        return ind;
    }

    calculateAllChartIndicators = (chart, reset) =>
    {
        if (reset)
        {
            chart = this.filterChart(chart, true);
        }
        else
        {
            chart = this.filterChart(chart, false);
        }

        const { indicators } = this.state;
        for (let ind of indicators)
        {
            if (
                ind.broker === chart.broker && 
                ind.product === chart.product && 
                ind.chart_period === chart.period
            )
            {
                if (reset)
                {
                    ind.reset();
                }

                ind.calc(
                    [...chart.filteredTimestamps], 
                    // [...chart.filteredAsks], 
                    [...chart.filteredMids]
                    // [...chart.filteredBids]
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
            // [...chart.filteredAsks], 
            [...chart.filteredMids]
            // [...chart.filteredBids]
        );
    }

    resetIndicators = (chart) =>
    {
        const { indicators } = this.state;
        for (let ind of indicators)
        {
            if (ind.broker === chart.broker && ind.product === chart.product && ind.chart_period === chart.period)
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

    async requestStrategyStatusUpdate(strategy_id, broker_id, body, new_status)
    {
        const { REACT_APP_API_URL } = process.env;
        const reqOptions = {
            method: 'POST',
            headers: this.props.getHeaders(),
            credentials: 'include',
            body: JSON.stringify(body)
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
        else if (res.status === 403)
        {
            window.location = '/logout';
        }
        else
        {
            this.toolbar.setStatusMsg(null);

            const popup = {
                type: 'start-failed',
                size: {
                    pixelWidth: 550,
                    pixelHeight: 300
                },
                image: '/start_failed.png'
            };
            this.setPopup(popup);
        }
    }

    async retrieveHolyGrailUser()
    {
        const { REACT_APP_API_URL } = process.env;

        var requestOptions = {
            method: 'GET',
            headers: this.props.getHeaders(),
            credentials: 'include'
        };

        const res = await fetch(`${REACT_APP_API_URL}/v1/holygrail/${this.props.getUserId()}`, requestOptions);

        if (res.status === 200)
        {
            const data = await res.json();
            return data
        }

        return {};
    }

    getAppContainer = () =>
    {
        return this.appContainer;
    }
    
    getAccountMetadata = () =>
    {
        let { account } = this.state;
        if ('metadata' in account)
        {
            return account.metadata;
        }
        
        return undefined;
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

    getAllStrategyInfo = () =>
    {
        return this.state.strategyInfo;
    }

    getStrategyAccountStatus = (strategy_id, account_id) =>
    {
        const { strategyInfo } = this.state;
        return strategyInfo[strategy_id].accounts[account_id];
    }

    getStrategyComponent = () =>
    {
        return this.strategy;
    }

    async startScript(broker_id, account_id, input_variables)
    {
        const user_id = await this.props.checkAuthorization();
        if (!user_id)
        {
            window.location = '/logout';
        }

        // this.toolbar.setStatusMsg('Initializing script...');

        const { account } = this.state;
        const strategy_id = account.metadata.current_strategy;
        await this.requestStrategyStatusUpdate(
            strategy_id, broker_id, 
            { 
                accounts: [account_id],
                input_variables: input_variables
            }, 
            'start'
        );

        if (this.strategy)
        {
            this.strategy.clearScriptDrawings(broker_id, account_id);
        }
    }

    async stopScript(broker_id, account_id)
    {
        const user_id = await this.props.checkAuthorization();
        if (!user_id)
        {
            window.location = '/logout';
        }

        this.toolbar.setStatusMsg('Stopping strategy...');

        const { account } = this.state;
        const strategy_id = account.metadata.current_strategy;
        await this.requestStrategyStatusUpdate(
            strategy_id, broker_id, 
            { accounts: [account_id] }, 
            'stop'
        );
        this.toolbar.setStatusMsg(null);
    }

    setStatusMsg = (msg) =>
    {
        this.toolbar.setStatusMsg(msg);
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
                if (i !== null && i.getItemId() === item_id)
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
        if (e.target.getAttribute('class').includes('tab item'))
        {
            const strategy_id = e.target.getAttribute('name');
    
            let { account } = this.state;
            if (account.metadata.current_strategy !== strategy_id)
            {
                account.metadata.current_strategy = strategy_id;
                this.setState({ account });

                this.updateAccountMetadata(account.metadata);
            }
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

    gotoPage(e)
    {
        const page = e.target.getAttribute('name');
        const strategy = this.getCurrentStrategy()
        let { strategyInfo } = this.state;
        strategyInfo[strategy].current_page = parseInt(page);

        this.setState({ strategyInfo });
    }

    pageRight()
    {
        const strategy = this.getCurrentStrategy()
        let { strategyInfo } = this.state;
        if (strategyInfo[strategy].current_page === undefined)
        {
            strategyInfo[strategy].current_page = 0;
        }

        strategyInfo[strategy].current_page += 1;
        this.setState({ strategyInfo });
    }

    pageLeft()
    {
        const strategy = this.getCurrentStrategy()
        let { strategyInfo } = this.state;
        if (strategyInfo[strategy].current_page === undefined)
        {
            strategyInfo[strategy].current_page = 0;
        }

        strategyInfo[strategy].current_page -= 1;
        this.setState({ strategyInfo });
    }

    addPage()
    {
        const strategy = this.getCurrentStrategy()
        let { strategyInfo } = this.state;
        if (strategyInfo[strategy].pages.length < 10)
        {
            strategyInfo[strategy].pages.push(String(strategyInfo[strategy].pages.length+1));
        }

        this.setState({ strategyInfo });
    }

    deletePageConfirmation()
    {
        const popup = {
            type: 'are-you-sure',
            size: {
                width: 30,
                height: 20
            },
            message: "This will permanently delete the page.",
            func: this.deletePage.bind(this)
        }
        this.setPopup(popup);
    }

    deletePage()
    {
        const strategy_id = this.getCurrentStrategy()
        let { strategyInfo } = this.state;
        let strategy = strategyInfo[strategy_id];

        const current_page = strategy.current_page;
        for (let i = strategy.windows.length-1; i >= 0; i--)
        {
            if (strategy.windows[i].page === current_page)
            {
                strategy.windows.splice(i, 1);
            }
            else if (strategy.windows[i].page > current_page)
            {
                strategy.windows[i].page -= 1;
            }
        }
        strategy.pages.splice(current_page, 1);
        strategy.current_page = Math.max(strategy.current_page - 1, 0);

        this.setState({ strategyInfo });
    }

    getPage = () => 
    {
        const strategy = this.getCurrentStrategy()
        let { strategyInfo } = this.state;
        if (strategyInfo[strategy].current_page === undefined)
        {
            strategyInfo[strategy].current_page = 0;
        }

        return strategyInfo[strategy].current_page;
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

    addToSave = (strategy_id, item_ids, timeout) =>
    {
        if (!strategy_id.includes('/backtest/'))
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
            this.onSaveTimeout(timeout);
            this.setState({ toSave, lastChange });
        }
    }

    addHistory = (strategy_id, new_item) =>
    {
        let { history } = this.state;
        this.addToSave(strategy_id, [new_item.id], WAIT_FOR_SAVE);
        
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

    onSaveTimeout = (timeout) =>
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
        }, (timeout+1)*1000);
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

    async updateCurrentAccount(strategy_id, account_code)
    {
        const { REACT_APP_API_URL } = process.env;
        var requestOptions = {
            method: 'PUT',
            credentials: 'include',
            headers: this.props.getHeaders(),
            body: JSON.stringify({
                account_code: account_code
            })
        };

        const res = await fetch(`${REACT_APP_API_URL}/v1/strategy/${strategy_id}/current_account`, requestOptions);

        if (res.status === 200)
        {
            return true;
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
                to_update[s_id].settings = this.getStrategyInfo(s_id).settings;
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

            if (status === 403)
            {
                window.location = '/logout';
            }
            else if (status !== 200)
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

            if (status === 403)
            {
                window.location = '/logout';
            }
            else if (status !== 200)
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

    onCloseTab = (e) =>
    {
        const strategy_id = e.target.getAttribute('name');
        const popup = {
            type: 'are-you-sure',
            size: {
                pixelWidth: 420,
                pixelHeight: 220
            },
            message: "Are you sure you want to close this tab?",
            func: this.performCloseTab.bind(this),
            args: [strategy_id]
        }
        this.setPopup(popup);
    }

    performCloseTab = (args) =>
    {
        const strategy_id = args[0];

        let { account } = this.state;
        if (account.metadata.open_strategies.includes(strategy_id))
        {
            const idx = account.metadata.open_strategies.indexOf(strategy_id);
            account.metadata.open_strategies.splice(idx, 1);
        }
        
        if (account.metadata.current_strategy === strategy_id)
        {
            if (account.metadata.open_strategies.length > 0)
            {
                account.metadata.current_strategy = account.metadata.open_strategies[0];
            }
            else
            {
                account.metadata.current_strategy = null;
            }
        }

        // console.log(account.metadata);

        // this.setState({ account });
        this.updateAccountMetadata(account.metadata);
        window.location.reload();
    }

    onNotAvailableItem = (e) =>
    {
        const popup = {
            type: 'coming-soon',
            size: {
                pixelWidth: 600,
                pixelHeight: 760
            }
        }
        this.setPopup(popup);
    }

    onSelectStrategy = (e) =>
    {
        const popup = {
            type: 'select-strategy',
            size: {
                pixelWidth: 500,
                pixelHeight: 550
            }
        }
        this.setPopup(popup);
    }

    onFirstVisit = () =>
    {
        if (this.props.isDemo)
        {
            let first_visit = this.props.getCookies().get('first-visit');
            if (first_visit === undefined)
            {
                setTimeout(() => {
                    const popup = {
                        type: 'email-subscribe',
                        size: {
                            width: 30,
                            height: 37
                        },
                        fade: true
                    }
                    this.setPopup(popup);
                    this.props.getCookies().set('first-visit', true);
                    this.props.firstVisitorCounter();
                }, 5*1000);
            }
        }
        
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

    getTimezones()
    {
        return [
            'UTC',
            'Pacific/Honolulu',
            'America/Juneau',
            'America/Los_Angeles',
            'America/Phoenix',
            'America/Vancouver',
            'America/Denver',
            'America/Bogota',
            'America/Chicago',
            'America/Lima',
            'America/Mexico_City',
            'America/Caracas',
            'America/New_York',
            'America/Santiago',
            'America/Toronto',
            'America/Buenos_Aires',
            'America/Sao_Paulo',
            'Atlantic/Reykjavik',
            'Europe/Dublin',
            'Africa/Lagos',
            'Europe/Lisbon',
            'Europe/London',
            'Europe/Amsterdam',
            'Europe/Belgrade',
            'Europe/Berlin',
            'Europe/Brussels',
            'Africa/Cairo',
            'Europe/Copenhagen',
            'Africa/Johannesburg',
            'Europe/Luxembourg',
            'Europe/Madrid',
            'Europe/Malta',
            'Europe/Oslo',
            'Europe/Paris',
            'Europe/Rome',
            'Europe/Stockholm',
            'Europe/Warsaw',
            'Europe/Zurich',
            'Europe/Athens',
            'Asia/Bahrain',
            'Europe/Helsinki',
            'Europe/Istanbul',
            'Asia/Jerusalem',
            'Asia/Kuwait',
            'Europe/Moscow',
            'Asia/Qatar',
            'Europe/Riga',
            'Asia/Riyadh',
            'Europe/Tallinn',
            'Europe/Vilnius',
            'Asia/Dubai',
            'Asia/Muscat',
            'Asia/Tehran',
            'Asia/Ashkhabad',
            'Asia/Kolkata',
            'Asia/Almaty',
            'Asia/Bangkok',
            'Asia/Ho_Chi_Minh',
            'Asia/Jakarta',
            'Asia/Chongqing',
            'Asia/Hong_Kong',
            'Australia/Perth',
            'Asia/Shanghai',
            'Asia/Singapore',
            'Asia/Taipei',
            'Asia/Seoul',
            'Asia/Tokyo',
            'Australia/Adelaide',
            'Australia/Brisbane',
            'Australia/Sydney',
            'Pacific/Norfolk',
            'Pacific/Auckland',
            'Pacific/Chatham'
        ]
    }

    getWeekendDates(ts)
    {
        const dow = [...Array(7).keys(),...Array(7).keys()];
        const fri = 5;
        const sun = 0;
        ts *= 1000;
        
        const dt = moment.utc(ts).tz("America/New_York");
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

        let ts = moment.utc().unix();
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

    setShowLoadScreen = (show_load_screen) =>
    {
        this.setState({ show_load_screen });
    }

    getMetadata = (strategy_id, item_id) =>
    {
        const { metadata } = this.state;
        if (strategy_id in metadata)
        {
            return metadata[strategy_id][item_id];
        }
    }

    setMetadata = (strategy_id, item_id, new_metadata) =>
    {
        let { metadata } = this.state;
        if (!(strategy_id in metadata))
        {
            metadata[strategy_id] = {};
        }
        if (!(item_id in metadata[strategy_id]))
        {
            metadata[strategy_id][item_id] = {}
        }

        metadata[strategy_id][item_id] = new_metadata;
        this.setState({ metadata });
    }

    convertOutgoingPositionSize = (broker, size) =>
    {
        // if (broker === 'spotware')
        // {
        //     return parseInt(size * 10000000);
        // }
        // else if (broker === 'oanda')
        // {
        //     return parseInt(size * 1000000);
        // }
        // else
        // {
        //     return size;
        // }
        return size;
    }

    convertIncomingPositionSize = (broker, size) =>
    {
        // if (broker === 'spotware')
        // {
        //     return Math.round(size / 10000000 * 100) / 100;
        // }
        // if (broker === 'oanda')
        // {
        //     return Math.round(size * 100000) / 100000;
        // }
        // else
        // {
        //     return Math.round(size * 10000) / 10000;
        // }
        return Math.round(size * 10000) / 10000;

    }

    hasBetaAccess = () =>
    {
        const { account } = this.state;
        return account.beta_access;
    }

    setStrategyOnConnect = (strategyOnConnect) =>
    {
        this.setState({ strategyOnConnect });
    }

    hexToRgb(hex) 
    {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
    }

    useBlackText(rgb)
    {
        return rgb.r*0.299 + rgb.g*0.587 + rgb.b*0.114 > 186;
    }

}

const SPACEBAR = 32;
const WAIT_FOR_SAVE = 5;
const NUM_LOAD_BARS = 500;

export default withRouter(StrategyApp);