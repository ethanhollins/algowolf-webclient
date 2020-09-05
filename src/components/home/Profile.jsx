import React, { Component } from 'react';
import ProfileIcon from './ProfileIcon';
import AccountSettings from './profile/AccountSettings';
import BrokerSettings from './profile/BrokerSettings';
import Strategies from './profile/Strategies';
import { withRouter } from 'react-router-dom';

class Profile extends Component
{
    state = {
        username: undefined,
    }

    render()
    {
        if (this.state.username === null)
        {
            return (
                <div>User not found!</div>
            );
        }
        else if (this.state.username !== undefined)
        {
            return (
                <div className='profile body'>
                    <div className='profile header'>
                        <ProfileIcon />
                        <div className='profile info'>
                            <div className='profile title'>
                                Ethan Hollins
                            </div>
                            <div className='profile user'>
                                <a id='username' href={'/u/' + this.state.username}>@{this.state.username}</a>
                            </div>
                        </div>
                    </div>
                    <div className='profile nav'>
                        {this.getConditionalNavBtn('#strategies')}
                        {this.getConditionalNavBtn('#settings')}
                    </div>
                    {this.getOpenTab()}
                </div>
            );
        }
        else
        {
            return (<React.Fragment></React.Fragment>);
        }
    }

    componentDidMount()
    {
        let { username } = this.state;
        username = this.props.username;
        this.setState({ username });
    }

    getConditionalNavBtn(name)
    {
        const current_url = this.props.location.pathname;
        let tab = this.props.location.hash;

        if (name === '#strategies')
        {
            if (tab.startsWith('#strategies') || !tab.startsWith('#settings'))
                return (
                    <a className='profile btn selected' href={current_url + '#strategies'}>
                        <span>Strategies</span>
                        <div id='selected-bar'></div>
                    </a>
                );
            else
                return (
                    <a className='profile btn' href={current_url + '#strategies'}>
                        <span>Strategies</span>
                        <div id='selected-bar'></div>
                    </a>
                );
        }
        else if (name === '#settings')
        {
            if (tab.startsWith('#settings'))
                return (
                    <a className='profile btn selected' href={current_url + '#settings'}>
                        <span>Settings</span>
                        <div id='selected-bar'></div>
                    </a>
                );
            else
                return (
                    <a className='profile btn' href={current_url + '#settings'}>
                        <span>Settings</span>
                        <div id='selected-bar'></div>
                    </a>
                );
        }
    }

    getOpenTab()
    {
        let tab = this.props.location.hash;

        if (tab.startsWith('#strategies'))
        {
            tab = tab.replace('#strategies', '')
            if (tab === '-all')
                return <Strategies />;
            else
                return <Strategies />;
        }
        else if (tab.startsWith('#settings'))
        {
            tab = tab.replace('#settings', '')
            if (tab === '-brokers')
                return <BrokerSettings />;
            else if (tab === '-account')
                return <AccountSettings />;
            else
                return <BrokerSettings />;
        }
        else
        {
            return <Strategies />;
        }

    }
}

export default withRouter(Profile);