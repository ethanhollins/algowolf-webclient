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
                        {this.getConditionalAppComponent()}
                    </Route>

                    <Route exact path={["/", "/alerts", "/learn", "/hire", "/brokers", "/u/:username"]}>
                        <Home
                            getUserId={this.getUserId}
                            setUserId={this.setUserId}
                            checkAuthorization={this.checkAuthorization}
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
            />;
    }

    getConditionalAppComponent()
    {
        if (this.state.user_id !== null)
            return <StrategyApp
                getUserId={this.getUserId}
            />;
        else
            return <Redirect to="/login"/>;   
    }

    async checkAuthorization()
    {
        const reqOptions = {
            method: 'POST',
            credentials: 'include'
        }

        let res = await fetch(
            `${URI}/authorize`,
            reqOptions
        );
            
        let user_id = null;
        if (res.status === 200)
        {
            // Redirect to App
            res = await res.json();
            user_id = res.user_id;
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

const URI = 'http://127.0.0.1:5000'

export default App;
