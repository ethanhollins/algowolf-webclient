import React, { Component } from 'react';
import { 
    BrowserRouter as Router, 
    Route, Redirect, Switch
} from 'react-router-dom';
// Components
import StrategyApp from './components/StrategyApp';
import Login from './components/Login';
import Logout from './components/Logout';
import { config } from '@fortawesome/fontawesome-svg-core'
import Cookies from 'universal-cookie';
import moment from "moment-timezone";

class App extends Component 
{
    state ={
        user_id: null
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
    }

    render() {
        return (
            <Router >
                <Switch>
                    <Route exact path="/">
                        <Redirect to="/login"/>
                    </Route>
                    <Route exact path="/login">
                        {this.getConditionalLoginComponent()}
                    </Route>
                    <Route exact path="/logout">
                        <Logout 
                            getURI={this.getURI}
                            getCookies={this.getCookies}
                            setUserId={this.setUserId}
                        />
                    </Route>
                    <Route exact path="/app">
                        {this.getConditionalAppComponent()}
                    </Route>
                    <Route exact path="/holygrail">
                        <Redirect to="/holygrail/demo"/>
                    </Route>
                    <Route exact path="/holygrail/demo">
                        <StrategyApp
                            isDemo={true}
                            getURI={this.getURI}
                            getCookies={this.getCookies}
                            getHeaders={this.getDemoHeaders}
                            getUserId={this.getUserId}
                            checkAuthorization={this.demoAuthorization}
                            visitorCounter={this.visitorCounter}
                            firstVisitorCounter={this.firstVisitorCounter}
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
        if (this.state.user_id !== null)
        {
            return <Redirect to="/app"/>;
        }
        else
        {
            return <Login
                getURI={this.getURI}
                getCookies={this.getCookies}
                getUserId={this.getUserId}
                setUserId={this.setUserId}
                checkAuthorization={this.checkAuthorization}
                getAxiosObj={this.getAxiosObj}
            />;
        }
    }

    getConditionalAppComponent()
    {
        if (this.state.user_id === null)
        {
            return <Redirect to="/login"/>;
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

    async checkAuthorization()
    {
        const { REACT_APP_API_URL } = process.env;
        const auth_token = this.getCookies().get('Authorization');
        let user_id = null;
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
                console.log(data);
                user_id = data.user_id;
            }
            else
            {
                user_id = null;
            }
        }
        else
        {
            user_id = null;
        }

        this.setUserId(user_id);
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

        if (!moment().startOf('day').isSame(moment(last_visit), 'day'))
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
            this.getCookies().set('last-visit', moment().format());
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
        };
    }

    getUserId = () =>
    {
        return this.state.user_id;
    }

    setUserId = (user_id) =>
    {
        this.setState({ user_id });
    }
    
}

const URI = '/api';
// const URI = 'https://api.algowolf.com';

export default App;
