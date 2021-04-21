import React, { Component } from 'react';
import Graph from './Graph';
import StatLarge from './StatLarge';
import moment from "moment-timezone";
import StatTable from './StatTable';
import HeaderBlock from './HeaderBlock';

class ResultsPage extends Component
{
    constructor(props)
    {
        super(props);

        this.update = this.update.bind(this);
        this.retrieveReport = this.retrieveReport.bind(this);

        this.items = [];
        
        this.setBackgroundRef = elem => {
            this.background = elem;
        }
        this.setInnerBackgroundRef = elem => {
            this.innerBackground = elem;
        }
        this.addItemRef = elem => {
            this.items.push(elem);
        }
    }

    state = {
        rows: 6,
        cols: 6,
        items: [],
        reports: {}
    }

    async componentDidMount()
    {
        window.addEventListener("resize", this.update);

        await this.generateItems();
    }

    componentDidUpdate()
    {
        this.update();
    }

    componentWillUnmount()
    {
        window.removeEventListener("resize", this.update);
    }

    render()
    {
        return (
            <div ref={this.setBackgroundRef} className="results-page background">
                <div ref={this.setInnerBackgroundRef} className="results-page inner-background">
                    {this.displayItems()}
                </div>
            </div>
        );
    }

    update()
    {
        this.updateItems();
    }

    async generateItems()
    {
        const item_props = this.getItems();
        
        let { rows, cols, items } = this.state;
        items = [];
        
        const container_width = this.background.clientWidth;
        // const container_height = this.background.clientHeight;
        const container_height = 812;
        const cell_width = container_width / cols;
        // const cell_height = Math.max(container_height / rows, 280);
        const cell_height = container_height / rows;

        for (let i=0; i < item_props.length; i++)
        {
            const item = item_props[i];

            if ('properties' in item)
            {
                let elem;
                if ('data' in item.properties && item.type === 'graph')
                {
                    let x_values = [];
                    let y_values = [];
                    for (let i of item.properties.data.x)
                    {
                        if ('report' in i)
                        {
                            await this.retrieveReport(i.report.name);
                            const values = this.processReport('graph', i.report);
                            x_values.push(values);
                        }
                    }
                    for (let i of item.properties.data.y)
                    {
                        if ('report' in i)
                        {
                            await this.retrieveReport(i.report.name);
                            const values = this.processReport('graph', i.report);
                            y_values.push(values);
                        }
                    }

                    elem = <Graph 
                        title={item.properties.title}
                        description={item.properties.description}
                        x_values={x_values}
                        y_values={y_values}
                    />;
                }
                else if ('data' in item.properties && item.type === 'stat-large')
                {
                    let value;
                    if ('report' in item.properties.data)
                    {
                        await this.retrieveReport(item.properties.data.report.name);
                        value = this.processReport(item.properties.type, item.properties.data.report);
                        console.log(value);
                    }

                    elem = <StatLarge 
                        title={item.properties.title}
                        value={value}
                    />
                }
                else if ('data' in item.properties && item.type === 'stat-table')
                {
                    let datasets = [];
                    if ('datasets' in item.properties.data)
                    {
                        for (let i of item.properties.data.datasets)
                        {
                            await this.retrieveReport(i.report.name);
                            let value = this.processReport(i.type, i.report);
                            datasets.push({
                                title: i.title,
                                value: value
                            })
                        }
                    }
                    console.log(datasets);

                    elem = <StatTable 
                        datasets={datasets}
                    />
                }
                else if (item.type === 'header')
                {
                    elem = <HeaderBlock 
                        title={item.properties.title}
                        description={item.properties.description}
                    />
                }

                items.push(
                    <div
                        key={i}
                        ref={this.addItemRef}
                        className='results-page item'
                        style={{
                            left: (item.x * cell_width) + "px",
                            top: (item.y * cell_height) + "px",
                            width: (item.width * cell_width) + "px",
                            height: (item.height * cell_height) + "px"
                        }}
                        name={i}
                    >
                        {elem}
                    </div>
                );
            }
        }


        this.setState({ items });
    }

