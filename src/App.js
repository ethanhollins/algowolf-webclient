import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import Cookies from 'universal-cookie';
import './App.css';
// Components
import StrategyApp from './components/StrategyApp';
import Login from './components/Login';

class App extends Component 
{
    state ={
        username: null,
        isLoggedIn: undefined
    }

	render() {
        return this.getComponents();
    }

    async componentDidMount()
    {
        let { isLoggedIn } = this.state;
        isLoggedIn = await this.checkToken();
        this.setState({ isLoggedIn });
    }

    getComponents()
    {
        if (this.state.isLoggedIn === undefined)
            return (<React.Fragment></React.Fragment>);
        else
        {
            return (
                <Router>
                    <Switch>
                        <Route exact path="/"> 
                            <Redirect to="/login"/>
                        </Route>
                        <Route path="/login">
                            {this.getConditionalLoginComponent()}
                        </Route>
                        <Route path="/app">
                            {this.getConditionalAppComponent()}
                        </Route>
                        <Route>
                            404
                        </Route>
                    </Switch>
                </Router>
            );
        }
    }
    
    getConditionalLoginComponent()
    {
        if (this.state.isLoggedIn && this.state.username !== null)
            return <Redirect to="/app"/>;
        else
            return <Login/>;
    }

    getConditionalAppComponent()
    {
        if (this.state.isLoggedIn)
            return <StrategyApp
                getUsername={this.getUsername}
            />;
        else
            return <Redirect to="/login"/>;   
    }

    async checkToken()
    {
        const cookies = new Cookies();
        const token = cookies.get('token');
        let { username } = this.state;

        if (token !== undefined)
        {
            const reqOptions = {
                method: 'POST',
                body: JSON.stringify({
                    'username': token.username,
                    'token': token.token
                })
            }
    
            let res = await fetch(
                `${URI}/login`,
                reqOptions
            );

            if (res.status === 200)
            {
                // Redirect to App
                username = token.username;
                this.setState({ username });
                return true;
            }
            else
            {
                cookies.remove('token');
                username = null;
                this.setState({ username });
            }
        }
        return false;
    }

    getUsername = () =>
    {
        return this.state.username;
    }
}

const URI = 'http://127.0.0.1:3000'

export default App;
