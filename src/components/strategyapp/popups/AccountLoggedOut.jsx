import React, { Component } from 'react';

class AccountLoggedOut extends Component
{

    render()
    {
        return(
            <React.Fragment>
                
            <div className='popup content'>
                <div className='popup main'>
                    <div className='popup main-list'>
                        <div className='account-logged-out body'>
                            <div>
                                {this.getBrokerImg()}
                            </div>
                            <div className='account-logged-out message'>
                                This account has been logged out.
                            </div>
                            <div className='account-logged-out button' onClick={this.redirectBroker.bind(this)}>
                                Log Back In
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            </React.Fragment>
        );
    }

    getBrokerImg = () =>
    {
        const broker = this.props.getPopup().properties.broker;

        if (broker === 'oanda')
        {
            return <img className='account-logged-out icon oanda' src={process.env.PUBLIC_URL + '/oanda_logo_large.png'} />;
        }
        else if (broker === 'ib')
        {
            return <img className='account-logged-out icon ib' src={process.env.PUBLIC_URL + '/interactive_brokers_logo_large.png'} />;
        }
        else if (broker === 'dukascopy')
        {
            return <img className='account-logged-out icon dukascopy' src={process.env.PUBLIC_URL + '/dukascopy_logo_large.png'} />;
        }
        else if ([
            'spotware', 'icmarkets', 'fxpro', 'pepperstone', 
            'axiory', 'fondex', 'octafx', 'scandinavian_capital_markets',
            'skilling', 'omf', 'tradeview'
        ].includes(broker))
        {
            return <img className='account-logged-out icon spotware' src={process.env.PUBLIC_URL + '/ctrader_logo_large.png'} />;
        }
    }

    async redirectBroker(e)
    {
        const broker = this.props.getPopup().properties.broker;
        const broker_id = this.props.getPopup().properties.broker_id;
        const name = this.props.getPopup().properties.name;
        const { REACT_APP_API_URL, REACT_APP_IB_REDIRECT_BASE, REACT_APP_SPOTWARE_CLIENT_ID, REACT_APP_SPOTWARE_REDIRECT } = process.env;

        if (broker === 'ib')
        {
            const reqOptions = {
                method: 'GET',
                headers: this.props.getHeaders(),
                credentials: 'include'
            }

            const res = await fetch(
                `${REACT_APP_API_URL}/v1/ib/auth/${broker_id}`,
                reqOptions
            );

            if (res.status === 200)
            {
                const data = await res.json();
                console.log(data);

                window.location = `/auth/ib/login?uid=${data.port}&token=${data.token}&sid=${this.props.getStrategyId()}`;
            }
            else
            {

            }
        }
        else if ([
            'spotware', 'icmarkets', 'fxpro', 'pepperstone', 
            'axiory', 'fondex', 'octafx', 'scandinavian_capital_markets',
            'skilling', 'omf', 'tradeview'
        ].includes(broker))
        {
            const reqOptions = {
                method: 'POST',
                headers: this.props.getHeaders(),
                credentials: 'include'
            }

            const res = await fetch(
                `${REACT_APP_API_URL}/v1/brokers/replace/spotware/${broker_id}`,
                reqOptions
            );

            // Call spotware OAuth
            const url = `https://connect.spotware.com/apps/auth?client_id=${REACT_APP_SPOTWARE_CLIENT_ID}&redirect_uri=${REACT_APP_SPOTWARE_REDIRECT}&scope=trading`;
            window.location.href = url;
        }
    }
}

export default AccountLoggedOut;