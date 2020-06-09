import React, { Component } from 'react';
import ChartApp from './components/ChartApp';
import './App.css';

// import socketIOClient from 'socket.io-client';

class App extends Component 
{

	callAPI()
	{
        // const endpoint = "localhost:8080"
        // const socket = socketIOClient(endpoint);

        // socket.on('connect', () =>
        // {
        //     console.log('connected!');
        // });

        // this.setState({ socket: socket })
    }
    
	render() {
        return (
            <div className='container'>
                <div className='nav'>

                </div>

                <ChartApp/>
            </div>
        );
	}
	
}

export default App;
