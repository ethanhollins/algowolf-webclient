import React, { Component } from 'react';
import { 
    BrowserRouter as Router, 
    Route, Redirect, Switch
} from 'react-router-dom';
// Components
import StrategyApp from './components/StrategyApp';
import Login from './components/Login';
import Logout from './components/Logout';
import Auth from './components/Auth';
import Invite from './components/Invite';
import AccountSettings from './components/AccountSettings';
import { config } from '@fortawesome/fontawesome-svg-core'
import Cookies from 'universal-cookie';
import moment from "moment-timezone";
import Register from './components/Register';
import SendPasswordReset from './components/SendPasswordReset';
import ResetPassword from './components/ResetPassword';
import AuthLogin from './components/AuthLogin';
import UrlRedirect from './components/UrlRedirect';

class App extends Component 
{
    state ={
        user_id: null,
        server: null
    }

    constructor(props)
    {
        super(props);
        config.autoAddCss = false
        this.cookies = new Cookies();
        this.checkAuthorization = this.checkAuthorization.bind(this);
        this.demoAuthorization = this.demoAuthorization.bind(this);
        this.visitorCounter = this.visitorCounter.bind(this);
        this.firstVisitorCounter = this.firstVisitorCounter.bind(this);
        this.countPageVisit = this.countPageVisit.bind(this);
    }

    render() 
    {
        const queryString = window.location.search;

        return (
            <Router component={App}>
                <Switch>
                    <Route exact path="/">
                        <Redirect to="/login"/>
                    </Route>
                    <Route exact path="/register">
                        <UrlRedirect
                            url={"/register"}
                            queryString={"?"}
                        />
                    </Route>
                    <Route exact path="/account-settings">
                        <UrlRedirect
                            url={"/account-settings"}
                            queryString={queryString}
                        />
                    </Route>
                    <Route exact path="/login">
                        {this.getConditionalLoginComponent()}
                    </Route>
                    <Route exact path="/logout">
                        {/* <UrlRedirect
                            url={"/logout"}
                            queryString={"?"}
                        /> */}
                        <Logout
                            getCookies={this.getCookies}
                            setUserId={this.setUserId}
                        />
                    </Route>
                    <Route exact path="/app">
                        {/* {this.getConditionalAppComponent()} */}
                        <StrategyApp
                            getURI={this.getURI}
                            getCookies={this.getCookies}
                            getHeaders={this.getHeaders}
                            getUserId={this.getUserId}
                            getServerUrl={this.getServerUrl}
                            getServerStreamUrl={this.getServerStreamUrl}
                            checkAuthorization={this.checkAuthorization}
                            countPageVisit={this.countPageVisit}
                        />
                    </Route>
                    <Route exact path="/auth/:broker/login">
                        <AuthLogin 
                            getHeaders={this.getHeaders}
                            getCookies={this.getCookies}
                            getServerUrl={this.getServerUrl}
                            checkAuthorization={this.checkAuthorization}
                        />
                    </Route>
                    <Route exact path="/auth/:broker">
                        <Auth 
                            getHeaders={this.getHeaders}
                            getServerUrl={this.getServerUrl}
                            checkAuthorization={this.checkAuthorization}
                        />
                    </Route>
                    {/* <Route exact path="/holygrail">
                        <WelcomeDemoPageTwo
                            getUserId={this.getUserId}
                        />
                    </Route> */}
                    <Route exact path="/holygrail/demo">
                        <StrategyApp
                            isDemo={true}
                            getURI={this.getURI}
                            getCookies={this.getCookies}
                            getUserHeaders={this.getHeaders}
                            getHeaders={this.getDemoHeaders}
                            getUserId={this.getUserId}
                            checkAuthorization={this.checkAuthorization}
                            visitorCounter={this.visitorCounter}
                            firstVisitorCounter={this.firstVisitorCounter}
                            countPageVisit={this.countPageVisit}
                            getServerUrl={this.getServerUrl}
                            getServerStreamUrl={this.getServerStreamUrl}
                        />
                    </Route>
                    <Route exact path="/hgpro/results">
                        <StrategyApp
                            isDemo={true}
                            isHGPro={true}
                            getURI={this.getURI}
                            getCookies={this.getCookies}
                            getUserHeaders={this.getHeaders}
                            getHeaders={this.getHGProHeaders}
                            getUserId={this.getUserId}
                            checkAuthorization={this.checkAuthorization}
                            visitorCounter={this.visitorCounter}
                            firstVisitorCounter={this.firstVisitorCounter}
                            countPageVisit={this.countPageVisit}
                            getServerUrl={this.getServerUrl}
                            getServerStreamUrl={this.getServerStreamUrl}
                        />
                    </Route>
                    {/* <Route exact path="/holygrail/invite">
                        <Redirect to="/holygrail"/>
                    </Route> */}
                    <Route exact path="/holygrail/admin">
                        {this.getConditionalInviteComponent()}
                    </Route>
                    <Route exact path="/send-reset">
                        <SendPasswordReset
                            getHeaders={this.getHeaders}
                        />
                    </Route>
                    <Route exact path="/reset">
                        <ResetPassword
                            getHeaders={this.getHeaders}
                        />
                    </Route>

                    <Route>
                        404
                    </Route>
                </Switch>
            </Router>
        )
    }