    updateItems()
    {
        const { cols, rows, items } = this.state;

        const container_width = this.background.clientWidth;
        // const container_height = this.background.clientHeight;
        const container_height = 812;
        const cell_width = container_width / cols;
        // const cell_height = Math.max(container_height / rows, 280);
        const cell_height = container_height / rows;

        for (let i of this.items)
        {
            if (i !== null)
            {
                const i_props = this.getItems()[i.getAttribute('name')];
                
                i.style.left = (i_props.x * cell_width) + "px";
                i.style.top = (i_props.y * cell_height) + "px";
                i.style.width = (i_props.width * cell_width) + "px";
                i.style.height = (i_props.height * cell_height) + "px";
            }
        }
    }

    displayItems()
    {
        const { items } = this.state;
        return items;
    }
   
    getItems()
    {
        return [{
            type: 'header',
            x: 0,
            y: 0,
            width: 6,
            height: 1,
            properties: {
                title: 'Prison Paycheck Optimized System',
                description: 'This algorithm takes advantage of the best features the Prison Paycheck system has to offer, and throws out unprofitable aspects. The strategy has been built with commisions in mind so that at the end of the day, you can come away with real money.'
            }
        },
        {
            type: 'graph',
            x: 0,
            y: 1,
            width: 6,
            height: 4,
            properties: {
                title: 'Equity (R)',
                description: 'Total R profit before commisions.',
                data: {
                    x: [{
                        report: {
                            name: "System Results",
                            col: "Time",
                            type: "date",
                            formatting: {
                                timezone: 'Australia/Melbourne'
                            }
                        }
                    }],
                    y: [{
                        report: {
                            name: "System Results",
                            col: "R Profit",
                            type: "aggregate"
                        }
                    }]
                }
            }
        },
        {
            type: 'stat-large',
            x: 0,
            y: 5,
            width: 2,
            height: 1,
            properties: {
                type: 'aggregate',
                title: 'Return (R)',
                data: {
                    report: {
                        name: "System Results",
                        col: "R Profit",
                        type: "decimal"
                    }
                }
            }
        },
        {
            type: 'stat-large',
            x: 2,
            y: 5,
            width: 2,
            height: 1,
            properties: {
                type: 'win-percentage',
                title: 'Win Percentage',
                data: {
                    report: {
                        name: "System Results",
                        col: "R Profit",
                        type: "decimal"
                    }
                }
            }
        },
        {
            type: 'stat-large',
            x: 4,
            y: 5,
            width: 2,
            height: 1,
            properties: {
                type: 'expectancy-ratio',
                title: 'Expectancy Ratio',
                data: {
                    report: {
                        name: "System Results",
                        col: "R Profit",
                        type: "decimal"
                    }
                }
            }
        },
        {
            type: 'graph',
            x: 3,
            y: 6,
            width: 3,
            height: 4,
            properties: {
                title: 'Compounded (R) inc. Comms',
                description: 'Total compounded R profit before commisions.',
                data: {
                    x: [{
                        report: {
                            name: "System Results",
                            col: "Time",
                            type: "date",
                            formatting: {
                                timezone: 'Australia/Melbourne'
                            }
                        }
                    }],
                    y: [{
                        report: {
                            name: "System Results",
                            cols: [
                                "R Profit", "Lotsize"
                            ],
                            type: "compounded-commision-aggregate"
                        }
                    }]
                }
            }
        },
        {
            type: 'stat-table',
            x: 0,
            y: 6,
            width: 3,
            height: 4,
            properties: {
                data: {
                    datasets: [{
                        type: 'total-trades',
                        title: 'Total Trades',
                        report: {
                            name: "System Results",
                            col: "R Profit",
                            type: "decimal"
                        }
                    },
                    {
                        type: 'drawdown',
                        title: 'Drawdown (R)',
                        report: {
                            name: "System Results",
                            col: "R Profit",
                            type: "decimal"
                        }
                    },
                    {
                        type: 'sharpe-ratio',
                        title: 'Sharpe Ratio',
                        report: {
                            name: "System Results",
                            col: "R Profit",
                            type: "decimal"
                        }
                    },
                    {
                        type: 'profit-factor',
                        title: 'Profit Factor',
                        report: {
                            name: "System Results",
                            col: "R Profit",
                            type: "decimal"
                        }
                    },
                    {
                        type: 'commision-total',
                        title: 'Total Commisions (R)',
                        report: {
                            name: "System Results",
                            col: "Lotsize",
                            type: "decimal"
                        }
                    },
                    {
                        type: 'compounded-commision-total',
                        title: 'Total Compounded (R) inc. Comms',
                        report: {
                            name: "System Results",
                            cols: [
                                "R Profit", "Lotsize"
                            ],
                            type: "decimal"
                        }
                    }]
                }
            }
        }];
    }

