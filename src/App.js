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

    async checkAuthorization()
    {
        var requestOptions = {
            method: 'POST',
            credentials: 'include',
            headers: {
                "Content-Type": "application/json"
            }
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
}

const URI = 'http://127.0.0.1:5000';

export default App;
