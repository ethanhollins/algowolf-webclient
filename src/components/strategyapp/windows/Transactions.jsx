import React, { Component } from 'react';
import SpreadSheet from './SpreadSheet';
import moment from "moment-timezone";

class Transactions extends Component
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
                getName={this.getName}
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
        return 'Transactions';
    }

    getData = () =>
    {
        let transactions = this.props.getTransactions();
        let time = {'Time': []}
        for (let i = 0; i < transactions['Time'].length; i++)
        {
            time['Time'].push(moment.unix(transactions['Time'][i]).tz('America/New_York').format('MM/DD HH:mm'));
        }
        return Object.assign({}, transactions, time);
    }

    getFormat = () =>
    {   
        return {};
    }

}

export default Transactions;