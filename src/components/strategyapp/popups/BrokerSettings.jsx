import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faChevronRight
} from '@fortawesome/pro-regular-svg-icons';
import { 
    faPlus
} from '@fortawesome/pro-light-svg-icons';
import { ReactSVG } from 'react-svg';

class BrokerSettings extends Component
{

    state = {
        modes: {},
        brokers: {},
        is_loaded: false,
        perform_scroll: false
    }

    async componentDidMount()
    {
        let { modes, brokers, is_loaded } = this.state;
        brokers = await this.props.retrieveAllBrokers();
        for (let broker_id in brokers)
        {
            modes[broker_id] = 'edit';
        }
        is_loaded = true;
        this.setState({ modes, brokers, is_loaded });

        const popup = this.props.getPopup();
        if (popup.opened === undefined)
            this.props.changeCategory(Object.keys(brokers)[0]);

        this.setMainRef = elem => {
            this.main = elem;
        }

        this.setSpotwareInfo = elem => {
            this.spotwareInfo = elem;
        }
    }

    componentDidUpdate()
    {
        let { perform_scroll } = this.state;
        if (perform_scroll)
        {
            perform_scroll = false
            this.main.scrollTo({
                top: this.main.scrollHeight,
                behavior: 'smooth'
            });
            this.setState({ perform_scroll });
        }
    }

    render()
    {
        const { is_loaded } = this.state;
        if (is_loaded)
        {
            return(
                <React.Fragment>
                
                <div className='popup header'>
                    <span>My Brokers</span>
                </div>
                <div className='popup content'>
                    <div className='popup category'>
                        {this.getBrokers()}
                        <div className='popup category-btn' onClick={this.addBroker} name='add-broker'>
                            <span className='popup category-left'>
                                Add Broker
                            </span>
                            <span className='popup category-right'><FontAwesomeIcon icon={faPlus} className='popup category-icon' /></span>
                        </div>
                    </div>
                    <div ref={this.setMainRef} className='popup main'>
                        <div className='popup main-list'>
                            {this.getItems()}
                        </div>
                    </div>
                </div>
    
                </React.Fragment>
            );
        }
        else
        {
            return(
                <React.Fragment>
                
                <div className='popup header'>
                    <span>My Brokers</span>
                </div>
                <div className='popup content'>
                    <div className='popup category'>
                    </div>
                    <div ref={this.setMainRef} className='popup main'>
                        <div className='popup main-list'>
                            <div 
                                className='popup load'
                            >
                                <div className='popup load-item'>
                                    <div>
                                        <ReactSVG className='popup load-img' src={process.env.PUBLIC_URL + "/wolf-logo.svg"} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
    
                </React.Fragment>
            );
        }
        
    }

    onChangeCategory = (e) =>
    {
        return this.props.onChangeCategory(e);
    }

    async onConnect(e)
    {
        let { modes, brokers } = this.state;
        const broker_id = this.props.getPopup().opened;
        const { REACT_APP_API_URL, REACT_APP_SPOTWARE_REDIRECT } = process.env;

        if (brokers[broker_id].broker === 'spotware')
        {
            // Call spotware OAuth
            const url = `https://connect.spotware.com/apps/auth?client_id=2096_sEzU1jyvCjvNMo2ViU8YnZha8UQmuHokkaXJDVD7fVEoIc1wx3&redirect_uri=${REACT_APP_SPOTWARE_REDIRECT}&scope=trading`;
            window.location.href = url;
        }
        else
        {
            // Call Api Connect EPT
            const reqOptions = {
                method: 'POST',
                headers: this.props.getHeaders(),
                credentials: 'include',
                body: JSON.stringify(
                    Object.assign({}, { broker_id: broker_id }, brokers[broker_id])
                )
            }
    
            const res = await fetch(
                `${REACT_APP_API_URL}/broker`,
                reqOptions
            );
    
            const data = await res.json();
            if (res.status === 200)
            {
                brokers[broker_id] = data;
                modes[broker_id] = 'edit';
        
                this.setState({ brokers });
                this.props.retrieveStrategies([this.props.getStrategyId()]);
            }
            else
            {
                return data.message;
            }
        }
    }

