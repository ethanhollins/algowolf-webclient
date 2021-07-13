import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faChevronRight
} from '@fortawesome/pro-regular-svg-icons';

class StrategySettings extends Component
{

    render()
    {
        return(
            <React.Fragment>
            
            <div className='popup header'>
                <span>My Strategies</span>
            </div>
            <div className='popup content'>
                <div className='popup category'>
                    {this.getStrategies()}
                </div>
                <div className='popup main'>
                    <div className='popup main-list'>
                    </div>
                </div>
            </div>

            </React.Fragment>
        );
    }

    getStrategies = () =>
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
                        <div key={strategy_id} className={'popup category-btn' + this.isSelected(strategy_id)} onClick={this.props.onChangeCategory} name={strategy_id}>
                            <div className='popup category-left'>
                                <span className='popup category-left-name'>{strategy_info.name}</span>
                            </div>
                            <div className='popup category-right'><FontAwesomeIcon icon={faChevronRight} className='popup category-icon' /></div>
                        </div>
                    );
                }
            }
        }

        return result;
    }

    isSelected(category)
    {
        const popup = this.props.getPopup();
        if (popup.opened === category)
            return ' selected';
        else
            return '';
    }
}

export default StrategySettings;