    async retrieveReport(name)
    {
        let { reports } = this.state;

        if (!(name in reports))
        {
            const report = await this.props.retrieveReport(name);
            console.log(report);
    
            reports[name] = report;
            this.setState({ reports });
        }
    }

    processNumbers(x, props)
    {
        x = x[0];
        return x.map(i => parseInt(i));
    }

    processDecimals(x, props)
    {
        x = x[0];
        return x.map(i => parseFloat(i));
    }

    processAggregate(x, props)
    {
        x = x[0];
        let result = [];
        let sum = 0;
        for (let i of x)
        {
            sum += parseFloat(i);
            result.push(sum);
        }
        return result;
    }

    processCompoundedAggregate(x, props)
    {
        x = x[0];
        const start_bank = 10000;
        let c_bank = 10000;
        
        let result = [];
        for (let i of x)
        {
            c_bank += c_bank * (parseFloat(i) / 100);
            result.push((c_bank - start_bank) / 100);
        }
        return result;
    }

    processCompoundedCommisionAggregate(x, props)
    {
        const r_profit = x[0];
        const lotsizes = x[1];
        console.log('compounded comm');
        console.log(x);
        
        const start_bank = 10000;
        const comm_price = 7.0;
        let c_bank = 10000;
        
        let result = [];
        for (let i=0; i < r_profit.length; i++)
        {
            const c_profit = r_profit[i];
            let c_lotsize = lotsizes[i];

            c_bank += c_bank * (parseFloat(c_profit) / 100);
            const comm = (c_bank / start_bank) * c_lotsize * comm_price;
            c_bank -= comm;

            result.push((c_bank - start_bank) / 100);
        }
        return result;
    }

    processDates(x, props)
    {
        x = x[0];
        let result = [];
        for (let i of x)
        {
            let dt;
            if ('formatting' in props && 'timezone' in props.formatting)
            {
                dt = moment(i).tz(props.formatting.timezone);
            }
            else
            {
                dt = moment(i).tz('UTC');
            }

            if ('formatting' in props && 'format' in props.formatting)
            {
                dt = dt.format(props.formatting.format);
            }
            else
            {
                dt = dt.format('YYYY-MM-DD HH:mm:ss');
            }
            result.push(dt);
        }
        return result;
    }

    processNoType(x, props)
    {
        x = x[0];
        return Object.values(x);
    }

    processWinLoss(x, props)
    {
        x = x[0];
        let wins = 0;
        let losses = 0;
        for (let i of x)
        {
            if (i >= 0)
            {
                wins += 1;
            }
            else
            {
                losses += 1;
            }
        }

        return [wins, losses];
    }

    processAvgWinLoss(x, props)
    {
        x = x[0];
        let avg_win = 0;
        let win_count = 0;
        let avg_loss = 0;
        let loss_count = 0;

        for (let i of x)
        {
            if (i > 0)
            {
                avg_win += i;
                win_count += 1;
            }
            else if (i < 0)
            {
                avg_loss += Math.abs(i);
                loss_count += 1;
            }
        }

        return [avg_win / win_count, avg_loss / loss_count];
    }

    processDrawdown(x, props)
    {
        x = x[0];
        let dd = 0;
        let max_dd = 0;
        let c_return = 0;
        let c_high = 0;

        for (let i of x)
        {
            c_return += i;
            if (c_return > c_high)
            {
                c_high = c_return
                dd = 0
            }
            else
            {
                dd = Math.abs(c_high - c_return);
                if (dd > max_dd)
                {
                    max_dd = dd;
                }
            }
        }

        return max_dd;
    }

    processSharpeRatio(x, props)
    {
        x = x[0];
        const rf = 10;
        
        let rx = this.processAggregate([x], {});
        rx = rx[rx.length-1];
        const mean = rx / x.length;

        let sum = 0;
        for (let i=0; i < x.length; i++)
        {
            sum += Math.pow(x[i] - mean, 2);
        }
        const std = Math.sqrt(sum/x.length);
        return Math.round(( (rx - rf) / std ) * 100) / 100
    }