    async onSave(e)
    {
        let { modes, brokers } = this.state;
        const broker_id = this.props.getPopup().opened;

        // Call Api Connect EPT
        const { REACT_APP_API_URL } = process.env;
        const reqOptions = {
            method: 'PUT',
            headers: this.props.getHeaders(),
            credentials: 'include',
            body: JSON.stringify(
                Object.assign({}, { broker_id: broker_id }, brokers[broker_id])
            )
        }

        const res = await fetch(
            `${REACT_APP_API_URL}/broker`,
            reqOptions
        );

        const data = await res.json();
        if (res.status === 200)
        {
            let strategy = this.props.getStrategyInfo(this.props.getStrategyId());
            strategy.brokers[broker_id] = Object.assign({}, strategy.brokers[broker_id], data);
            this.props.updateStrategyInfo();

            brokers[broker_id] = data;
            modes[broker_id] = 'edit';
            this.setState({ brokers });

            
        }
        else
        {
            return data.message;
        }
    }

    async onDelete(e)
    {
        let { modes, brokers } = this.state;
        const broker_id = this.props.getPopup().opened;
        const { REACT_APP_API_URL, REACT_APP_SPOTWARE_REDIRECT } = process.env;

        // Call Api Connect EPT
        const reqOptions = {
            method: 'DELETE',
            headers: this.props.getHeaders(),
            credentials: 'include'
        }

        const res = await fetch(
            `${REACT_APP_API_URL}/broker/${broker_id}`,
            reqOptions
        );

        if (res.status === 200)
        {
            delete brokers[broker_id];
            delete modes[broker_id];
    
            this.setState({ brokers });
            this.props.retrieveStrategies([this.props.getStrategyId()]);
        }
    }

    onEditBtn(e)
    {
        let { modes, brokers } = this.state;
        const broker_id = this.props.getPopup().opened;

        brokers[broker_id].key = '';
        brokers[broker_id].password = '';
        brokers[broker_id].connected = false;
        modes[broker_id] = 'add';

        this.setState({ modes, brokers });
    }

    getBrokers = () =>
    {
        const { modes, brokers } = this.state;
        
        let result = [];
        if (brokers !== undefined)
        {
            for (let broker_id in brokers)
            {
                const broker_info = brokers[broker_id];
                let broker_name = broker_info.name;
                if (modes[broker_id] === 'add')
                {
                    broker_name += '*';
                }


                if (broker_info.name !== null)
                {
                    result.push(
                        <div key={broker_id} className={'popup category-btn' + this.isSelected(broker_id)} onClick={this.onChangeCategory} name={broker_id}>
                            <div className='popup category-left'>
                                {this.getBrokerImage(broker_info)}
                                <span className='popup category-left-name'>{broker_name}</span>
                            </div>
                            <div className='popup category-right'><FontAwesomeIcon icon={faChevronRight} className='popup category-icon' /></div>
                        </div>
                    );
                }
            }
        }
        return result;
    }

    createId = () =>
    {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const characters_length = characters.length;
        const id_length = 6;
        for (let i = 0; i < id_length; i++)
        {
            result += characters.charAt(Math.floor(Math.random() * characters_length));
        }
        return result;
    }

    addBroker = () =>
    {
        let { brokers, modes } = this.state;
        let default_name = 'My Broker';
        let broker_id = this.createId();
        while (broker_id in brokers)
        {
            broker_id = this.createId();
        }

        brokers[broker_id] = {
            key: '',
            is_demo: true,
            name: default_name,
        }
        modes[broker_id] = 'add';

        this.props.changeCategory(broker_id);
        this.setState({ brokers, modes });
    }

