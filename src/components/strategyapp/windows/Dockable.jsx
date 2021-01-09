import React, { Component } from 'react';
import Log from './Log';
import Info from './Info';
import ControlPanel from './ControlPanel';
import Report from './Report';
import Positions from './Positions';
import Transactions from './Transactions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faScroll, faInfoCircle, faSlidersVSquare, faFileInvoice, faSort, faReceipt } from '@fortawesome/pro-regular-svg-icons';

class Dockable extends Component
{
    constructor(props)
    {
        super(props);

        this.setHeaderRef = elem => {
            this.header = elem;
        }
        this.setInnerWindowRef = elem => {
            this.innerWindow = elem;
        }
    }

    componentDidMount()
    {
        this.onMouseMoveThrottled = this.innerWindow.onMouseMoveThrottled;
        this.updateInfo = this.innerWindow.updateInfo;
    }

    render()
    {
        return (
            <div className='dockable background'>
                <div 
                    ref={this.setHeaderRef}
                    className='dockable header'
                >
                    {this.generateTitles()}
                </div>
                {this.generateInnerWindow()}
            </div>
        );
    }

    generateTitles()
    {
        const windows = this.props.info.windows;

        const opened = this.getOpened();
        // const type = window.type;
        
        let result = [];
        for (let w of windows)
        {
            let class_name;
            if (w.id === opened.id)
            {
                class_name = 'dockable header-item selected';
            }
            else
            {
                class_name = 'dockable header-item';
            }

            if (w.type === 'log')
            {
                result.push(
                    <div key={w.id} className={class_name}>
    
                    <FontAwesomeIcon icon={faScroll} className='dockable icon' />
                    <span>Script Log</span>
    
                    </div>
                );
            }
            else if (w.type === 'info')
            {
                result.push(
                    <div key={w.id} className={class_name}>
    
                    <FontAwesomeIcon icon={faInfoCircle} className='dockable icon' />
                    <span>Chart Info</span>
                    
                    </div>
                );
            }
            else if (w.type === 'control_panel')
            {
                result.push(
                    <div key={w.id} className={class_name}>
    
                    <FontAwesomeIcon icon={faSlidersVSquare} className='dockable icon' />
                    <span>Control Panel</span>
                    
                    </div>
                );
            }
            else if (w.type === 'report')
            {
                const name = this.props.info.properties.name;
                result.push(
                    <div key={w.id} className={class_name}>
    
                    <FontAwesomeIcon icon={faFileInvoice} className='dockable icon' />
                    <span>{name}</span>
                    
                    </div>
                );
            }
            else if (w.type === 'positions')
            {
                result.push(
                    <div key={w.id} className={class_name}>
    
                    <FontAwesomeIcon icon={faSort} className='dockable icon' />
                    <span>Positions</span>
                    
                    </div>
                );
            }
            else if (w.type === 'transactions')
            {
                result.push(
                    <div key={w.id} className={class_name}>
    
                    <FontAwesomeIcon icon={faReceipt} className='dockable icon' />
                    <span>Transactions</span>
                    
                    </div>
                );
            }
        }

        return result;
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
                item_id={this.props.item_id}
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
                item_id={this.props.item_id}
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
                item_id={this.props.item_id}
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
                item_id={this.props.item_id}
                info={this.props.info}
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
                item_id={this.props.item_id}
                info={this.props.info}
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
        else if (type === 'transactions')
        {
            return <Transactions
                key={this.props.item_id}
                ref={this.setInnerWindowRef}
                strategy_id={this.props.strategy_id}
                item_id={this.props.item_id}
                info={this.props.info}
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