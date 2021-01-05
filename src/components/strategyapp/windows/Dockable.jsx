import React, { Component } from 'react';
import Log from './Log';
import Info from './Info';
import ControlPanel from './ControlPanel';
import Report from './Report';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faScroll, faInfoCircle, faSlidersVSquare, faFileInvoice } from '@fortawesome/pro-regular-svg-icons';

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
                    {this.generateTitle()}
                </div>
                {this.generateInnerWindow()}
            </div>
        );
    }

    generateTitle()
    {
        const type = this.props.getElementType();
        
        if (type === 'log')
        {
            return (
                <React.Fragment>

                <FontAwesomeIcon icon={faScroll} className='dockable icon' />
                <span>Script Log</span>

                </React.Fragment>
            );
        }
        else if (type === 'info')
        {
            return (
                <React.Fragment>

                <FontAwesomeIcon icon={faInfoCircle} className='dockable icon' />
                <span>Chart Info</span>
                
                </React.Fragment>
            );
        }
        else if (type === 'control_panel')
        {
            return (
                <React.Fragment>

                <FontAwesomeIcon icon={faSlidersVSquare} className='dockable icon' />
                <span>Control Panel</span>
                
                </React.Fragment>
            );
        }
        else if (type === 'report')
        {
            const name = this.props.info.properties.name;
            return (
                <React.Fragment>

                <FontAwesomeIcon icon={faFileInvoice} className='dockable icon' />
                <span>{name}</span>
                
                </React.Fragment>
            );
        }
    }

    generateInnerWindow()
    {
        const type = this.props.getElementType();
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
    }

    getHeader = () =>
    {
        return this.header;
    }
}

export default Dockable;