    getEditMode = (mode, selected) =>
    {
        const { brokers } = this.state;
        const broker_info = brokers[selected];

        let accounts_info;

        if (broker_info.accounts !== undefined)
        {
            let account_elems = [];
            for (let account_id in broker_info.accounts)
            {
                const account_info = broker_info.accounts[account_id];

                let display_account;
                if ('account_id' in account_info)
                {
                    display_account = account_info.account_id;
                }
                else
                {
                    display_account = account_id;
                }

                let broker = '';
                if ('broker' in account_info)
                {
                    broker = ` - ${account_info.broker.substr(0,1).toUpperCase() + account_info.broker.substr(1)}`;
                }

                // Account elems with checkbox for selection and nickname input box
                account_elems.push(
                    <div key={account_id} className='popup account-item'>

                        <div>
                            <label className='popup checkbox'>
                                <input 
                                    type='checkbox' 
                                    defaultChecked={account_info.active}
                                    onChange={this.onCheckboxInputChange.bind(this)}
                                    name={account_id}
                                />
                                <div className='checkmark'></div>
                            </label>
                            <div>{display_account + broker}</div>
                        </div>
                        <div className='popup input small'>
                            <input 
                                placeholder='Nickname'
                                className='popup text-input'
                                defaultValue={account_info.nickname}
                                onChange={this.onNicknameInputChange.bind(this)} 
                                name={account_id}
                            />
                        </div>

                    </div>
                );
            }

            accounts_info = (
                <div key={selected + '_two'} className='popup column'>
                    <div className='popup title underline'>Select Accounts</div>
                    <div className='popup account-list'>
                        {account_elems}
                    </div>
                </div>
            );
        }

        let apply_and_save_class = 'popup broker-btn';
        if (mode === 'edit')
        {
            apply_and_save_class += ' disabled';
        }

        return (
            <React.Fragment key={selected}>
                
            <div className='popup input-center'>
                <div className='popup input'>
                    <div className='popup title'>Name</div>
                    <input 
                        className='popup text-input'
                        defaultValue={broker_info.name}
                        onChange={this.onTextInputChange.bind(this)} 
                        name='name'
                    />
                </div>
            </div>
            <div className='popup column'>
                {/* <div className='popup title underline'>Broker</div> */}
                <div id='popup_broker_selector'>
                    {this.getBrokerTag(broker_info.broker)}
                </div>
            </div>
            {accounts_info}
            <div className='popup row'>
                <div className='popup center'>
                    <div 
                        className={apply_and_save_class}
                        onClick={this.onSave.bind(this)}
                    >
                        Apply & Save
                    </div>
                    <div className='popup broker-btn' onClick={this.onDelete.bind(this)}>Delete</div>
                </div>
            </div>

            </React.Fragment>
        );
    }

