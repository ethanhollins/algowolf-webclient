import React, { Component } from 'react';
import moment from "moment-timezone";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/pro-light-svg-icons';

class MessageBoard extends Component
{

    constructor(props)
    {
        super(props);

        this.retrieveMessages = this.retrieveMessages.bind(this);
        this.markMessageRead = this.markMessageRead.bind(this);
    }

    state = {
        selected: null,
        messages: [],
        timezone: "Australia/Melbourne"
    }

    async componentDidMount()
    {
        const messages = await this.retrieveMessages();
        const strategy_info = this.props.getStrategyInfo(this.props.getStrategyId());
        const settings = strategy_info.settings;
        const timezone = settings['chart-settings'].layouts[settings['chart-settings'].current].general['timezone'].value;
        this.setState({ messages, timezone });
    }

    render()
    {
        const { selected, timezone } = this.state;
        
        if (selected)
        {
            const message = this.getMessage(selected);
            const date = moment.utc(message.message_date).tz(timezone).format("HH:mm Do MMM 'YY");
            return(
                <React.Fragment>
                
                <div className='popup header'>
                    <span>Message Board</span>
                </div>
                <div className='popup content'>
                    <div className='popup main'>
                        <div className='popup main-list'>
                            <div className='messageboard body'>
                                <div onClick={this.goBack} className='messageboard close-icon-parent'>
                                    <FontAwesomeIcon className='messageboard close-icon' icon={faChevronLeft} />
                                    <div className='messageboard close-text'>Go Back</div>
                                </div>
                                <div className='messageboard message-title'>{message.message_title}</div>
                                <div className='messageboard message-date'>Posted at {date}</div>
                                <div className='messageboard message-body' dangerouslySetInnerHTML={{ __html: message.message_body }} />
                            </div>
                        </div>
                    </div>
                </div>
    
                </React.Fragment>
            );
        }
        else
        {
            return(
                <React.Fragment>
                
                <div className='popup header'>
                    <span>Message Board</span>
                </div>
                <div className='popup content'>
                    <div className='popup main'>
                        <div className='popup main-list'>
                            <div className='messageboard body'>
                                <table className='messageboard table'>
                                    <tbody>
                                        {this.generateMessageTable(timezone)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
    
                </React.Fragment>
            );
        }
    }

    generateMessageTable = (timezone) =>
    {
        const { messages } = this.state;

        let result = [];
        for (let i of messages)
        {
            const message_id = i.message_id;
            const date = moment.utc(i.message_date).tz(timezone).format("HH:mm Do MMM 'YY");
            result.push(
                <tr key={message_id} >
                    <td name={message_id} onClick={this.onRowClick}>
                        {
                            i.unread ?
                            <React.Fragment>
                                <div className='messageboard table-title unread'>{i.message_title}</div> 
                                <div className='messageboard table-date unread'>{date}</div>
                            </React.Fragment> :
                            <React.Fragment>
                                <div className='messageboard table-title'>{i.message_title}</div> 
                                <div className='messageboard table-date'>{date}</div>
                            </React.Fragment>
                        }
                        
                    </td>
                </tr>
            );
        }
        return result;
    }

    onRowClick = (e) =>
    {
        const selected = e.target.getAttribute("name");
        this.updateMessageRead(selected);
        this.setState({ selected });
    }

    getMessage = (id) =>
    {
        const { messages } = this.state;
        for (let i of messages)
        {
            if (i.message_id === id)
            {
                return i;
            }
        }
        return null;
    }

    updateMessageRead = (id) =>
    {
        const { messages } = this.state;
        for (let i of messages)
        {
            if (i.message_id === id)
            {
                i.unread = false;
                this.markMessageRead(i.message_id);
            }
        }
    }

    goBack = () =>
    {
        let { selected } = this.state;
        selected = null;
        this.setState({ selected });
    }

    async retrieveMessages()
    {
        const API_URL = this.props.getServerUrl();
        const reqOptions = {
            method: 'GET',
            headers: this.props.getHeaders(),
            credentials: 'include'
        }

        const res = await fetch(
            `${API_URL}/v1/messages`,
            reqOptions
        )

        if (res.status === 200)
        {
            return (await res.json()).messages;
        }
    }

    async markMessageRead(id)
    {
        
        const API_URL = this.props.getServerUrl();
        const reqOptions = {
            method: 'PUT',
            headers: this.props.getHeaders(),
            credentials: 'include'
        }

        const res = await fetch(
            `${API_URL}/v1/messages/user/${id}`,
            reqOptions
        )

        if (res.status === 200)
        {
            return true;
        }
    }
}

export default MessageBoard;