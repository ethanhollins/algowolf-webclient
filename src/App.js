import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import Cookies from 'universal-cookie';
import './App.css';
// Components
import ChartApp from './components/ChartApp';
import Login from './components/Login';

class App extends Component 
{
    state ={
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
                <div className='container'>
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
                </div>
            );
        }
    }
    
    getConditionalLoginComponent()
    {
        if (this.state.isLoggedIn)
            return <Redirect to="/app"/>;
        else
            return <Login/>;
    }

    getConditionalAppComponent()
    {
        if (this.state.isLoggedIn)
            return <ChartApp/>;
        else
            return <Redirect to="/login"/>;   
    }

    async checkToken()
    {
        const cookies = new Cookies();
        const token = cookies.get('token');

        if (token !== undefined)
        {
            const reqOptions = {
                method: 'POST'
            }
    
            let res = await fetch(
                `http://127.0.0.1/login?username=${token.username}&token=${token.token}`,
                reqOptions
            );

            if (res.status === 200)
                // Redirect to App
                return true;
            else
                cookies.remove('token');
        }
        return false;
    }
}

export default App;
