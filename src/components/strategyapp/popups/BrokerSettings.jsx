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
        mode: 'edit',
        brokers: {},
        change_key: false
    }

    async componentDidMount()
    {
        let { brokers } = this.state;
        brokers = await this.props.retrieveAllBrokers();
        this.setState({ brokers });

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
        const { mode } = this.state;
        if (mode !== 'add')
        {
            this.setMode('edit');
            return this.props.onChangeCategory(e);
        }
    }

    getBrokers = () =>
    {
        const { brokers } = this.state;
        
        let result = [];
        if (brokers !== undefined)
        {
            for (let broker_id in brokers)
            {
                const broker_info = brokers[broker_id];

                if (broker_info.name !== null)
                {
                    result.push(
                        <div key={broker_id} className={'popup category-btn' + this.isSelected(broker_id)} onClick={this.onChangeCategory} name={broker_id}>
                            <div className='popup category-left'>
                                <ReactSVG className='popup category-left-logo' src={`./${broker_info.broker}_logo.svg`} />
                                <span className='popup category-left-name'>{broker_info.name}</span>
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
        let { brokers, mode } = this.state;
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
        mode = 'add';
        this.props.changeCategory(default_name);
        this.setState({ brokers, mode });
    }

    getItems = () =>
    {
        const { brokers, change_key, mode } = this.state;
        const selected = this.getSelected();

        if (selected in brokers)
        {
            const broker_info = brokers[selected];

            let key_elem;
            if (change_key || mode === 'add')
            {
                key_elem = (
                    <div className='popup input'>
                        <div className='popup title'>API Key</div>
                        <input className='popup text-input' onChange={this.onTextInputChange.bind(this)} name='key' />
                    </div>
                );
            }
            else
            {
                key_elem = (
                    <div className='popup input'>
                        <div className='popup title'>API Key</div>
                        <div className='popup key'>****************************************</div><div className='popup key-btn'>Change</div>
                    </div>
                );
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
                            className={'popup broker' + this.isItemSelected('oanda', broker_info.broker)}
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
                <div className='popup row'>
                    {key_elem}
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
        else
        {

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
            return ' selected' + this.isDisabled();
        }
        else
        {
            return '' + this.isDisabled();
        }
    }

    isDisabled()
    {
        if (this.state.mode === 'edit')
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

    setMode(mode)
    {
        this.setState({ mode });
    }
}

export default BrokerSettings;