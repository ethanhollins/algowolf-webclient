import React, { Component } from 'react';
import moment from "moment-timezone";

class Log extends Component
{
    constructor(props)
    {
        super(props);

        this.setLogBodyRef = elem => {
            this.logBody = elem;
        }
    }

    render()
    {
        return (
            <div className='log background'>
                <div ref={this.setLogBodyRef} className='log body'>
                    {this.generateLog()}
                </div>
            </div>
        );
    }

    generateLog()
    {
        let messages = this.props.getLog();
        // Retrieve Account Logs if running live tab

        let log = [];
        let last_ts;
        for (let i = messages.length-1; i >= 0; i--)
        {
            let next_ts;
            if (i - 1 >= 0)
            {
                last_ts = messages[i].timestamp;
                next_ts = messages[i-1].timestamp;
            }

            if (next_ts === undefined || next_ts !== last_ts)
            {
                let time = moment
                    .utc(last_ts * 1000)
                    .tz('Australia/Melbourne')
                    .format('YYYY-MM-DD HH:mm:ss');
                log.push(
                    <span className='log msg' key={i}>
                        <span className='log timestamp'>{time + ' : '}</span>{messages[i].item}
                    </span>
                )
            }
            else
            {
                log.push(
                    <span className='log msg' key={i}>
                        {messages[i].item}
                    </span>
                )
            }
        }
        return log;
    }
}

export default Log;