    getAddMode = (selected) =>
    {
        const { brokers, perform_scroll } = this.state;
        const broker_info = brokers[selected];

        let stage_one_elem;
        if (broker_info.broker !== undefined)
        {
            if (broker_info.broker === 'oanda')
            {
                stage_one_elem = (
                    <React.Fragment key={selected + '_one'}>

                    <div className='popup row'>
                        <div className='popup title large'>2. Enter your broker details.</div>
                    </div>

                    <div className='popup input-center'>
                        <div id='popup_demo_selector'>
                            <div 
                                id='popup_demo_left' 
                                className={this.isItemSelected(false, broker_info.is_demo)}
                                onClick={this.setIsDemo.bind(this)}
                                name='live'
                            >
                                Live
                            </div>
                            <div 
                                id='popup_demo_right' 
                                className={this.isItemSelected(true, broker_info.is_demo)}
                                onClick={this.setIsDemo.bind(this)}
                                name='demo'
                            >
                                Demo
                            </div>
                        </div>
                    </div>
                    <div className='popup input-center'>
                        <div className='popup input'>
                            <div className='popup title'>Name</div>
                            <input 
                                className='popup text-input'
                                defaultValue={broker_info.name}
                                onChange={this.onTextInputChange.bind(this)} 
                                placeholder='Set Broker Name'
                                name='name'
                            />
                        </div>
                    </div>
                    <div className='popup input-center'>
                        <div className='popup input'>
                            <div className='popup title'>Access Token</div>
                            <input 
                                className='popup text-input' onChange={this.onTextInputChange.bind(this)} 
                                placeholder='Set Oanda Access Token' name='key' 
                            />
                        </div>
                    </div>
                    <div className='popup input-center'>
                        <div className='popup info'>
                            <span>Instructions to find your access token, or <a href="https://www.oanda.com/demo-account/tpa/personal_token" target="_blank">Click Here</a></span>
                            <ol>
                                <li>Log into your Oanda account <a href="https://www.oanda.com/account/login" target="_blank">here</a>.</li>
                                <li>Scroll down to <strong>My Services</strong> and navigate to <strong>Manage API Acess</strong>.</li>
                                <li>Click on the <strong>Generate</strong> button.</li>
                                <li>Copy the token and paste it into the above text box.</li>
                            </ol>
                        </div>
                    </div>
                    <div className='popup input-center'>
                        <div className='popup center' onClick={this.onConnect.bind(this)}>
                            <div className='popup connect-btn'>Connect</div>
                        </div>
                    </div>

                    </React.Fragment>
                );
            }
            else if (broker_info.broker === 'ig')
            {
                stage_one_elem = (
                    <React.Fragment key={selected + '_one'}>

                    <div className='popup row'>
                        <div className='popup title large'>2. Enter your broker details.</div>
                    </div>

                    <div className='popup input-center'>
                        <div id='popup_demo_selector'>
                            <div 
                                id='popup_demo_left' 
                                className={this.isItemSelected(false, broker_info.is_demo)}
                                onClick={this.setIsDemo.bind(this)}
                                name='live'
                            >
                                Live
                            </div>
                            <div 
                                id='popup_demo_right' 
                                className={this.isItemSelected(true, broker_info.is_demo)}
                                onClick={this.setIsDemo.bind(this)}
                                name='demo'
                            >
                                Demo
                            </div>
                        </div>
                    </div>
                    <div className='popup input-center'>
                        <div className='popup input'>
                            <div className='popup title'>Name</div>
                            <input 
                                className='popup text-input'
                                defaultValue={broker_info.name}
                                onChange={this.onTextInputChange.bind(this)} 
                                placeholder='Set Broker Name'
                                name='name'
                            />
                        </div>
                    </div>
                    <div className='popup input-center'>
                        <div className='popup input'>
                            <div className='popup title'>Username</div>
                            <input 
                                className='popup text-input' defaultValue={broker_info.username} 
                                onChange={this.onTextInputChange.bind(this)} name='username' 
                                placeholder='Set IG Username'
                            />
                        </div>
                    </div>
                    <div className='popup input-center'>
                        <div className='popup input'>
                            <div className='popup title'>Password</div>
                            <input 
                                className='popup text-input' type='password'
                                onChange={this.onTextInputChange.bind(this)} name='password' 
                                placeholder='Set IG Password'
                            />
                        </div>
                    </div>
                    <div className='popup input-center'>
                        <div className='popup input'>
                            <div className='popup title'>Access Token</div>
                            <input 
                                className='popup text-input' onChange={this.onTextInputChange.bind(this)} 
                                placeholder='Set IG Access Token' name='key'
                            />
                        </div>
                    </div>
                    <div className='popup row'>
                        <div className='popup center' onClick={this.onConnect.bind(this)}>
                            <div className='popup connect-btn'>Connect</div>
                        </div>
                    </div>

                    </React.Fragment>
                );
            }
            else if ([
                'spotware', 'icmarkets', 'fxpro', 'pepperstone', 
                'axiory', 'fondex', 'octafx', 'scandinavian_capital_markets',
                'skilling', 'omf', 'tradeview'
            ].includes(broker_info.broker))
            {
                stage_one_elem = (
                    <React.Fragment key={selected + '_one'}>

                    <div className='popup row'>
                        <div className='popup title large'>2. Connect to your broker.</div>
                    </div>

                    <div className='popup row'>
                        <div className='popup center' onClick={this.onConnect.bind(this)}>
                            <div className='popup connect-btn'>Connect</div>
                        </div>
                    </div>

                    </React.Fragment>
                );
            }
        }
        else
        {
            stage_one_elem = (
                <React.Fragment></React.Fragment>
            );
        }

        return (
            <React.Fragment key={selected + '_main'}>
            
            <div className='popup row'>
                <div className='popup title large'>1. Select your broker.</div>
            </div>

            <div className='popup column'>
                <div id='popup_broker_selector'>
                    <div 
                        className={'popup broker ' + this.isItemSelected('oanda', broker_info.broker)}
                        onClick={this.setBroker.bind(this)}
                        name='oanda'
                    >
                        <ReactSVG className='popup broker-svg' src={process.env.PUBLIC_URL + '/oanda_logo.svg'} />
                        <div className='popup broker-text'>Oanda</div>
                    </div>
                    <div 
                        className={'popup broker disabled' + this.isItemSelected('fxcm', broker_info.broker)}
                        onClick={this.setBroker.bind(this)}
                        name='fxcm'
                    >
                        <ReactSVG className='popup broker-svg' src={process.env.PUBLIC_URL + '/fxcm_logo.svg'} />
                        <div className='popup broker-text'>FXCM</div>
                        <div className='popup broker-description'>Coming Soon</div>
                    </div>
                    <div 
                        className={'popup broker disabled' + this.isItemSelected('interactive_brokers', broker_info.broker)}
                        onClick={this.setBroker.bind(this)}
                        name='interactive_brokers'
                    >
                        <img className='popup broker-img' src={process.env.PUBLIC_URL + '/interactive_brokers_logo.png'} />
                        <div className='popup broker-text'>Interactive Brokers</div>
                        <div className='popup broker-description'>Coming Soon</div>
                    </div>
                    <div 
                        className={'popup broker' + this.isItemSelected('spotware', broker_info.broker)}
                        onClick={this.setBroker.bind(this)}
                        name='spotware'
                    >
                        <img className='popup broker-img' src={process.env.PUBLIC_URL + '/ctrader_logo.png'} />
                        <div className='popup broker-text'>cTrader</div>
                        <div className='popup broker-description'>Multiple Brokers</div>
                    </div>
                </div>
            </div>
            <div className='popup column'>
                <div id='popup_broker_selector'>
                    <div 
                        className={'popup broker' + this.isItemSelected('icmarkets', broker_info.broker)}
                        onClick={this.setBroker.bind(this)}
                        name='spotware'
                    >
                        <img className='popup broker-img' src={process.env.PUBLIC_URL + '/ic_markets_logo.png'} />
                        <div className='popup broker-text'>IC Markets</div>
                    </div>
                    <div 
                        className={'popup broker ' + this.isItemSelected('fxpro', broker_info.broker)}
                        onClick={this.setBroker.bind(this)}
                        name='spotware'
                    >
                        <img className='popup broker-img' src={process.env.PUBLIC_URL + '/fxpro_logo.png'} />
                        <div className='popup broker-text'>FxPro</div>
                    </div>
                    <div 
                        className={'popup broker ' + this.isItemSelected('pepperstone', broker_info.broker)}
                        onClick={this.setBroker.bind(this)}
                        name='spotware'
                    >
                        <img className='popup broker-img' src={process.env.PUBLIC_URL + '/pepperstone_logo.png'} />
                        <div className='popup broker-text'>Pepperstone</div>
                    </div>
                    <div 
                        className={'popup broker' + this.isItemSelected('axiory', broker_info.broker)}
                        onClick={this.setBroker.bind(this)}
                        name='spotware'
                    >
                        <img className='popup broker-img' src={process.env.PUBLIC_URL + '/axiory_logo.png'} />
                        <div className='popup broker-text'>Axiory Global</div>
                    </div>
                </div>
            </div>
            <div className='popup column'>
                <div id='popup_broker_selector'>
                    <div 
                        className={'popup broker' + this.isItemSelected('fondex', broker_info.broker)}
                        onClick={this.setBroker.bind(this)}
                        name='spotware'
                    >
                        <img className='popup broker-img' src={process.env.PUBLIC_URL + '/fondex_logo.png'} />
                        <div className='popup broker-text'>Fondex</div>
                    </div>
                    <div 
                        className={'popup broker' + this.isItemSelected('octafx', broker_info.broker)}
                        onClick={this.setBroker.bind(this)}
                        name='spotware'
                    >
                        <img className='popup broker-img' src={process.env.PUBLIC_URL + '/octafx_logo.png'} />
                        <div className='popup broker-text'>OctaFX</div>
                    </div>
                    <div 
                        className={'popup broker' + this.isItemSelected('scandinavian_capital_markets', broker_info.broker)}
                        onClick={this.setBroker.bind(this)}
                        name='scandinavian_capital_markets'
                    >
                        <img className='popup broker-img' src={process.env.PUBLIC_URL + '/scandinavian_capital_market_logo.png'} />
                        <div className='popup broker-text'>Scandinavian Capital Markets</div>
                    </div>
                    <div 
                        className={'popup broker' + this.isItemSelected('skilling', broker_info.broker)}
                        onClick={this.setBroker.bind(this)}
                        name='spotware'
                    >
                        <img className='popup broker-img' src={process.env.PUBLIC_URL + '/skilling_logo.png'} />
                        <div className='popup broker-text'>Skilling</div>
                    </div>
                </div>
            </div>
            <div className='popup column'>
                <div id='popup_broker_selector'>
                    <div 
                        className={'popup broker' + this.isItemSelected('omf', broker_info.broker)}
                        onClick={this.setBroker.bind(this)}
                        name='spotware'
                    >
                        <img className='popup broker-img' src={process.env.PUBLIC_URL + '/omf_logo.png'} />
                        <div className='popup broker-text'>OMF</div>
                    </div>
                    <div 
                        className={'popup broker' + this.isItemSelected('tradeview', broker_info.broker)}
                        onClick={this.setBroker.bind(this)}
                        name='spotware'
                    >
                        <img className='popup broker-img' src={process.env.PUBLIC_URL + '/tradeview_logo.png'} />
                        <div className='popup broker-text'>Tradeview Markets</div>
                    </div>
                </div>
            </div>
            {stage_one_elem}

            </React.Fragment>
        );
    }

