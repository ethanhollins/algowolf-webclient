import React, { Component } from 'react';
import ChartSettings from './popups/ChartSettings';
import BrokerSettings from './popups/BrokerSettings';
import StrategySettings from './popups/StrategySettings';
import WelcomeDemo from './popups/WelcomeDemo';
import WelcomeLive from './popups/WelcomeLive';
import NotAvailable from './popups/NotAvailable';
import BetaUnavailable from './popups/BetaUnavailable';
import LiveSignalService from './popups/LiveSignalService';
import RequestDemoAccess from './popups/RequestDemoAccess';
import ReadyToLaunch from './popups/ReadyToLaunch';
import SignUpPrompt from './popups/SignUpPrompt';
import AreYouSure from './popups/AreYouSure';
import EmailSubscribe from './popups/EmailSubscribe';
import EmailSubscribeComplete from './popups/EmailSubscribeComplete';
import IndicatorSettings from './popups/IndicatorSettings';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faChevronRight, faPlus
} from '@fortawesome/pro-regular-svg-icons';
import { 
    faTimes
} from '@fortawesome/pro-light-svg-icons';
import DownForMaintenance from './popups/DownForMaintenance';
import BrokerMessage from './popups/BrokerMessage';
import StartFailed from './popups/StartFailed';
import Notice from './popups/Notice';
import ControlPanelUpdateMessage from './popups/ControlPanelUpdateMessage';
import ComingSoon from './popups/ComingSoon';
import AccountLoggedOut from './popups/AccountLoggedOut';
import SelectStrategy from './popups/SelectStrategy';
import GettingStarted from './popups/GettingStarted';
import Tos from './popups/Tos';
import MessageBoard from './popups/MessageBoard';

