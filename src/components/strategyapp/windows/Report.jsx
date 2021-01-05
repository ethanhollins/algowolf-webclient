import React, { Component } from 'react';
import SpreadSheet from './SpreadSheet';

class Report extends Component
{

    constructor(props)
    {
        super(props);

        this.setSpreadsheetRef = elem => {
            this.spreadsheet = elem;
        }
    }

    state = {
        data: null
    }

    async componentDidMount()
    {
        this.onMouseMoveThrottled = this.spreadsheet.onMouseMoveThrottled;

        const data = await this.retrieveData();
        this.setState({ data });
    }
    
    render()
    {
        return (
            <SpreadSheet
                ref={this.setSpreadsheetRef}
                strategy_id={this.props.strategy_id}
                item_id={this.props.item_id}
                key={this.getName()}
                data={this.getData()}
                format={this.getFormat()}
                getScreenSize={this.props.getScreenSize}
                setCurrentTimestamp={this.props.setCurrentTimestamp}
                setScrollbarHovered={this.props.setScrollbarHovered}
                getScrollbarHovered={this.props.getScrollbarHovered}
                isTopWindow={this.props.isTopWindow}
                getTopOffset={this.props.getTopOffset}
                getWindowScreenPos={this.props.getWindowScreenPos}
                getHeader={this.props.getHeader}
                setChartPositionsByTimestamp={this.props.setChartPositionsByTimestamp}
            />
        );
    }


    getName = () =>
    {
        if (this.props.info.properties !== undefined)
        {
            if (this.props.info.properties.name !== undefined)
            {
                return this.props.info.properties.name;
            }
        }
        return 'Report';
    }

    getData = () =>
    {
        return this.state.data;
    }

    getFormat = () =>
    {   
        if (this.props.info.properties !== undefined)
        {
            if (this.props.info.properties.format !== undefined)
            {
                return this.props.info.properties.format;
            }
        }
        return {};
    }

    retrieveData = () =>
    {
        return this.props.retrieveReport(this.getName());
    }
   
}

export default Report;