    getItems = () =>
    {
        const { brokers, modes } = this.state;
        const selected = this.getSelected();

        if (selected in brokers)
        {
            const mode = modes[selected];
            
            if (mode === 'add')
            {
                return this.getAddMode(selected);
            }
            else if (mode === 'edit' || mode === 'unsaved')
            {
                return this.getEditMode(mode, selected);
            }
        }
    }

    getSelected()
    {
        return this.props.getPopup().opened;
    }

    isSelected(category)
    {
        const popup = this.props.getPopup();
        if (popup.opened === category)
            return ' selected';
        else
            return '';
    }

    isItemSelected(search, match)
    {
        if (search === match)
        {
            return ' selected';
        }
        else
        {
            return '';
        }
    }

    isDisabled()
    {
        const popup = this.props.getPopup();
        const { modes } = this.state;

        if (modes[popup.opened] === 'edit')
        {
            return ' disabled';
        }
        else
        {
            return '';
        }
    }

    setIsDemo(e)
    {
        const is_demo = e.target.getAttribute('name') === 'demo' ? true : false;
        const popup = this.props.getPopup();
        
        let { brokers } = this.state;
        brokers[popup.opened].is_demo = is_demo;
        this.setState({ brokers });
    }
    
    setBroker(e)
    {
        
        const broker = e.target.getAttribute('name');
        const popup = this.props.getPopup();
        
        let { brokers, perform_scroll } = this.state;
        if (!perform_scroll)
        {
            perform_scroll = true;
        }
        brokers[popup.opened].broker = broker;
        this.setState({ brokers, perform_scroll });
    }

