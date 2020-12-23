import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBars,  faChartLine, faChartPie,
    faLightbulb, faCode, faHistory, faChevronRight,
    faQuestionCircle, faEnvelope
} from '@fortawesome/pro-regular-svg-icons';
import { 
    faPlus, faSort, faReceipt, faSlidersVSquare, faCode as faCodeLight,
    faFileInvoice, faChartBar, faTicketAlt, faLayerGroup,
    faSignOut, faInfoCircle, faScroll
} from '@fortawesome/pro-light-svg-icons';

class BacktestToolbar extends Component
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
        this.setNotifyElem = elem => {
            this.notifyElem = elem;
        }
        this.setHelpElem = elem => {
            this.helpElem = elem;
        }
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
                            <div className='dropdown-item' onClick={this.onNotAvailableDropdownItem} name='brokers'>
                                <span className='toolbox left'>My Brokers</span>
                                <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon' /></span>
                            </div>
                            <div className='dropdown-item' onClick={this.onNotAvailableDropdownItem} name='strategies'>
                                <span className='toolbox left'>My Strategies</span>
                                <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon' /></span>
                            </div>
                            <div className='dropdown-item' onClick={this.onNotAvailableDropdownItem} name='account'>
                                <span className='toolbox left'>Account Settings</span>
                                <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon' /></span>
                            </div>
                            <div className='dropdown-separator'></div>
                            <div className='dropdown-item' onClick={this.onNotAvailableDropdownItem} name='logout'>
                                <span className='toolbox left'>Logout</span>
                                <span className='toolbox right'><FontAwesomeIcon icon={faSignOut} className='toolbox right-icon' /></span>
                            </div>
                        </div>
                    </div>
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
                                    <FontAwesomeIcon icon={faSlidersVSquare} className='toolbox left-icon' /><span>Control Panel</span>
                                </span>
                                <span className='toolbox right'><FontAwesomeIcon icon={faPlus} className='toolbox right-icon' /></span>
                            </div>
                            <div className='dropdown-item' onClick={this.onNotAvailableDropdownItem}>
                                <span className='toolbox left'>
                                    <FontAwesomeIcon icon={faInfoCircle} className='toolbox left-icon' /><span>Chart Info</span>
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
                                    <FontAwesomeIcon icon={faScroll} className='toolbox left-icon' /><span>Script Log</span>
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
                    <div className='toolbox separator' />
                    <div className='toolbox item'>
                        <div ref={this.setScriptElem} className='toolbox item row btn' onClick={this.onNotAvailableItem}>
                            <FontAwesomeIcon className='toolbox icon blue_btn' icon={faCode} />
                            <span className='toolbox label'>Script</span>
                        </div>
                    </div>
                    <div className='toolbox item'>
                        <div ref={this.setBacktestElem} className='toolbox item row btn' onClick={this.onNotAvailableItem}>
                            <FontAwesomeIcon className='toolbox icon blue_btn' icon={faHistory} />
                            <span className='toolbox label'>Backtest</span>
                        </div>
                    </div>
                    <div className='toolbox separator' />
                    <div className='toolbox item'>
                        <div ref={this.setNotifyElem} className='toolbox item row btn' onClick={this.onNotifyItem}>
                            <FontAwesomeIcon className='toolbox icon steal-blue_btn' icon={faEnvelope} />
                            <span className='toolbox label'>Notify Me</span>
                        </div>
                    </div>
                    <div className='toolbox item'>
                        <div ref={this.setHelpElem} className='toolbox item row btn' onClick={this.onHelpItem}>
                            <FontAwesomeIcon className='toolbox icon steal-blue_btn' icon={faQuestionCircle} />
                            <span className='toolbox label'>Help</span>
                        </div>
                    </div>
                </div>
            </div> 
        );
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

    onStatsDropdownItem = (e) =>
    {
        this.statsDropdown.style.display = 'none';
    }

    onUtilsDropdownItem = (e) =>
    {
        this.utilsDropdown.style.display = 'none';
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

    onNotifyItem = (e) =>
    {
        const popup = {
            type: 'email-subscribe',
            size: {
                width: 30,
                height: 37
            },
            fade: true
        }
        this.props.setPopup(popup);
    }

    onHelpItem = (e) =>
    {
        const popup = {
            type: 'welcome-demo',
            size: {
                width: 40,
                height: 70
            },
            fade: true
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
    }
}

export default BacktestToolbar;