    getConditionalLoginComponent()
    {
        const queryString = window.location.search;
        let params = new URLSearchParams(queryString);

        if (this.state.user_id !== null)
        {
            // let redirect;
            // if (params.get('redirect'))
            // {
            //     redirect = decodeURIComponent(params.get('redirect'));
            // }
            
            // params.delete('redirect');
            // if (redirect)
            // {
            //     return <Redirect to={`/${redirect}?${params.toString()}`}/>;
            // }
            // // if (redirect)
            // // {
            // //     return <Redirect to={`/auth/${redirect}?${params.toString()}`}/>;
            // // }
            // else
            // {
            // }
            return <Redirect to={"/app?"+params.toString()}/>;
        }
        else
        {
            return <Login
                getURI={this.getURI}
                getCookies={this.getCookies}
                getUserId={this.getUserId}
                setUserId={this.setUserId}
                checkAuthorization={this.checkAuthorization}
                url={"/login"}
                queryString={queryString}
            />;
        }
    }

    getConditionalAppComponent()
    {
        const queryString = window.location.search;
        if (this.state.user_id === null)
        {
            return <Redirect to={"/login"+queryString}/>;
        }
        else
        {
            return <StrategyApp
                getURI={this.getURI}
                getCookies={this.getCookies}
                getHeaders={this.getHeaders}
                getUserId={this.getUserId}
                checkAuthorization={this.checkAuthorization}
            />
        }
    }

    getConditionalInviteComponent()
    {
        const queryString = window.location.search;
        if (this.state.user_id === null)
        {
            return <Redirect to={"/login?redirect=holygrail%2Fadmin"}/>;
        }
        else
        {
            return <Invite
                getURI={this.getURI}
                getHeaders={this.getHeaders}
                getUserId={this.getUserId}
            />
        }
    }

    async checkAuthorization()
    {
        const { REACT_APP_API_URL } = process.env;
        const auth_token = this.getCookies().get('Authorization');
        let user_id = null;
        let server = null;
        if (auth_token !== undefined)
        {
            var requestOptions = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    Accept: '*/*',
                    Authorization: 'Bearer ' + auth_token
                },
                credentials: 'include'
            };
    
