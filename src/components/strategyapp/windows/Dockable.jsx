import React, { Component } from 'react';
import Log from './Log';
import Info from './Info';
import ControlPanel from './ControlPanel';

class Dockable extends Component
{
    constructor(props)
    {
        super(props);

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
                <div className='dockable header'>
                    <span>{this.generateTitle()}</span>
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
            return 'Script Log';
        }
        else if (type === 'info')
        {
            return 'Info';
        }
        else if (type === 'control_panel')
        {
            return 'Control Panel';
        }
    }

    generateInnerWindow()
    {
        const type = this.props.getElementType();
        if (type === 'log')
        {
            return <Log
                ref={this.setInnerWindowRef}
                strategy_id={this.props.strategy_id}
                item_id={this.props.item_id}
                getLog={this.props.getLog}
            />;
        }
        else if (type === 'info')
        {
            return <Info
                ref={this.setInnerWindowRef}
                strategy_id={this.props.strategy_id}
                item_id={this.props.item_id}
                getMousePos={this.props.getMousePos}
                getWindowById={this.props.getWindowById}
                getTopWindow={this.props.getTopWindow}
                getInfo={this.props.getInfo}
            />;
        }
        else if (type === 'control_panel')
        {
            return <ControlPanel
                ref={this.setInnerWindowRef}
                strategy_id={this.props.strategy_id}
                item_id={this.props.item_id}
                getInputVariables={this.props.getInputVariables}
                updateInputVariables={this.props.updateInputVariables}
            />
        }
    }
}

export default Dockable;