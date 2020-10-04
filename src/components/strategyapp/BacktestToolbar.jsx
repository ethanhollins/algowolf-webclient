import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBars,  faChartLine, faChartPie, 
    faLightbulb, faCode, faHistory, faChevronRight, faTools, faExpandArrowsAlt, faLink, faExpandAlt, faToolbox
} from '@fortawesome/pro-regular-svg-icons';
import { 
    faPlus, faSort, faReceipt, faSlidersVSquare, faCode as faCodeLight,
    faFileInvoice, faChartBar, faTicketAlt, faLayerGroup
} from '@fortawesome/pro-light-svg-icons';

class BacktestToolbar extends Component
{
    constructor(props)
    {
        super(props);

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

    render()
    {
        return (
            <div className='toolbox body noselect' onDragStart={this.onDragStart}>
                <div>
                    <div className='toolbox item row'>
                        <FontAwesomeIcon className='toolbox icon' icon={faBars} />
                    </div>
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
        );
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

    closeTemporaryWindows(mouse_pos)
    {
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
}

export default BacktestToolbar;