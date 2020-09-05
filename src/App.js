import React, { Component } from 'react';
import { 
    BrowserRouter as Router, 
    Route, Redirect, Switch
} from 'react-router-dom';
// Components
import StrategyApp from './components/StrategyApp';
import Login from './components/Login';
import Logout from './components/Logout';
import Home from './components/Home';
import { config } from '@fortawesome/fontawesome-svg-core'
import axios from 'axios';

class App extends Component 
{
    state ={
        user_id: null
    }

    constructor(props)
    {
        super(props);
        config.autoAddCss = false

        this.axios_obj = axios.create({
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*'
            },
            withCredentials: true
        });
    }

    componentDidMount()
    {
        
    }

    render() {
        return (
            <Router >
                <Switch>
                    <Route path="/login">
                        {this.getConditionalLoginComponent()}
                    </Route>
                    <Route path="/logout">
                        <Logout 
                            setUserId={this.setUserId}
                        />
                    </Route>
                    <Route path="/app">
                        <StrategyApp
                            getUserId={this.getUserId}
                            setUserId={this.setUserId}
                            checkAuthorization={this.checkAuthorization}
                        />;
                    </Route>

                    <Route exact path={["/", "/alerts", "/learn", "/hire", "/brokers", "/u/:username"]}>
                        <Home
                            getUserId={this.getUserId}
                            setUserId={this.setUserId}
                            checkAuthorization={this.checkAuthorization}
                            getAxiosObj={this.getAxiosObj}
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
            return <Redirect to="/"/>;
        else
            return <Login
                getUserId={this.getUserId}
                setUserId={this.setUserId}
                checkAuthorization={this.checkAuthorization}
                getAxiosObj={this.getAxiosObj}
            />;
    }

    async checkAuthorization(axios_obj)
    {
        let headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Cookie", "session=eyJ1c2VyX2lkIjoiOXNYRnNIREs3b0FFRmFhRGFaeThYTCJ9.X1L7aQ.qnAHdhMwlhHpQIDFOTPYlNJdxYw");

        var requestOptions = {
            method: 'POST',
            headers: headers,
            redirect: 'follow'
        };

        const res = await fetch(`${URI}/authorize`, requestOptions);

        let user_id = null;
        if (res.status === 200)
        {
            // Redirect to App
            const data = await res.json();
            user_id = data.user_id;
        }
        else
        {
            user_id = null;
        }
        return user_id;
    }

    getUserId = () =>
    {
        return this.state.user_id;
    }

    setUserId = (new_id) =>
    {
        let { user_id } = this.state;
        user_id = new_id;
        this.setState({ user_id });
    }

    getAxiosObj = () =>
    {
        return this.axios_obj;
    }
}

const URI = 'http://127.0.0.1'

export default App;