class Popup extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            is_down: false,
            opened: props.opened,
            hovered: [false, false]
        }
        this.setPopupBody = elem => {
            this.popupBody = elem;
        };
        this.setPopupFade = elem => {
            this.popupFade = elem;
        };

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onResize = this.onResize.bind(this);
    }

    componentDidMount()
    {
        window.addEventListener("mousedown", this.onMouseDown);
        window.addEventListener("mouseup", this.onMouseUp);
        window.addEventListener("resize", this.onResize);
    }

    componentWillUnmount()
    {
        window.removeEventListener("mousedown", this.onMouseDown);
        window.removeEventListener("mouseup", this.onMouseUp);
        window.removeEventListener("resize", this.onResize);
    }

    render()
    {
        return(
            <React.Fragment>

            <div key={'fade'} ref={this.setPopupFade} className={'popup fade' + this.isBlockAppOnly()}></div>

            <div 
                key={'body'}
                ref={this.setPopupBody} className='popup body' 
                onMouseEnter={this.setMainHoverOn} onMouseLeave={this.setMainHoverOff}
            >
                {this.generatePopup()}
                {this.generateCloseIcon()}
                
            </div>

            </React.Fragment>
        );
    }

    onMouseDown(e)
    {
        if (this.props.getPopup() !== null)
        {
            let { is_down } = this.state;
            is_down = true;
            this.setState({ is_down });
        }
    }

    onMouseUp(e)
    {
        let { is_down } = this.state;
        if (this.props.getPopup() !== null)
        {
            const mouse_pos = {
                x: e.clientX, y: e.clientY
            }
            if (
                is_down &&
                !this.props.isTopWindow(
                    this.props.getStrategyId(), 'popup', mouse_pos
                )
            )
            {
                this.close();
            }
        }
        is_down = false;
        this.setState({ is_down });
    }

    onResize(e)
    {
        if (this.props.getPopup() !== null)
        {
            this.handleBody();
        }
    }

    close = () =>
    {
        if (!(this.props.getPopup() && this.props.getPopup().permanent))
        {
            this.props.setPopup(null);
            this.props.setHovered('popup', false);
        }
    }

    forceClose = () =>
    {
        this.props.setPopup(null);
        this.props.setHovered('popup', false);
    }

    generateCloseIcon()
    {
        if (this.props.getPopup() && this.props.getPopup().permanent)
        {
            return <React.Fragment />;
        }
        else
        {
            return (
                <div className='popup close'>
                    <FontAwesomeIcon icon={faTimes} className='popup close-icon' onClick={this.close} />
                </div>
            );
        }
    }

    generatePopup()
    {
        if (this.props.getPopup())
        {
            this.getPopupElem().style.display = 'flex';
            const popup = this.props.getPopup();
            if (popup.fade === true)
            {
                this.popupFade.style.display = 'block';
            }
            else
            {
                this.popupFade.style.display = 'none';
            }
            this.handleBody();

            // if (popup.type === 'windows-charts')
            // {
            //     return this.generateWindowsCharts();
            // }
            // else if (popup.type === 'windows-stats')
            // {
            //     return this.generateWindowsStats();
            // }
            // else if (popup.type === 'general-settings')
            // {
            //     return this.generateGeneralSettings();
            // }
            if (popup.type === 'broker-settings')
            {
                return <BrokerSettings 
                    getPopup={this.props.getPopup}
                    getHeaders={this.props.getHeaders}
                    onChangeCategory={this.onChangeCategory}
                    changeCategory={this.changeCategory}
                    getWindowInfo={this.props.getWindowInfo}
                    retrieveAllBrokers={this.props.retrieveAllBrokers}
                    getStrategyId={this.props.getStrategyId}
                    getStrategyInfo={this.props.getStrategyInfo}
                    retrieveStrategies={this.props.retrieveStrategies}
                    updateStrategyInfo={this.props.updateStrategyInfo}
                    setHoverOn={this.setHoverOn}
                    setHoverOff={this.setHoverOff}
                    getServerUrl={this.props.getServerUrl}
                />
            }
            else if (popup.type === 'strategy-settings')
            {
                return <StrategySettings 
                    getPopup={this.props.getPopup}
                    onChangeCategory={this.onChangeCategory}
                    changeCategory={this.changeCategory}
                    getWindowInfo={this.props.getWindowInfo}
                    getStrategyId={this.props.getStrategyId}
                    getStrategyInfo={this.props.getStrategyInfo}
                    getAllStrategyInfo={this.props.getAllStrategyInfo}
                    updateStrategyInfo={this.props.updateStrategyInfo}
                    setHoverOn={this.setHoverOn}
                    setHoverOff={this.setHoverOff}
                />
            }
            else if (popup.type === 'select-strategy')
            {
                return <SelectStrategy 
                    getPopup={this.props.getPopup}
                    setPopup={this.props.setPopup}
                    onChangeCategory={this.onChangeCategory}
                    changeCategory={this.changeCategory}
                    getWindowInfo={this.props.getWindowInfo}
                    getStrategyId={this.props.getStrategyId}
                    getStrategyInfo={this.props.getStrategyInfo}
                    getAllStrategyInfo={this.props.getAllStrategyInfo}
                    updateStrategyInfo={this.props.updateStrategyInfo}
                    retrieveStrategyDetails={this.props.retrieveStrategyDetails}
                    getHeaders={this.props.getHeaders}
                    getAccountMetadata={this.props.getAccountMetadata}
                    updateAccountMetadata={this.props.updateAccountMetadata}
                />
            }
            else if (popup.type === 'chart-settings')
            {
                return <ChartSettings 
                    close={this.close}
                    getPopup={this.props.getPopup}
                    onChangeCategory={this.onChangeCategory}
                    changeCategory={this.changeCategory}
                    getContainerSize={this.props.getContainerSize}
                    getWindowInfo={this.props.getWindowInfo}
                    getStrategyId={this.props.getStrategyId}
                    getStrategyInfo={this.props.getStrategyInfo}
                    updateStrategyInfo={this.props.updateStrategyInfo}
                    setHoverOn={this.setHoverOn}
                    setHoverOff={this.setHoverOff}
                    getTimezones={this.props.getTimezones}
                    addToSave={this.props.addToSave}
                    getPopupElem={this.getPopupElem}
                />
            }
            else if (popup.type === 'indicator-settings')
            {
                return <IndicatorSettings 
                    close={this.close}
                    getPopup={this.props.getPopup}
                    onChangeCategory={this.onChangeCategory}
                    changeCategory={this.changeCategory}
                    getContainerSize={this.props.getContainerSize}
                    getWindowInfo={this.props.getWindowInfo}
                    getStrategyId={this.props.getStrategyId}
                    getStrategyInfo={this.props.getStrategyInfo}
                    resetIndicators={this.props.resetIndicators}
                    findIndicator={this.props.findIndicator}
                    calculateAllChartIndicators={this.props.calculateAllChartIndicators}
                />
            }
            else if (popup.type === 'message-board')
            {
                return <MessageBoard
                    getPopup={this.props.getPopup}
                    getServerUrl={this.props.getServerUrl}
                    getHeaders={this.props.getHeaders}
                    getStrategyId={this.props.getStrategyId}
                    getStrategyInfo={this.props.getStrategyInfo}
                />
            }
            else if (popup.type === 'welcome-demo')
            {
                return <WelcomeDemo
                    getPopup={this.props.getPopup}
                />
            }
            else if (popup.type === 'welcome-live')
            {
                return <WelcomeLive
                    getPopup={this.props.getPopup}
                />
            }
            else if (popup.type === 'getting-started')
            {
                return <GettingStarted
                    getPopup={this.props.getPopup}
                />
            }
            else if (popup.type === 'not-available')
            {
                return <NotAvailable
                    getPopup={this.props.getPopup}
                />
            }
            else if (popup.type === 'coming-soon')
            {
                return <ComingSoon
                    getPopup={this.props.getPopup}
                    close={this.close}
                />
            }
            else if (popup.type === 'beta-unavailable')
            {
                return <BetaUnavailable
                    isDemo={this.props.isDemo}
                    history={this.props.history}
                    getPopup={this.props.getPopup}
                />
            }
            else if (popup.type === 'broker-message')
            {
                return <BrokerMessage
                    isDemo={this.props.isDemo}
                    history={this.props.history}
                    getPopup={this.props.getPopup}
                />
            }
            else if (popup.type === 'down-for-maintenance')
            {
                return <DownForMaintenance
                    isDemo={this.props.isDemo}
                    history={this.props.history}
                    getPopup={this.props.getPopup}
                />
            }
            else if (popup.type === 'start-failed')
            {
                return <StartFailed
                    isDemo={this.props.isDemo}
                    history={this.props.history}
                    getPopup={this.props.getPopup}
                    close={this.close}
                />
            }
            else if (popup.type === 'control-panel-update-message')
            {
                return <ControlPanelUpdateMessage
                    isDemo={this.props.isDemo}
                    history={this.props.history}
                    getPopup={this.props.getPopup}
                    close={this.close}
                />
            }
            else if (popup.type === 'notice')
            {
                return <Notice
                    isDemo={this.props.isDemo}
                    history={this.props.history}
                    getPopup={this.props.getPopup}
                />
            }
            else if (popup.type === 'live-signal-service')
            {
                return <LiveSignalService
                    isDemo={this.props.isDemo}
                    history={this.props.history}
                    getPopup={this.props.getPopup}
                />
            }
            else if (popup.type === 'request-demo-access')
            {
                return <RequestDemoAccess
                    isDemo={this.props.isDemo}
                    history={this.props.history}
                    getUserId={this.props.getUserId}
                    getHeaders={this.props.getHeaders}
                    getPopup={this.props.getPopup}
                />
            }
            else if (popup.type === 'ready-to-launch')
            {
                return <ReadyToLaunch
                    isDemo={this.props.isDemo}
                    history={this.props.history}
                    getPopup={this.props.getPopup}
                />
            }
            else if (popup.type === 'sign-up-prompt')
            {
                return <SignUpPrompt
                    history={this.props.history}
                    getPopup={this.props.getPopup}
                />
            }
            else if (popup.type === 'are-you-sure')
            {
                return <AreYouSure
                    close={this.close}
                    getPopup={this.props.getPopup}
                />
            }
            else if (popup.type === 'email-subscribe')
            {
                return <EmailSubscribe
                    close={this.close}
                    getPopup={this.props.getPopup}
                    setPopup={this.props.setPopup}
                    subscribeEmail={this.props.subscribeEmail}
                />
            }
            else if (popup.type === 'email-subscribe-complete')
            {
                return <EmailSubscribeComplete
                    close={this.close}
                    getPopup={this.props.getPopup}
                />
            }
            else if (popup.type === 'account-logged-out')
            {
                return <AccountLoggedOut
                    close={this.close}
                    getPopup={this.props.getPopup}
                    getHeaders={this.props.getHeaders}
                    getStrategyId={this.props.getStrategyId}
                    getServerUrl={this.props.getServerUrl}
                />
            }
            else if (popup.type === 'tos')
            {
                return <Tos
                    getPopup={this.props.getPopup}
                    setPopup={this.props.setPopup}
                    updateTos={this.props.updateTos}
                    close={this.close}
                    forceClose={this.forceClose}
                />
            }
            // else if (popup.type === 'chart-indicators')
            // {
            //     return this.generateChartIndicators();
            // }
            // else if (popup.type === 'welcome')
            // {
            //     return this.generateWelcome();
            // }

        }
        else if (this.getPopupElem() !== undefined)
        {
            this.getPopupElem().style.display = 'none';
            this.popupFade.style.display = 'none';
        }
    }

    handleBody()
    {
        const popup = this.props.getPopup();
        const container_size = this.props.getSize();

        let width;
        let height;
        if ('pixelWidth' in popup.size && 'pixelHeight' in popup.size )
        {
            width = popup.size.pixelWidth;
            height = popup.size.pixelHeight;
            this.getPopupElem().style.top = parseInt((container_size.height/2) - height/2) + 'px';
        }
        else
        {
            width = Math.max(Math.min(container_size.width * (popup.size.width / 100), 1200), 600);
            height = container_size.height * (popup.size.height / 100);
            this.getPopupElem().style.top = parseInt((container_size.height/2) * (1 - (popup.size.height / 100))) + 'px';
        }
        // Handle Sizing
        this.getPopupElem().style.left = parseInt((container_size.width/2) * (1 - (width / container_size.width))) + 'px';
        this.getPopupElem().style.width = parseInt(width) + 'px';
        this.getPopupElem().style.height = parseInt(height) + 'px';
    }

    onChangeCategory = (e) =>
    {
        this.props.setPopupOpened(e.target.getAttribute('name'));
    }

    changeCategory = (name) =>
    {
        this.props.setPopupOpened(name);
    }

    generateId = () =>
    {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const id_length = 6;

        let result = '';
        while (result === '' || this.props.windowExists(this.props.getStrategyId(), result))
        {
            const charactersLength = characters.length;
            for ( let i = 0; i < id_length; i++ ) 
            {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
        }
        return result;
    }

    addChart = (e) =>
    {
        const chart = {
            id: this.generateId(),
            page: 0,
            type: "chart",
            pos: { x: 0, y: 0 },
            size: { width: 50, height: 50 },
            maximised: false,
            properties: {
                product: e.target.getAttribute('name'),
                period: "D",
                price: "bids",
                portion: 1.0,
                overlays: [],
                studies: [],
                drawing_layers: [0]
            }
        };
        this.props.addWindow(this.props.getStrategyId(), chart);
        this.close();
    }

    getInstrumentsItems()
    {
        const popup = this.props.getPopup();

        if (popup.opened === 'currencies')
        {
            const major = [];
            for (let i of MAJOR_PAIRS)
            {
                major.push(
                    <div key={i} className='popup item btn' onClick={this.addChart} name={i}>
                        <span className='popup item-left'>{i}</span>
                        <span className='popup item-right'><FontAwesomeIcon icon={faPlus} className='popup item-icon' /></span>
                    </div>
                );
            }
            const minor = [];
            for (let i of MINOR_PAIRS)
            {
                minor.push(
                    <div key={i} className='popup item btn' onClick={this.addChart} name={i}>
                        <span className='popup item-left'>{i}</span>
                        <span className='popup item-right'><FontAwesomeIcon icon={faPlus} className='popup item-icon' /></span>
                    </div>
                );
            }

            return (
                <React.Fragment>

                <div className='popup item title'>
                    <span className='popup item-left'>MAJOR</span>
                </div>
                {major}
                <div className='popup item title'>
                    <span className='popup item-left'>MINOR</span>
                </div>
                {minor}

                </React.Fragment>
            );
        }
        else
        {
            return <React.Fragment />;
        }
    }

    getIndicatorItems()
    {

    }

    generateWindowsCharts()
    {
        return (
            <React.Fragment>
            
            <div className='popup header'>
                <span>Markets</span>
            </div>
            <div className='popup search'>

            </div>
            <div className='popup content'>
                <div className='popup category'>
                    <div className={'popup category-btn' + this.isSelected('cryptocurrencies')} onClick={this.onChangeCategory} name='cryptocurrencies'>
                        <span className='popup category-left'>Cryptocurrencies</span>
                        <span className='popup category-right'><FontAwesomeIcon icon={faChevronRight} className='popup category-icon' /></span>
                    </div>
                    <div className={'popup category-btn' + this.isSelected('currencies')} onClick={this.onChangeCategory} name='currencies'>
                        <span className='popup category-left'>Currencies</span>
                        <span className='popup category-right'><FontAwesomeIcon icon={faChevronRight} className='popup category-icon' /></span>
                    </div>
                    <div className={'popup category-btn' + this.isSelected('stocks')} onClick={this.onChangeCategory} name='stocks'>
                        <span className='popup category-left'>Stocks</span>
                        <span className='popup category-right'><FontAwesomeIcon icon={faChevronRight} className='popup category-icon' /></span>
                    </div>
                    <div className={'popup category-btn'+ this.isSelected('indicies')} onClick={this.onChangeCategory} name='indicies'>
                        <span className='popup category-left'>Indicies</span>
                        <span className='popup category-right'><FontAwesomeIcon icon={faChevronRight} className='popup category-icon' /></span>
                    </div>
                    <div className={'popup category-btn'+ this.isSelected('futures')} onClick={this.onChangeCategory} name='futures'>
                        <span className='popup category-left'>Futures</span>
                        <span className='popup category-right'><FontAwesomeIcon icon={faChevronRight} className='popup category-icon' /></span>
                    </div>
                    <div className={'popup category-btn'+ this.isSelected('bonds')} onClick={this.onChangeCategory} name='bonds'>
                        <span className='popup category-left'>Bonds</span>
                        <span className='popup category-right'><FontAwesomeIcon icon={faChevronRight} className='popup category-icon' /></span>
                    </div>
                </div>
                <div className='popup main'>
                    <div className='popup main-list'>
                        {this.getInstrumentsItems()}
                    </div>
                </div>
            </div>

            </React.Fragment>
        )
    }

    generateWindowsStats()
    {

    }

    generateGeneralSettings()
    {

    }

    generateChartIndicators()
    {
        return (
            <React.Fragment>        
                <div className='popup header'>
                    <span>Indicators</span>
                </div>
                <div className='popup search'>

                </div>
                <div className='popup content'>
                    <div className='popup category'>
                        <div className={'popup category-btn' + this.isSelected('overlays')} onClick={this.onChangeCategory} name='overlays'>
                            <span className='popup category-left'>Overlays</span>
                            <span className='popup category-right'><FontAwesomeIcon icon={faChevronRight} className='popup category-icon' /></span>
                        </div>
                        <div className={'popup category-btn' + this.isSelected('oscillators')} onClick={this.onChangeCategory} name='oscillators'>
                            <span className='popup category-left'>Oscillators</span>
                            <span className='popup category-right'><FontAwesomeIcon icon={faChevronRight} className='popup category-icon' /></span>
                        </div>
                        <div className={'popup category-btn' + this.isSelected('candlestick-patterns')} onClick={this.onChangeCategory} name='candlestick-patterns'>
                            <span className='popup category-left'>Candlestick Patterns</span>
                            <span className='popup category-right'><FontAwesomeIcon icon={faChevronRight} className='popup category-icon' /></span>
                        </div>
                    </div>
                    <div className='popup main'>
                        <div className='popup main-list'>
                            {this.getIndicatorItems()}
                        </div>
                    </div>
                </div>

            </React.Fragment>
        )
    }

    generateWelcome()
    {

    }

    getPopupElem = () =>
    {
        return this.popupBody;
    }

    setMainHoverOn = () =>
    {
        this.setHoverOn(0);
    }

    setMainHoverOff = () =>
    {
        this.setHoverOff(0);
    }

    setHoverOn = (idx) =>
    {
        let { hovered } = this.state;
        hovered[idx] = true;
        this.setState({ hovered });
        this.props.setHovered('popup', hovered.some(x => {return x}));
    }

    setHoverOff = (idx) =>
    {
        let { hovered } = this.state;
        hovered[idx] = false;
        this.setState({ hovered });
        this.props.setHovered('popup', hovered.some(x => {return x}));
    }

    isBlockAppOnly = () =>
    {
        if (this.props.getPopup() && this.props.getPopup().blockAppOnly)
        {
            return ' blockAppOnly';
        }
        else
        {
            return '';
        }
    }

}

const MAJOR_PAIRS = [
    "GBP_USD", "EUR_USD", "AUD_USD"
];

const MINOR_PAIRS = [
    "GBP_JPY", "GBP_CAD", "CAD_CHF"
];


export default Popup;