    processProfitFactor(x, props)
    {
        x = x[0];
        let gross_profit = 0;
        let gross_loss = 0;
        for (let i of x)
        {
            if (i >= 0)
            {
                gross_profit += i;
            }
            else
            {
                gross_loss += i;
            }
        }

        return Math.round((gross_profit/Math.abs(gross_loss))*100)/100;
    }

    processCommisionTotal(x, props)
    {
        x = x[0];
        const bank = 10000;
        const comm_price = 7.0;

        let comm_total = 0;
        for (let i of x)
        {
            comm_total += i * comm_price;
        }
        
        return Math.round(comm_total / bank * 10000)/100;
    }

    getDataTypeProcessor = (x) =>
    {
        if (x === 'number')
        {
            return this.processNumbers;
        }
        else if (x === 'decimal')
        {
            return this.processDecimals;
        }
        else if (x === 'aggregate')
        {
            return this.processAggregate;
        }
        else if (x === 'compounded-aggregate')
        {
            return this.processCompoundedAggregate;
        }
        else if (x === 'compounded-commision-aggregate')
        {
            console.log('?');
            return this.processCompoundedCommisionAggregate;
        }
        else if (x === 'date')
        {
            return this.processDates;
        }
        else
        {
            return this.processNoType;
        }
    }

    processReport = (type, formatting) =>
    {
        const { reports } = this.state;
        const name = formatting.name;
        
        if (name in reports)
        {
            const report = reports[name];

            let col;
            if ('col' in formatting)
            {
                col = [formatting.col];
            }
            else
            {
                col = formatting.cols;
            }
            const data_type = formatting.type;
            const data_type_processor = this.getDataTypeProcessor(data_type);

            let data_cols = [];
            for (let i=0; i < col.length; i++)
            {
                data_cols.push(Object.values(report[col[i]]));
            }

            if (type === 'graph')
            {
                return data_type_processor(data_cols, formatting);
            }
            else if (type === 'aggregate')
            {
                let result = data_type_processor(data_cols, formatting);
                result = this.processAggregate([result], {});
                return result[result.length-1].toFixed(2);
            }
            else if (type === 'expectancy-ratio')
            {
                let result = data_type_processor(data_cols, formatting);
                const num_win_loss = this.processWinLoss([result], {});
                const avg_win_loss = this.processAvgWinLoss([result], {});
                const total_trades = num_win_loss[0] + num_win_loss[1];
                const win_perc = num_win_loss[0] / (total_trades);
                const loss_perc = num_win_loss[1] / (total_trades);
                const reward_to_risk = avg_win_loss[0] / avg_win_loss[1];

                return (Math.round(((reward_to_risk * win_perc) - loss_perc) * 100) / 100).toFixed(2);
            }
            else if (type === 'win-percentage')
            {
                let result = data_type_processor(data_cols, formatting);
                result = this.processWinLoss([result]);
                return ((result[0] / (result[0] + result[1])) * 100).toFixed(2) + '%';
            }
            else if (type === 'total-trades')
            {
                let result = data_type_processor(data_cols, formatting);
                return result.length;
            }
            else if (type === 'drawdown')
            {
                let result = data_type_processor(data_cols, formatting);
                return this.processDrawdown([result], {}).toFixed(2);
            }
            else if (type === 'sharpe-ratio')
            {
                let result = data_type_processor(data_cols, formatting);
                return this.processSharpeRatio([result]).toFixed(2);
            }
            else if (type === 'profit-factor')
            {
                let result = data_type_processor(data_cols, formatting);
                return this.processProfitFactor([result]).toFixed(2);
            }
            else if (type === 'commision-total')
            {
                let result = data_type_processor(data_cols, formatting);
                return this.processCommisionTotal([result]).toFixed(2);
            }
            else if (type === 'compounded-total')
            {
                let result = data_type_processor(data_cols, formatting);
                result = this.processCompoundedAggregate([result]);
                return result[result.length-1].toFixed(2);
            }
            else if (type === 'compounded-commision-total')
            {
                // let result = data_type_processor(data_cols, formatting);
                let result = this.processCompoundedCommisionAggregate(data_cols, formatting);
                return result[result.length-1].toFixed(2);
            }
            
        }
    }

}

export default ResultsPage;