import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faChevronRight, faPlus
} from '@fortawesome/pro-light-svg-icons';

class SelectStrategy extends Component
{

    constructor(props)
    {
        super(props);

        this.getUnopenedStrategies = this.getUnopenedStrategies.bind(this);
    }

    state = {
        unopened_strategies: []
    }

    async componentDidMount()
    {
        let { unopened_strategies } = this.state;
        unopened_strategies = await this.getUnopenedStrategies();
        this.setState({ unopened_strategies });
    }

    render()
    {
        const { unopened_strategies } = this.state;

        return(
            <React.Fragment>
            
            <div className='popup header'>
                <span>Open Notebook/Script...</span>
            </div>
            <div className='popup content'>
                <div className='popup main'>
                    <div className='popup select-strategy main-list'>
                        <div className='popup select-strategy main-header'>
                            <span>My Code</span>
                        </div>
                        {unopened_strategies}
                        <div className='popup select-strategy sub-header'>
                            <span>Opened Code</span>
                        </div>
                        {this.getOpenedStrategies()}
                    </div>
                </div>
            </div>
            <div className='popup select-strategy footer'>
                <div className='popup select-strategy footer-btn' onClick={this.onCreateNewStrategy.bind(this)}>
                    <span>Create New Notebook/Script</span>
                    <FontAwesomeIcon icon={faPlus} className='popup category-icon' />
                </div>
            </div>

            </React.Fragment>
        );
    }

    async getUnopenedStrategies()
    {
        const strategies = this.props.getAllStrategyInfo();
        const strategy_details = await this.props.retrieveStrategyDetails();

        let result = [];
        if (strategies !== undefined)
        {
            for (let i of strategy_details.strategies)
            {
                if (!(i.strategy_id in strategies))
                {
                    const strategy_id = i.strategy_id;
                    const name = i.name;
                    result.push(
                        <div key={strategy_id} className={'popup select-strategy category-btn'} name={strategy_id} onClick={this.onUnopenedStrategySelect.bind(this)}>
                            <div className='popup select-strategy category-left'>
                                <span className='popup select-strategy category-left-name'>{name}</span>
                            </div>
                            <div className='popup select-strategy category-right'><FontAwesomeIcon icon={faChevronRight} className='popup category-icon'/></div>
                        </div>
                    );
                }
            }
        }

        if (result.length === 0)
        {
            result.push(
                <div key="create-new-strategy" className={'popup select-strategy category-btn'} onClick={this.onCreateNewStrategy.bind(this)}>
                    <div className='popup select-strategy category-left'>
                        <span className='popup select-strategy category-left-name'>Create New Notebook/Script</span>
                    </div>
                    <div className='popup select-strategy category-right'><FontAwesomeIcon icon={faPlus} className='popup category-icon'/></div>
                </div>
            );
        }

        return result;
    }

    getOpenedStrategies = () =>
    {
        const strategies = this.props.getAllStrategyInfo();

        let result = [];
        if (strategies !== undefined)
        {
            for (let strategy_id in strategies)
            {
                const strategy_info = strategies[strategy_id];

                if (!strategy_id.includes('/backtest/'))
                {
                    result.push(
                        <div key={strategy_id} className={'popup select-strategy category-btn disabled'} name={strategy_id}>
                            <div className='popup select-strategy category-left'>
                                <span className='popup select-strategy category-left-name'>{strategy_info.name}</span>
                            </div>
                        </div>
                    );
                }
            }
        }

        return result;
    }

    async onUnopenedStrategySelect(e)
    {
        const strategy_id = e.target.getAttribute('name');

        const old_metadata = this.props.getAccountMetadata();
        if (old_metadata)
        {
            const new_metadata = {
                current_strategy: strategy_id,
                open_strategies: old_metadata.open_strategies.concat(strategy_id)
            }
            await this.props.updateAccountMetadata(new_metadata);
            window.location.reload();
        }
    }

    onCreateNewStrategy(e)
    {
        // const popup = {
        //     type: 'coming-soon',
        //     size: {
        //         pixelWidth: 600,
        //         pixelHeight: 760
        //     }
        // }
        const popup = {
            type: 'not-available',
            size: {
                pixelWidth: 600,
                pixelHeight: 300
            },
            message: "This feature has been disabled."
        }
        this.props.setPopup(popup);
    }
}

export default SelectStrategy;