    onTextInputChange(e)
    {
        const attr = e.target.getAttribute('name');
        const value = e.target.value;
        const broker_id = this.props.getPopup().opened;
        
        let { modes, brokers } = this.state;
        brokers[broker_id][attr] = value;

        if (modes[broker_id] === 'edit')
        {
            modes[broker_id] = 'unsaved';
        }

        this.setState({ modes, brokers });
    }
    
    onNicknameInputChange(e)
    {
        const value = e.target.value;
        const account_id = e.target.getAttribute('name');
        const broker_id = this.props.getPopup().opened;
        
        let { modes, brokers } = this.state;
        brokers[broker_id].accounts[account_id].nickname = value;
        modes[broker_id] = 'unsaved';

        this.setState({ modes, brokers });
    }

    onCheckboxInputChange(e)
    {
        const checked = e.target.checked;
        const account_id = e.target.getAttribute('name');
        const broker_id = this.props.getPopup().opened;

        let { modes, brokers } = this.state;
        brokers[broker_id].accounts[account_id].active = checked;
        modes[broker_id] = 'unsaved';

        this.setState({ modes, brokers });
    }

    setMode(broker_id, new_mode)
    {
        let { modes } = this.state;
        modes[broker_id] = new_mode;
        this.setState({ modes });
    }

