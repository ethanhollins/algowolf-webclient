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
        brokers: {}
    }

    async componentDidMount()
    {
        let { modes, brokers } = this.state;
        brokers = await this.props.retrieveAllBrokers();
        for (let broker_id in brokers)
        {
            modes[broker_id] = 'edit';
        }
        this.setState({ modes, brokers });

        const popup = this.props.getPopup();
        if (popup.opened === undefined)
            this.props.changeCategory(Object.keys(brokers)[0]);
    }

    render()
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
                <div className='popup main'>
                    <div className='popup main-list'>
                        {this.getItems()}
                    </div>
                </div>
            </div>

            </React.Fragment>
        );
    }

    onChangeCategory = (e) =>
    {
        return this.props.onChangeCategory(e);
    }

    async onConnect(e)
    {
        let { modes, brokers } = this.state;
        const broker_id = this.props.getPopup().opened;

        if (brokers[broker_id].broker === 'spotware')
        {
            // Call spotware OAuth
        }
        else
        {
            // Call Api Connect EPT
            const { REACT_APP_API_URL } = process.env;
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
            brokers[broker_id] = data;
            modes[broker_id] = 'edit';
            this.setState({ brokers });
        }
        else
        {
            return data.message;
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

        let stage_one_elem;
        if (broker_info.broker === 'oanda')
        {
            stage_one_elem = (
                <div key={selected + '_one'} className='popup row'>
                    <div className='popup input'>
                        <div className='popup form-title'>Access Token</div>
                        <div className='popup text-read'>********************************-********************************</div>
                    </div>
                </div>
            );
        }
        else if (broker_info.broker === 'ig')
        {
            stage_one_elem = (
                <React.Fragment key={selected + '_one'}>

                <div className='popup row'>
                    <div className='popup input'>
                        <div className='popup form-title'>Username</div>
                        <div className='popup text-read'>{broker_info.username}</div>
                    </div>
                </div>
                <div className='popup row'>
                    <div className='popup input'>
                        <div className='popup form-title'>Password</div>
                        <div className='popup text-read'>{'*'.repeat(broker_info.password.length)}</div>
                    </div>
                </div>
                <div className='popup row'>
                    <div className='popup input'>
                        <div className='popup form-title'>Access Token</div>
                        <div className='popup text-read'>********************************-********************************</div>
                    </div>
                </div>

                </React.Fragment>
            );
        }

        let stage_two_elem;

        if (broker_info.accounts !== undefined)
        {
            let account_elems = [];
            for (let account_id in broker_info.accounts)
            {
                const account_info = broker_info.accounts[account_id];

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
                            <div>{account_id}</div>
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

            stage_two_elem = (
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
                
            <div className='popup row'>
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
            <div className='popup row'>
                <div id='popup_demo_selector'>
                    <div 
                        id='popup_demo_left' 
                        className={'disabled ' + this.isItemSelected(false, broker_info.is_demo)}
                        onClick={this.setIsDemo.bind(this)}
                        name='live'
                    >
                        Live
                    </div>
                    <div 
                        id='popup_demo_right' 
                        className={'disabled ' + this.isItemSelected(true, broker_info.is_demo)}
                        onClick={this.setIsDemo.bind(this)}
                        name='demo'
                    >
                        Demo
                    </div>
                </div>
            </div>
            <div className='popup column'>
                {/* <div className='popup title underline'>Broker</div> */}
                <div id='popup_broker_selector'>
                    <div 
                        className={'popup broker disabled ' + this.isItemSelected('oanda', broker_info.broker)}
                        onClick={this.setBroker.bind(this)}
                        name='oanda'
                    >
                        <ReactSVG className='popup broker-logo' src={process.env.PUBLIC_URL + "/oanda_logo.svg"} />
                        <div className='popup broker-text'>Oanda</div>
                    </div>
                    <div 
                        className={'popup broker disabled ' + this.isItemSelected('ig', broker_info.broker)}
                        onClick={this.setBroker.bind(this)}
                        name='ig'
                    >
                        <ReactSVG className='popup broker-logo' src={process.env.PUBLIC_URL + "/ig_logo.svg"} />
                        <div className='popup broker-text'>IG Markets</div>
                    </div>
                    <div 
                        className={'popup broker disabled ' + this.isItemSelected('spotware', broker_info.broker)}
                        onClick={this.setBroker.bind(this)}
                        name='spotware'
                    >
                        <img className='popup broker-logo' src={process.env.PUBLIC_URL + '/ic_markets_logo.png'} />
                        <div className='popup broker-text'>IC Markets</div>
                    </div>
                </div>
            </div>
            {stage_one_elem}
            {stage_two_elem}
            <div className='popup row'>
                <div className='popup center'>
                    <div className='popup broker-btn' onClick={this.onEditBtn.bind(this)}>Edit</div>
                    <div 
                        className={apply_and_save_class}
                        onClick={this.onSave.bind(this)}
                    >
                        Apply & Save
                    </div>
                </div>
            </div>

            </React.Fragment>
        );
    }

    getAddMode = (selected) =>
    {
        const { brokers } = this.state;
        const broker_info = brokers[selected];

        let stage_one_elem;
        if (broker_info.broker !== undefined)
        {
            if (broker_info.broker === 'oanda')
            {
                stage_one_elem = (
                    <React.Fragment key={selected + '_one'}>

                    <div className='popup row'>
                        <div className='popup input'>
                            <div className='popup form-title'>Access Token</div>
                            <input 
                                className='popup text-input' onChange={this.onTextInputChange.bind(this)} 
                                placeholder='e.g. 0j3m4bqf0lzjlqeko76xcuo8cb5yj55q-znhilw4rq0v1lr3k08iuzk2ek9czahhf' name='key' 
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
            else if (broker_info.broker === 'ig')
            {
                stage_one_elem = (
                    <React.Fragment key={selected + '_one'}>

                    <div className='popup row'>
                        <div className='popup input'>
                            <div className='popup form-title'>Username</div>
                            <input 
                                className='popup text-input' defaultValue={broker_info.username} 
                                onChange={this.onTextInputChange.bind(this)} name='username' 
                            />
                        </div>
                    </div>
                    <div className='popup row'>
                        <div className='popup input'>
                            <div className='popup form-title'>Password</div>
                            <input 
                                className='popup text-input' type='password'
                                onChange={this.onTextInputChange.bind(this)} name='password' 
                            />
                        </div>
                    </div>
                    <div className='popup row'>
                        <div className='popup input'>
                            <div className='popup form-title'>Access Token</div>
                            <input className='popup text-input' onChange={this.onTextInputChange.bind(this)} name='key' />
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
            else if (broker_info.broker === 'spotware')
            {
                stage_one_elem = (
                    <React.Fragment key={selected + '_one'}>

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
                <div key={selected + '_one'} className='popup row'>
                    <div className='popup center'>Select your broker...</div>
                </div>
            );
        }

        return (
            <React.Fragment key={selected + '_main'}>
                
            <div className='popup row'>
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
            <div className='popup row'>
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
            <div className='popup column'>
                {/* <div className='popup title underline'>Broker</div> */}
                <div id='popup_broker_selector'>
                    <div 
                        className={'popup broker ' + this.isItemSelected('oanda', broker_info.broker)}
                        onClick={this.setBroker.bind(this)}
                        name='oanda'
                    >
                        <ReactSVG className='popup broker-logo' src={process.env.PUBLIC_URL + '/oanda_logo.svg'} />
                        <div className='popup broker-text'>Oanda</div>
                    </div>
                    <div 
                        className={'popup broker' + this.isItemSelected('ig', broker_info.broker)}
                        onClick={this.setBroker.bind(this)}
                        name='ig'
                    >
                        <ReactSVG className='popup broker-logo' src={process.env.PUBLIC_URL + '/ig_logo.svg'} />
                        <div className='popup broker-text'>IG Markets</div>
                    </div>
                    <div 
                        className={'popup broker' + this.isItemSelected('spotware', broker_info.broker)}
                        onClick={this.setBroker.bind(this)}
                        name='spotware'
                    >
                        <img className='popup broker-logo' src={process.env.PUBLIC_URL + '/ic_markets_logo.png'} />
                        <div className='popup broker-text'>IC Markets</div>
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
        
        let { brokers } = this.state;
        brokers[popup.opened].broker = broker;
        this.setState({ brokers });
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
        else if (broker_info.broker === 'spotware')
        {
            return <img className='popup category-left-logo' src={process.env.PUBLIC_URL + '/ic_markets_logo.png'} />;
        }
    }
}

export default BrokerSettings;