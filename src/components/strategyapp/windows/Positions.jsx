import React, { Component } from 'react';
import SpreadSheet from './SpreadSheet';
import moment from "moment-timezone";

class Positions extends Component
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
        return 'Positions';
    }

    getData = () =>
    {
        const positions = this.getPositions();
        console.log(positions);
        let result = {
            'Time': [], 'Instrument': [], 'Direction': [], 'Size': [], 
            'Entry': [], 'StopLoss': [], 'TakeProfit': []
        };

        for (let i = 0; i < positions.length; i++)
        {
            const pos = positions[i];
            result['Time'].push(
                moment.unix(pos.open_time).tz('America/New_York').format('MM/DD HH:mm')
            );
            result['Instrument'].push(pos.product.replace('_', ' '));
            result['Direction'].push(pos.direction.toUpperCase());
            result['Size'].push(pos.lotsize);
            result['Entry'].push(pos.entry_price);
            result['StopLoss'].push(pos.sl);
            result['TakeProfit'].push(pos.tp);
        }

        console.log(result);
        return result;
    }

    getFormat = () =>
    {   
        return {};
    }

    getPositions = () =>
    {
        return this.props.getPositions();
    }

}

export default Positions;