    getBrokerTag(broker_name)
    {
        if (broker_name === 'oanda')
        {
            return (
                <div 
                    className='popup broker disabled selected'
                    name='oanda'
                >
                    <img className='popup broker-svg' src={process.env.PUBLIC_URL + '/oanda_logo.svg'} />
                    <div className='popup broker-text'>Oanda</div>
                </div>
            );
        }
        else if (broker_name === 'ig')
        {
            return (
                <div 
                    className='popup broker disabled selected'
                    name='ig'
                >
                    <img className='popup broker-svg' src={process.env.PUBLIC_URL + '/ig_logo.svg'} />
                    <div className='popup broker-text'>IG Markets</div>
                </div>
            );
        }
        else if (broker_name === 'spotware')
        {
            return (
                <div 
                    className='popup broker disabled selected'
                    name='spotware'
                >
                    <img className='popup broker-img' src={process.env.PUBLIC_URL + '/ctrader_logo.png'} />
                    <div className='popup broker-text'>cTrader</div>
                </div>
            );
        }
    }

    getBrokerImage(broker_info)
    {
        if (broker_info.broker === 'oanda')
        {
            return <ReactSVG className='popup category-left-logo' src={process.env.PUBLIC_URL + '/oanda_logo.svg'} />;
        }
        else if (broker_info.broker === 'ig')
        {
            return <ReactSVG className='popup category-left-logo' src={process.env.PUBLIC_URL + '/ig_logo.svg'} />;
        }
        else if ([
            'spotware', 'icmarkets', 'fxpro', 'pepperstone', 
            'axiory', 'fondex', 'octafx', 'scandinavian_capital_markets',
            'skilling', 'omf', 'tradeview'
        ].includes(broker_info.broker))
        {
            return <img className='popup category-left-logo' src={process.env.PUBLIC_URL + '/ctrader_logo.png'} />;
        }
    }

    onSpotwareEnter(e)
    {
        console.log('enter');
        this.spotwareInfo.style.display = 'block';
    }

    onSpotwareLeave(e)
    {
        console.log('leave');
        this.spotwareInfo.style.display = 'none';
    }
}

export default BrokerSettings;