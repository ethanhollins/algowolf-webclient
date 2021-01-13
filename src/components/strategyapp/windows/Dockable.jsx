import React, { Component } from 'react';
import Log from './Log';
import Info from './Info';
import ControlPanel from './ControlPanel';
import Report from './Report';
import Positions from './Positions';
import Orders from './Orders';
import Transactions from './Transactions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faScroll, faInfoCircle, faSlidersVSquare, 
    faFileInvoice, faSort, faReceipt, faChevronDown 
} from '@fortawesome/pro-regular-svg-icons';

class Dockable extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            tabs: [],
            dropdown: []
        }

        this.setHeaderRef = elem => {
            this.header = elem;
        }
        this.setInnerWindowRef = elem => {
            this.innerWindow = elem;
            if (this.innerWindow !== null)
            {
                this.onMouseMoveThrottled = this.innerWindow.onMouseMoveThrottled;
                this.updateInfo = this.innerWindow.updateInfo;
            }
        }

        this.addTabElem = elem => {
            let { tabs } = this.state;
            if (elem !== null)
            {
                tabs.push([elem, elem.clientWidth]);
            }
            else
            {
                tabs = tabs.filter(x => x !== null);
            }
            this.setState({ tabs });
        }
    }

    componentDidMount()
    {
        this.handleTabDropdown()
    }

    componentDidUpdate()
    {
        this.handleTabDropdown()
    }

    render()
    {
        return (
            <div className='dockable background'>
                <div 
                    ref={this.setHeaderRef}
                    className='dockable header'
                >
                    {this.generateTabs()}
                    {this.generateDropdown()}
                </div>
                {this.generateInnerWindow()}
            </div>
        );
    }

    handleTabDropdown()
    {
        const header_width = this.header.clientWidth - this.props.getWindowBtnsWidth();
        let tab_width = 0;

        let { dropdown, tabs } = this.state;
        let new_dropdown = [];
        for (let i = 0; i < tabs.length; i++)
        {
            const tab = tabs[i];
            tab_width += tab[1];
            if (i !== 0 && tab_width > header_width)
            {
                new_dropdown.push(tab[0].getAttribute('name'));
                tab[0].style.display = 'none';
            }
            else
            {
                tab[0].style.display = 'flex';
            }
        }

        if (dropdown.length !== new_dropdown.length)
        {
            dropdown = new_dropdown;
            this.setState({ dropdown });
        }
    }

    onTabClick(e)
    {
        const id = e.target.getAttribute('name');
        this.onMouseMoveThrottled = undefined;
        this.updateInfo = undefined;
        this.props.info.opened = id;
        this.props.updateStrategyInfo();
    }

    generateTabs()
    {
        const windows = this.props.info.windows;

        const opened = this.getOpened();
        
        let result = [];
        for (let i = 0; i < windows.length; i++)
        {
            const w = windows[i];
            let elem;
            let class_name;
            if (w.id === opened.id)
            {
                class_name = 'dockable header-item selected';
            }
            else
            {
                class_name = 'dockable header-item';
            }

            if (windows.length === 1)
            {
                class_name += ' no-border';
            }

            if (w.type === 'log')
            {
                elem = (
                    <div key={w.id} ref={this.addTabElem} className={class_name} name={w.id} onClick={this.onTabClick.bind(this)}>
    
                    <FontAwesomeIcon icon={faScroll} className='dockable icon' />
                    <div>Script Log</div>
    
                    </div>
                );
            }
            else if (w.type === 'info')
            {
                elem = (
                    <div key={w.id} ref={this.addTabElem} className={class_name} name={w.id} onClick={this.onTabClick.bind(this)}>
    
                    <FontAwesomeIcon icon={faInfoCircle} className='dockable icon' />
                    <div>Chart Info</div>
                    
                    </div>
                );
            }
            else if (w.type === 'control_panel')
            {
                elem = (
                    <div key={w.id} ref={this.addTabElem} className={class_name} name={w.id} onClick={this.onTabClick.bind(this)}>
    
                    <FontAwesomeIcon icon={faSlidersVSquare} className='dockable icon' />
                    <div>Control Panel</div>
                    
                    </div>
                );
            }
            else if (w.type === 'report')
            {
                const name = w.properties.name;
                elem = (
                    <div key={w.id} ref={this.addTabElem} className={class_name} name={w.id} onClick={this.onTabClick.bind(this)}>
    
                    <FontAwesomeIcon icon={faFileInvoice} className='dockable icon' />
                    <div>{name}</div>
                    
                    </div>
                );
            }
            else if (w.type === 'positions')
            {
                elem = (
                    <div key={w.id} ref={this.addTabElem} className={class_name} name={w.id} onClick={this.onTabClick.bind(this)}>
    
                    <FontAwesomeIcon icon={faSort} className='dockable icon' />
                    <div>Positions</div>
                    
                    </div>
                );
            }
            else if (w.type === 'orders')
            {
                elem = (
                    <div key={w.id} ref={this.addTabElem} className={class_name} name={w.id} onClick={this.onTabClick.bind(this)}>
    
                    <FontAwesomeIcon icon={faSort} className='dockable icon' />
                    <div>Orders</div>
                    
                    </div>
                );
            }
            else if (w.type === 'transactions')
            {
                elem = (
                    <div key={w.id} ref={this.addTabElem} className={class_name} name={w.id} onClick={this.onTabClick.bind(this)}>
    
                    <FontAwesomeIcon icon={faReceipt} className='dockable icon' />
                    <div>Transactions</div>
                    
                    </div>
                );
            }

            if (elem !== undefined)
            {
                result.push(elem);
                // result.push(<div key={i} className='dockable separator'></div>);
            }
        }

        return result;
    }

    generateDropdown()
    {
        const { dropdown } = this.state;
        if (dropdown.length > 0)
        {
            return (
                <div ref={this.setDropdownRef} className='dockable dropdown-icon'>
                    <FontAwesomeIcon icon={faChevronDown} />
                </div>
            );
        }
    }

    generateInnerWindow()
    {
        const window = this.getOpened();
        const type = window.type;

        if (type === 'log')
        {
            return <Log
                key={this.props.item_id}
                ref={this.setInnerWindowRef}
                strategy_id={this.props.strategy_id}
                item_id={window.id}
                getLog={this.props.getLog}
                getCurrentAccount={this.props.getCurrentAccount}
            />;
        }
        else if (type === 'info')
        {
            return <Info
                key={this.props.item_id}
                ref={this.setInnerWindowRef}
                strategy_id={this.props.strategy_id}
                item_id={window.id}
                getMousePos={this.props.getMousePos}
                getWindowById={this.props.getWindowById}
                getTopWindow={this.props.getTopWindow}
                getInfo={this.props.getInfo}
                getCurrentAccount={this.props.getCurrentAccount}
                getSelectedChart={this.props.getSelectedChart}
            />;
        }
        else if (type === 'control_panel')
        {
            return <ControlPanel
                key={this.props.item_id}
                ref={this.setInnerWindowRef}
                strategy_id={this.props.strategy_id}
                item_id={window.id}
                getGlobalInputVariables={this.props.getGlobalInputVariables}
                getCurrentGlobalVariablesPreset={this.props.getCurrentGlobalVariablesPreset}
                getLocalInputVariables={this.props.getLocalInputVariables}
                getCurrentLocalVariablesPreset={this.props.getCurrentLocalVariablesPreset}
                updateInputVariables={this.props.updateInputVariables}
                getCurrentAccount={this.props.getCurrentAccount}
                isLoaded={this.props.isLoaded}
            />
        }
        else if (type === 'report')
        {
            return <Report 
                key={this.props.item_id}
                ref={this.setInnerWindowRef}
                strategy_id={this.props.strategy_id}
                item_id={window.id}
                info={window}
                getHeader={this.getHeader}
                retrieveReport={this.props.retrieveReport}
                getScreenSize={this.props.getScreenSize}
                setCurrentTimestamp={this.props.setCurrentTimestamp}
                setScrollbarHovered={this.props.setScrollbarHovered}
                getScrollbarHovered={this.props.getScrollbarHovered}
                isTopWindow={this.props.isTopWindow}
                getTopOffset={this.props.getTopOffset}
                getWindowScreenPos={this.props.getWindowScreenPos}
                setChartPositionsByTimestamp={this.props.setChartPositionsByTimestamp}
            />
        }
        else if (type === 'positions')
        {
            return <Positions
                key={this.props.item_id}
                ref={this.setInnerWindowRef}
                strategy_id={this.props.strategy_id}
                item_id={window.id}
                info={window}
                getHeader={this.getHeader}
                getScreenSize={this.props.getScreenSize}
                setCurrentTimestamp={this.props.setCurrentTimestamp}
                setScrollbarHovered={this.props.setScrollbarHovered}
                getScrollbarHovered={this.props.getScrollbarHovered}
                isTopWindow={this.props.isTopWindow}
                getTopOffset={this.props.getTopOffset}
                getWindowScreenPos={this.props.getWindowScreenPos}
                setChartPositionsByTimestamp={this.props.setChartPositionsByTimestamp}
                getPositions={this.props.getPositions}
            />
        }
        else if (type === 'orders')
        {
            return <Orders
                key={this.props.item_id}
                ref={this.setInnerWindowRef}
                strategy_id={this.props.strategy_id}
                item_id={window.id}
                info={window}
                getHeader={this.getHeader}
                getScreenSize={this.props.getScreenSize}
                setCurrentTimestamp={this.props.setCurrentTimestamp}
                setScrollbarHovered={this.props.setScrollbarHovered}
                getScrollbarHovered={this.props.getScrollbarHovered}
                isTopWindow={this.props.isTopWindow}
                getTopOffset={this.props.getTopOffset}
                getWindowScreenPos={this.props.getWindowScreenPos}
                setChartPositionsByTimestamp={this.props.setChartPositionsByTimestamp}
                getOrders={this.props.getOrders}
            />
        }
        else if (type === 'transactions')
        {
            return <Transactions
                key={this.props.item_id}
                ref={this.setInnerWindowRef}
                strategy_id={this.props.strategy_id}
                item_id={window.id}
                info={window}
                getHeader={this.getHeader}
                getScreenSize={this.props.getScreenSize}
                setCurrentTimestamp={this.props.setCurrentTimestamp}
                setScrollbarHovered={this.props.setScrollbarHovered}
                getScrollbarHovered={this.props.getScrollbarHovered}
                isTopWindow={this.props.isTopWindow}
                getTopOffset={this.props.getTopOffset}
                getWindowScreenPos={this.props.getWindowScreenPos}
                setChartPositionsByTimestamp={this.props.setChartPositionsByTimestamp}
                getTransactions={this.props.getTransactions}
            />
        }
    }

    getHeader = () =>
    {
        return this.header;
    }

    getOpened = () =>
    {
        const windows = this.props.info.windows;
        const opened = this.props.info.opened;

        for (let w of windows)
        {
            if (w.id === opened)
            {
                return w
            }
        }

        return windows[0];
    }
}

export default Dockable;