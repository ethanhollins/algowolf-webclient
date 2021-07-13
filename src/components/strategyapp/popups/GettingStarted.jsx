import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faChevronRight, faPlus
} from '@fortawesome/pro-light-svg-icons';

class GettingStarted extends Component
{

    render()
    {
        return(
            <React.Fragment>
            
            <div className='popup header'>
                <span>Getting Started</span>
            </div>
            <div className='popup content'>
                <div className='popup getting-started main'>
                    <section>
                        <h1>
                            Welcome to your Dashboard
                            <div className="popup getting-started header-border"/>
                        </h1>
                        <p>Here you will find all the necessary tools to connect brokers, 
                        start/stop trading strategies, track trading setups, view trading results, customise strategy 
                        settings and more! Read through this startup guide to learn how to get started with all of these
                        features! You can always click the Help icon to come back to this message.</p>
                    </section>
                    <section>
                        <h1>
                            Connecting your Broker
                            <div className="popup getting-started header-border"/>
                        </h1>
                        <p>Connecting your broker takes a few easy steps. This process will be slightly different for 
                        each broker, which is explained during the connection process.</p>
                        <img className='popup getting-started' src={process.env.PUBLIC_URL + '/example.png'} />
                        <p>Firstly, click on the Main Menu icon in the top left of your dashboard and select My Brokers.</p>
                        <p>Next, click on Add Broker and select the broker you wish to connect. You can connect both
                        live and demo accounts.</p>
                        <p>This is where the process will change from broker to broker. The instructions for each broker
                        will be provided on the page you end up on. You may be required to login, some brokers require
                        you to generate a token. Follow the instructions and you should be redirected back to your Dashboard
                        on completion.</p>
                    </section>
                    <section>
                        <h1>
                            Using your Broker
                            <div className="popup getting-started header-border"/>
                        </h1>
                        <p>You can organise your brokerage accounts by navigating back to the Main Menu button and selecting 
                        My Brokers. Here you will see your connected brokers and options to change the broker name and account names</p>
                        <p>Apply & Save to save and changes. You can also delete brokers here if required.</p>
                        <p>Whenever using your Dashboard it is important to always select the correct Broker Account from the accounts
                        menu next to the blue My Dashboard label.</p>
                        <p>Whenever you start a trade or make any changes to strategy settings etc. these changes will be applied to the
                        account you have selected. This means if you are using multiple accounts, these changes must be made individually
                        for each account.</p>
                    </section>
                    <section>
                        <h1>
                            Start Trading Live
                            <div className="popup getting-started header-border"/>
                        </h1>
                        <p>Before you start trading, always check you have selected the correct broker account you wish to trade on!</p>
                        <p>Next,make sure to navigate to the Control Panel where you provide information on your bank
                        information, position sizes and any specific strategy changes if applicable.</p>
                        <p>Once you have reviewed and confirmed these changes, click the Start button to begin trading. This may take a
                        minute to start.</p>
                        <p>Once started, you can alway press the Stop button to stop trading at anytime. Be mindful that it can somtimes
                        take a minute for the strategy to fully stop.</p>
                    </section>
                    <section>
                        <h1>
                            Watch your Strategy in Action
                            <div className="popup getting-started header-border"/>
                        </h1>
                        <p>Congratulations! You have successfully connected your broker, selected the correct broker account and started
                        your strategy with your own personalized settings. Now it's time to watch your strategy work in action.</p>
                        <p>Your charts will always show if there are any pending orders and open trades. The stop loss and take profit
                        associated with these orders/trades is also shown.</p>
                        <p>Strategies may also provide chart information located in the Chart Info window. This information appears when
                        you select a Chart by clicking on it and hover over a bar.</p>
                        <p>You may also find icons/text appear on your Chart. These Drawings are generated by Strategies with the exception
                        of drawings in relation to orders/trades.</p>
                        <p>Old Drawings and Chart Info will automatically be deleted once the total number meets the allowed limitations. This
                        is to preserve your overall experience and keep the application running smoothly.</p>
                    </section>
                    <section>
                        <h1>
                            Where can I find more?
                            <div className="popup getting-started header-border"/>
                        </h1>
                        <p>The Strategies Page located on the AlgoWolf front site will be updated with the latest strategies which can be added
                        to your Dashboard for your own use. Strategies may be monetized and require purchasing through the described payment plan.</p>
                    </section>
                    <section>
                        <h1>
                            How do I make my own Strategy?
                            <div className="popup getting-started header-border"/>
                        </h1>
                        <p>AlgoWolf is working towards becoming a general use tool for anyone to create their own Strategies and potentially monetize them.
                        For more information on creating your own strategies, or any other general inquiries, contact the AlgoWolf team at admin@algowolf.com</p>
                        <p>Check out our FAQ to find out more information.</p>
                    </section>
                </div>
            </div>

            </React.Fragment>
        );
    }
}

export default GettingStarted;