            const res = await fetch(`${REACT_APP_API_URL}/authorize`, requestOptions);
            if (res.status === 200)
            {
                // Redirect to App
                const data = await res.json();
                user_id = data.user_id;
                server = data.server;
            }
            else
            {
                user_id = null;
                server = null;
            }
        }
        else
        {
            user_id = null;
            server = null;
        }

        this.setUser(user_id, server);
        return user_id;
    }

    async demoAuthorization()
    {
        this.setUserId('demo');
    }

    async firstVisitorCounter()
    {
        const { REACT_APP_API_URL } = process.env;
        var requestOptions = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                Accept: '*/*'
            },
            credentials: 'include'
        };

        await fetch(`${REACT_APP_API_URL}/v1/analytics/visitors/first`, requestOptions);
    }

    async visitorCounter()
    {
        let last_visit = this.getCookies().get('last-visit');
        if (last_visit === undefined)
        {
            last_visit = 0;
        }

        if (!moment.utc().startOf('day').isSame(moment(last_visit), 'day'))
        {
            const { REACT_APP_API_URL } = process.env;
            var requestOptions = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    Accept: '*/*'
                },
                credentials: 'include'
            };
    
            await fetch(`${REACT_APP_API_URL}/v1/analytics/visitors/daily`, requestOptions);
            this.getCookies().set('last-visit', moment.utc().format());
        }
    }

    async countPageVisit(page)
    {
        const { REACT_APP_API_URL } = process.env;
        const auth_token = this.getCookies().get('Authorization');

        if (auth_token !== undefined)
        {
            var requestOptions = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    Accept: '*/*',
                    Authorization: 'Bearer ' + auth_token
                },
                credentials: 'include',
                body: JSON.stringify({
                    page: page
                })
            };
    
            fetch(`${REACT_APP_API_URL}/v1/analytics/page`, requestOptions);
        }
    }

    getURI = () =>
    {
        return URI;
    }

    getCookies = () =>
    {
        return this.cookies;
    }

    getHeaders = () =>
    {
        return {
            "Content-Type": "application/json",
            Accept: '*/*',
            Authorization: 'Bearer ' + this.getCookies().get('Authorization')
        };
    }

    getDemoHeaders = () =>
    {
        return {
            "Content-Type": "application/json",
            Accept: '*/*',
            Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkZW1vIiwiaWF0IjoxNjA4NDM1NTg3fQ.gwJRakOUz1uWBpD8_VOphebSwyPUm_t9D4vJOB5b2Kg'
            // Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkZW1vIiwiaWF0IjoxNjE2NTY1MjA0fQ.EuggHOjFvpkNJOTTO3t6KU5wnHnHTsntMoLvbYiRZDg'
        };
    }

    getHGProHeaders = () =>
    {
        return {
            "Content-Type": "application/json",
            Accept: '*/*',
            Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJoZ3BybyIsImlhdCI6MTYyODQyMTc4Nn0.1hx5QV3nX0tyvl4mHlY2jCiJNGfjmeuKpRzAcMxQP-s'
            // Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJoZ3BybyIsImlhdCI6MTYyODMxNDc2My4wNDM4MX0.AGq3zg94oSrR3uaHuvrMWRJjMmpovgVKpLBzqm6u0xA'
        };
    }

    setUser = (user_id, server) =>
    {
        this.setState({ user_id, server });
    }

    getUserId = () =>
    {
        return this.state.user_id;
    }

    setUserId = (user_id) =>
    {
        this.setState({ user_id });
    }

    getServer = () =>
    {
        return this.state.server;
    }

    setServer = (server) =>
    {
        this.setState({ server });
    }
    
    getServerUrl = () =>
    {
        const { REACT_APP_API_ONE_URL, REACT_APP_API_TWO_URL } = process.env;
        const { server } = this.state;
        if (server === 0)
        {
            return REACT_APP_API_ONE_URL;
        }
        else if (server === 1)
        {
            return REACT_APP_API_TWO_URL;
        }
        else
        {
            return REACT_APP_API_ONE_URL;
        }
    }

    getServerStreamUrl = () =>
    {
        const { REACT_APP_STREAM_ONE_URL, REACT_APP_STREAM_TWO_URL } = process.env;
        const { server } = this.state;
        if (server === 0)
        {
            return REACT_APP_STREAM_ONE_URL;
        }
        else if (server === 1)
        {
            return REACT_APP_STREAM_TWO_URL;
        }
        else
        {
            return REACT_APP_STREAM_ONE_URL;
        }
    }

}

const URI = '/api';
// const URI = 'https://api.algowolf.com';

export default App;
