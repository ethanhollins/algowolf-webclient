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
        show: {}
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

    onConnect(e)
    {
        let { brokers } = this.state;
        const broker_id = this.props.getPopup().opened;
        
        // Call Api Connect EPT

        brokers[broker_id].connected = true;
        brokers[broker_id].accounts = [
            'ABCD', 'EFGH', 'IJKL'
        ];
        this.setState({ brokers });
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
                                <ReactSVG className='popup category-left-logo' src={`./${broker_info.broker}_logo.svg`} />
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

    addBroker = () =>
    {
        let { brokers, modes } = this.state;
        let default_name = 'My Broker';
        let count = 0;
        while (default_name in brokers)
        {
            count += 1;
            default_name = `My Broker ${count}`;
        }

        brokers[default_name] = {
            key: '',
            is_demo: true,
            name: default_name,
        }
        modes[default_name] = 'add';

        this.props.changeCategory(default_name);
        this.setState({ brokers, modes });
    }

    getEditMode = (selected) =>
    {
        const { brokers } = this.state;
        const broker_info = brokers[selected];

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
                        <ReactSVG className='popup broker-logo' src="./oanda_logo.svg" />
                        <div className='popup broker-text'>Oanda</div>
                    </div>
                    <div 
                        className={'popup broker disabled ' + this.isItemSelected('ig', broker_info.broker)}
                        onClick={this.setBroker.bind(this)}
                        name='ig'
                    >
                        <ReactSVG className='popup broker-logo' src="./ig_logo.svg" />
                        <div className='popup broker-text'>IG Markets</div>
                    </div>
                </div>
            </div>
            <div className='popup row'>
                <div className='popup input'>
                    <div className='popup title'>API Key</div>
                    <div className='popup key'>****************************************</div><div className='popup key-btn'>Change</div>
                </div>
            </div>
            <div className='popup row'>
                <div className='popup center'>
                    <div className='popup broker-btn'>Connect</div>
                </div>
            </div>
            <div className='popup row'>
                <div className='popup title underline'>Accounts</div>
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
                    <div key={selected + '_one'} className='popup row'>
                        <div className='popup input'>
                            <div className='popup title'>API Key</div>
                            <input className='popup text-input' onChange={this.onTextInputChange.bind(this)} name='key' />
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
                            <div className='popup title'>Username</div>
                            <input className='popup text-input' onChange={this.onTextInputChange.bind(this)} name='username' />
                        </div>
                    </div>
                    <div className='popup row'>
                        <div className='popup input'>
                            <div className='popup title'>Password</div>
                            <input className='popup text-input' onChange={this.onTextInputChange.bind(this)} name='password' />
                        </div>
                    </div>
                    <div className='popup row'>
                        <div className='popup input'>
                            <div className='popup title'>API Key</div>
                            <input className='popup text-input' onChange={this.onTextInputChange.bind(this)} name='key' />
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

        let stage_two_elem;
        if (broker_info.connected === true)
        {
            let account_elems = [];
            for (let account_id of broker_info.accounts)
            {
                // Account elems with checkbox for selection and nickname input box
                account_elems.push(
                    <div key={account_id} className='popup account-item'>

                        <div>
                            <label className='popup checkbox'>
                                <input type='checkbox' />
                                <div className='checkmark'></div>
                            </label>
                            <div>{account_id}</div>
                        </div>
                        <div className='popup input small'>
                            <input 
                                placeholder='Nickname'
                                className='popup text-input'
                                // onChange={this.onTextInputChange.bind(this)} 
                                name='nickname'
                            />
                        </div>

                    </div>
                );
            }

            stage_two_elem = (
                <div key={selected + '_two'} className='popup column'>
                    <div className='popup title underline'>Accounts</div>
                    <div className='popup account-list'>
                        {account_elems}
                    </div>
                </div>
            );
        }
        else if (broker_info.broker !== undefined)
        {
            stage_two_elem = (
                <div key={selected + '_two'} className='popup row'>
                    <div className='popup center' onClick={this.onConnect.bind(this)}>
                        <div className='popup broker-btn'>Connect</div>
                    </div>
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
                        <ReactSVG className='popup broker-logo' src="./oanda_logo.svg" />
                        <div className='popup broker-text'>Oanda</div>
                    </div>
                    <div 
                        className={'popup broker' + this.isItemSelected('ig', broker_info.broker)}
                        onClick={this.setBroker.bind(this)}
                        name='ig'
                    >
                        <ReactSVG className='popup broker-logo' src="./ig_logo.svg" />
                        <div className='popup broker-text'>IG Markets</div>
                    </div>
                </div>
            </div>
            {stage_one_elem}
            {stage_two_elem}
            

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
            else if (mode === 'edit')
            {
                return this.getEditMode(selected);
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
        const popup = this.props.getPopup();
        
        let { brokers } = this.state;
        brokers[popup.opened][attr] = value;
        this.setState({ brokers });
    }

    setMode(broker_id, new_mode)
    {
        let { modes } = this.state;
        modes[broker_id] = new_mode;
        this.setState({ modes });
    }
}

export default BrokerSettings;