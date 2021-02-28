import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCircle, faInfo
} from '@fortawesome/pro-solid-svg-icons';
import { 
    faBars,  faChartLine, faChartPie, faPlay, faStop,
    faLightbulb, faCode, faHistory, faChevronRight, faChevronDown, 
    faTools, faExpandArrowsAlt, faLink, faExpandAlt
} from '@fortawesome/pro-regular-svg-icons';
import { 
    faPlus, faSort, faReceipt, faSlidersVSquare, faCode as faCodeLight,
    faFileInvoice, faChartBar, faTicketAlt, faLayerGroup, faUser,
    faSignOut
} from '@fortawesome/pro-light-svg-icons';

class StrategyToolbar extends Component
{
    constructor(props)
    {
        super(props);

        this.setMenuElem = elem => {
            this.menuElem = elem;
        }
        this.setMenuDropdown = elem => {
            this.menuDropdown = elem;
        }
        this.setAccountsElem = elem => {
            this.accountsElem = elem;
        }
        this.setAccountsDropdown = elem => {
            this.accountsDropdown = elem;
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

    state = {
        statusMsg: null
    }

    render()
    {
        return (
            <div className='toolbox body noselect' onDragStart={this.onDragStart}>
                <div>
                    <div className='toolbox item'>
                        <div ref={this.setMenuElem} className='toolbox item row btn' onClick={this.onMenuDropdown}>
                            <FontAwesomeIcon className='toolbox standalone-icon' icon={faBars} />
                        </div>
                        <div ref={this.setMenuDropdown} className='toolbox dropdown' style={{display: 'none'}}>
                            <div className='dropdown-item' onClick={this.onMenuDropdownItem} name='brokers'>
                                <span className='toolbox left'>My Brokers</span>
                                <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon' /></span>
                            </div>
                            <div className='dropdown-item' onClick={this.onMenuDropdownItem} name='strategies'>
                                <span className='toolbox left'>My Strategies</span>
                                <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon' /></span>
                            </div>
                            <div className='dropdown-item' onClick={this.onMenuDropdownItem} name='account'>
                                <span className='toolbox left'>Account Settings</span>
                                <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon' /></span>
                            </div>
                            <div className='dropdown-separator'></div>
                            <div className='dropdown-item' onClick={this.onMenuDropdownItem} name='logout'>
                                <span className='toolbox left'>Logout</span>
                                <span className='toolbox right'><FontAwesomeIcon icon={faSignOut} className='toolbox right-icon' /></span>
                            </div>
                        </div>
                    </div>
                    <div ref={this.setAccountsElem} className='toolbox item row'>
                        <FontAwesomeIcon className='toolbox icon small black' icon={faUser} />
                        {this.generateAccounts()}
                    </div>
                    <div className='toolbox item row status right-space'>
                        {this.generateStatusLabel()}
                    </div>
                    <div className='toolbox item' onClick={this.onScriptSwitch}>
                        {this.generateScriptBtn()}
                    </div>
                    <div className='toolbox separator' />
                    <div className='toolbox item'>
                        <div ref={this.setChartsElem} className='toolbox item row btn' onClick={this.onChartsDropdown}>
                            <FontAwesomeIcon className='toolbox icon orange_btn' icon={faChartLine} />
                            <span className='toolbox label'>Charts</span>
                        </div>
                        <div ref={this.setChartsDropdown} className='toolbox dropdown' style={{display: 'none'}}>
                            <div className='dropdown-item' onClick={this.onNotAvailableDropdownItem} name='cryptocurrencies'>
                                <span className='toolbox left'>Cryptocurrencies</span>
                                <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon' /></span>
                            </div>
                            <div className='dropdown-item' onClick={this.onNotAvailableDropdownItem} name='currencies'>
                                <span className='toolbox left'>Currencies</span>
                                <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon' /></span>
                            </div>
                            <div className='dropdown-item' onClick={this.onNotAvailableDropdownItem} name='stocks'>
                                <span className='toolbox left'>Stocks</span>
                                <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon' /></span>
                            </div>
                            <div className='dropdown-item' onClick={this.onNotAvailableDropdownItem} name='indicies'>
                                <span className='toolbox left'>Indicies</span>
                                <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon' /></span>
                            </div>
                            <div className='dropdown-item' onClick={this.onNotAvailableDropdownItem} name='futures'>
                                <span className='toolbox left'>Futures</span>
                                <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon' /></span>
                            </div>
                            <div className='dropdown-item' onClick={this.onNotAvailableDropdownItem} name='bonds'>
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
                            <div className='dropdown-item' onClick={this.onNotAvailableDropdownItem}>
                                <span className='toolbox left'>
                                    <FontAwesomeIcon icon={faChartBar} className='toolbox left-icon' /><span>Graphs</span>
                                </span>
                                <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon' /></span>
                            </div>
                            <div className='dropdown-item' onClick={this.onNotAvailableDropdownItem}>
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
                            <div className='dropdown-item' onClick={this.onNotAvailableDropdownItem}>
                                <span className='toolbox left'>
                                    <FontAwesomeIcon icon={faSort} className='toolbox left-icon' /><span>Positions/Orders</span>
                                </span>
                                <span className='toolbox right'><FontAwesomeIcon icon={faPlus} className='toolbox right-icon' /></span>
                            </div>
                            <div className='dropdown-item' onClick={this.onNotAvailableDropdownItem}>
                                <span className='toolbox left'>
                                    <FontAwesomeIcon icon={faTicketAlt} className='toolbox left-icon' /><span>Ticket</span>
                                </span>
                                <span className='toolbox right'><FontAwesomeIcon icon={faPlus} className='toolbox right-icon' /></span>
                            </div>
                            <div className='dropdown-item' onClick={this.onNotAvailableDropdownItem}>
                                <span className='toolbox left'>
                                    <FontAwesomeIcon icon={faReceipt} className='toolbox left-icon' /><span>Transactions</span>
                                </span>
                                <span className='toolbox right'><FontAwesomeIcon icon={faPlus} className='toolbox right-icon' /></span>
                            </div>
                            <div className='dropdown-item' onClick={this.onNotAvailableDropdownItem}>
                                <span className='toolbox left'>
                                    <FontAwesomeIcon icon={faSlidersVSquare} className='toolbox left-icon' /><span>Control Center</span>
                                </span>
                                <span className='toolbox right'><FontAwesomeIcon icon={faPlus} className='toolbox right-icon' /></span>
                            </div>
                            <div className='dropdown-item' onClick={this.onNotAvailableDropdownItem}>
                                <span className='toolbox left'>
                                    <FontAwesomeIcon icon={faLayerGroup} className='toolbox left-icon' /><span>Drawing Layers</span>
                                </span>
                                <span className='toolbox right'><FontAwesomeIcon icon={faPlus} className='toolbox right-icon' /></span>
                            </div>
                            <div className='dropdown-item' onClick={this.onNotAvailableDropdownItem}>
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
                            <div className='dropdown-item' onClick={this.onNotAvailableDropdownItem}>
                                <span className='toolbox left'>
                                    <FontAwesomeIcon icon={faExpandArrowsAlt} className='toolbox left-icon' /><span>Move</span>
                                </span>
                            </div>
                            <div className='dropdown-item' onClick={this.onNotAvailableDropdownItem}>
                                <span className='toolbox left'>
                                    <FontAwesomeIcon icon={faLink} className='toolbox left-icon' /><span>Link</span>
                                </span>
                            </div>
                            <div className='dropdown-item' onClick={this.onNotAvailableDropdownItem}>
                                <span className='toolbox left'>
                                    <FontAwesomeIcon icon={faExpandAlt} className='toolbox left-icon' /><span>Resize</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className='toolbox separator' />
                    <div className='toolbox item' onClick={this.onNotAvailableItem}>
                        <div ref={this.setScriptElem} className='toolbox item row btn'>
                            <FontAwesomeIcon className='toolbox icon blue_btn' icon={faCode} />
                            <span className='toolbox label'>Script</span>
                        </div>
                    </div>
                    <div className='toolbox item' onClick={this.onNotAvailableItem}>
                        <div ref={this.setBacktestElem} className='toolbox item row btn'>
                            <FontAwesomeIcon className='toolbox icon blue_btn' icon={faHistory} />
                            <span className='toolbox label'>Backtest</span>
                        </div>
                    </div>
                </div>
            </div> 
        );
    }

    generateAccounts = () =>
    {
        const strategy = this.props.getStrategyInfo(this.props.getCurrentStrategy());
        const brokers = this.getBrokers();

        if (brokers !== undefined)
        {
            let current_account = this.getCurrentAccount();

            let account_elems = [];
            let class_name;
            for (let broker_id of brokers)
            {
                const broker_name = strategy.brokers[broker_id].name;
                const accounts = strategy.brokers[broker_id].accounts;

                if (broker_name !== null)
                {
                    account_elems.push(
                        <div key={broker_id} className='toolbox dropdown-header'>
                            {broker_name}
                        </div>
                    );
                }

                for (let acc in accounts)
                {
                    let nickname = accounts[acc].nickname;

                    let account_id;
                    if ('account_id' in accounts[acc])
                    {
                        account_id = accounts[acc].account_id;
                    }
                    else
                    {
                        account_id = acc;
                    }

                    let display_name;
                    if (nickname)
                    {
                        display_name = `${nickname} (${account_id})`;
                    }
                    else
                    {
                        display_name = `${account_id}`;
                    }

                    const account_code = broker_id + '.' + acc;
                    if (account_code === current_account)
                    {
                        class_name = 'toolbox dropdown-item selected';
                    }
                    else
                    {
                        class_name = 'toolbox dropdown-item ';
                    }
                            
                    account_elems.push(
                        <div key={acc} className={class_name} onClick={this.onAccountsDropdownItem} name={account_code}>
                            <span className='toolbox left'>{display_name}</span>
                        </div>
                    );
                }
            }

            return (
                <React.Fragment>
    
                <span className='toolbox label right-space'>
                    {current_account !== undefined ? this.getAccountDisplayName(current_account.split('.')[1]) : ''}
                </span>
                <div className='toolbox item btn' onClick={this.onAccountsDropdown}>
                    <FontAwesomeIcon className='toolbox selection-icon' icon={faChevronDown} />
                </div>
                <div ref={this.setAccountsDropdown} className='toolbox dropdown small' style={{display: 'none'}}>
                    {account_elems}
                </div>
    
                </React.Fragment>
            );
        }
    }

    generateScriptBtn = () =>
    {
        let current_account = this.getCurrentAccount();
        const is_running = this.getScriptStatus(current_account);
        const is_loaded = this.props.getStrategyComponent().isLoaded();
        const { statusMsg } = this.state;

        if (is_running === null || !is_loaded)
        {
            return <React.Fragment />;
        }
        else if (is_running)
        {
            return (
                <div ref={this.setActivationElem} className='toolbox item row btn'>
                    <FontAwesomeIcon id='stop_status' className='toolbox icon' icon={faStop} />
                    <span className='toolbox label'>Stop</span>
                </div>
            );
        }
        else
        {
            if (statusMsg !== null)
            {
                return (
                    <div ref={this.setActivationElem} className='toolbox item row btn disabled'>
                        <FontAwesomeIcon className='toolbox icon disabled' icon={faPlay} />
                        <span className='toolbox label'>Start</span>
                    </div>
                );
            }
            else
            {
                return (
                    <div ref={this.setActivationElem} className='toolbox item row btn'>
                        <FontAwesomeIcon id='play_status' className='toolbox icon' icon={faPlay} />
                        <span className='toolbox label'>Start</span>
                    </div>
                );
            }
        }
    }

    generateStatusLabel = () =>
    {
        const { statusMsg } = this.state;
        let current_account = this.getCurrentAccount();
        const is_running = this.getScriptStatus(current_account);

        if (statusMsg !== null)
        {
            return (
                <React.Fragment>

                <FontAwesomeIcon id='info_status' className='toolbox icon' icon={faInfo} />
                <span id='info_status' className='toolbox label'>{statusMsg}</span>

                </React.Fragment>
            );
        }
        else if (is_running === null)
        {
            return <React.Fragment />;
        }
        else if (is_running)
        {
            return (
                <React.Fragment>

                <FontAwesomeIcon id='live_status' className='toolbox icon' icon={faCircle} />
                <span id='live_status' className='toolbox label'>Strategy Running</span>

                </React.Fragment>
            );
        }
        else
        {
            return (
                <React.Fragment>

                <FontAwesomeIcon id='offline_status' className='toolbox icon' icon={faCircle} />
                <span id='offline_status' className='toolbox label'>Strategy Stopped</span>

                </React.Fragment>
            );
        }
    }

    onScriptSwitch = () =>
    {
        let current_account = this.getCurrentAccount();
        const is_loaded = this.props.getStrategyComponent().isLoaded();
        
        if (is_loaded && current_account !== undefined)
        {
            const broker_id = current_account.split('.')[0];
            const account_id = current_account.split('.')[1];

            const is_running = this.getScriptStatus(current_account);
            if (is_running)
            {
                this.props.stopScript(broker_id, account_id);
            }
            else
            {
                const input_variables = this.props.getStrategyComponent().getAllCurrentInputVariables();
                this.props.startScript(broker_id, account_id, input_variables);
            }
        }
    }

    onMenuDropdown = (e) =>
    {
        if (this.menuDropdown.style.display === 'none')
        {
            this.menuDropdown.style.display = 'block';
            const btn_rect = this.menuElem.getBoundingClientRect();
            this.menuDropdown.style.left = parseInt(btn_rect.x) + 'px';
        }
        else
        {
            this.menuDropdown.style.display = 'none';
        }
    }

    onAccountsDropdown = (e) =>
    {
        if (this.accountsDropdown.style.display === 'none')
        {
            this.accountsDropdown.style.display = 'block';
            const btn_rect = this.accountsElem.getBoundingClientRect();
            this.accountsDropdown.style.left = parseInt(btn_rect.x) + 'px';
        }
        else
        {
            this.accountsDropdown.style.display = 'none';
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

    onMenuDropdownItem = (e) =>
    {
        this.menuDropdown.style.display = 'none';

        const name = e.target.getAttribute('name');

        if (name === 'brokers')
        {
            const popup = {
                type: 'broker-settings',
                size: {
                    width: 80,
                    height: 75
                }
            }
            this.props.setPopup(popup);
        }
        else if (name === 'strategies')
        {
            const popup = {
                type: 'strategy-settings',
                size: {
                    width: 60,
                    height: 75
                }
            }
            this.props.setPopup(popup);
        }
        else if (name === 'account')
        {
            this.props.history.push('/account-settings');
        }
        else if (name === 'logout')
        {
            this.props.history.push('/logout');
        }
        
    }

    onAccountsDropdownItem = (e) =>
    {
        this.accountsDropdown.style.display = 'none';

        const current_account = this.getCurrentAccount();
        const new_account = e.target.getAttribute('name');

        if (new_account !== current_account)
        {
            this.switchAccount(new_account);
        }
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
        // const popup = {
        //     type: 'chart-settings',
        //     size: {
        //         width: 60,
        //         height: 75
        //     },
        //     opened: 'general'
        // }
        // this.props.setPopup(popup);
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

    onNotAvailableItem = (e) =>
    {
        const popup = {
            type: 'not-available',
            size: {
                width: 30,
                height: 30
            }
        }
        this.props.setPopup(popup);
    }

    onNotAvailableDropdownItem = (e) =>
    {
        e.target.parentNode.style.display = 'none';
        
        const popup = {
            type: 'not-available',
            size: {
                width: 30,
                height: 30
            }
        }
        this.props.setPopup(popup);
    }

    closeTemporaryWindows(mouse_pos)
    {
        if (this.menuDropdown.style.display !== 'none')
        {
            if (!this.props.isWithinBounds(this.menuDropdown.getBoundingClientRect(), mouse_pos))
                this.menuDropdown.style.display = 'none';
        }
        if (this.accountsDropdown.style.display !== 'none')
        {
            if (!this.props.isWithinBounds(this.accountsDropdown.getBoundingClientRect(), mouse_pos))
                this.accountsDropdown.style.display = 'none';
        }
        if (this.chartsDropdown.style.display !== 'none')
        {
            if (!this.props.isWithinBounds(this.chartsDropdown.getBoundingClientRect(), mouse_pos))
                this.chartsDropdown.style.display = 'none';
        }
        if (this.statsDropdown.style.display !== 'none')
        {
            if (!this.props.isWithinBounds(this.statsDropdown.getBoundingClientRect(), mouse_pos))
                this.statsDropdown.style.display = 'none';
        }
        if (this.utilsDropdown.style.display !== 'none')
        {
            if (!this.props.isWithinBounds(this.utilsDropdown.getBoundingClientRect(), mouse_pos))
                this.utilsDropdown.style.display = 'none';
        }
        if (this.toolsDropdown.style.display !== 'none')
        {
            if (!this.props.isWithinBounds(this.toolsDropdown.getBoundingClientRect(), mouse_pos))
                this.toolsDropdown.style.display = 'none';
        }
    }

    switchAccount = (account_id) =>
    {
        const strategy = this.props.getStrategyInfo(this.props.getCurrentStrategy());
        const strategy_component = this.props.getStrategyComponent();
        
        if (strategy !== undefined)
        {
            strategy.account = account_id;
            strategy_component.retrieveAccountInfo(account_id);
            this.props.updateStrategyInfo();
        }
    }

    getBrokers = () =>
    {
        const strategy = this.props.getStrategyInfo(this.props.getCurrentStrategy());

        if (strategy !== undefined)
        {
            let accounts = Object.keys(strategy.brokers);
            let start = accounts.splice(accounts.indexOf(this.props.getCurrentStrategy()), 1);
            return start.concat(accounts.sort());
        }
    }

    getAccounts = (broker_id) =>
    {
        const strategy = this.props.getStrategyInfo(this.props.getCurrentStrategy());

        if (strategy !== undefined)
        {
            return Object.keys(strategy.brokers[broker_id].accounts);
        }
    }

    getCurrentAccount = () =>
    {
        const strategy = this.props.getStrategyInfo(this.props.getCurrentStrategy());

        if (strategy !== undefined && strategy.account !== undefined)
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

    getScriptStatus = (current_account) =>
    {
        const strategy = this.props.getStrategyInfo(this.props.getCurrentStrategy());

        if (strategy !== undefined && current_account !== undefined)
        {
            current_account = current_account.split('.');
            const broker_id = current_account[0];
            const account_id = current_account[1];
            return strategy.brokers[broker_id].accounts[account_id]['strategy_status'];
        }

        return null;
    }

    getAccountDisplayName = (account) =>
    {
        if (account === 'papertrader')
        {
            return 'Paper Trader';
        }
        else
        {
            return account;
        }
    }

    setStatusMsg = (statusMsg) =>
    {
        this.setState({ statusMsg });
    }

}

export default StrategyToolbar;