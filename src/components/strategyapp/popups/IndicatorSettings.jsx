import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faChevronDown
} from '@fortawesome/pro-regular-svg-icons';

class IndicatorSettings extends Component
{
    componentDidMount()
    {

    }

    render()
    {
        return(
            <React.Fragment>
            
            <div className='popup header no-border'>
                <span>{this.getName()}</span>
            </div>
            <div className='popup category-top'>
                <div 
                    className={this.isSelected('properties') ? 'selected' : ''}
                    name={'properties'}
                    onClick={this.onSelect}
                >
                    Properties
                </div>
                <div 
                    className={this.isSelected('appearance') ? 'selected' : ''}
                    name={'appearance'}
                    onClick={this.onSelect}
                >
                    Appearance
                </div>
            </div>
            <div className='popup content'>
                <div className='popup main'>
                    {this.getItems()}
                </div>
            </div>
            <div className='popup footer'>
                <div className='popup dropdown'>
                    <div className='popup dropdown-btn layout-dropdown' onClick={this.onDropdownClick}>
                        <span>Default</span>
                        <FontAwesomeIcon icon={faChevronDown} />
                    </div>
                    <div className='popup dropdown-content' onClick={this.onDropdownSelectLayout}>
                        
                    </div>
                </div>
                <div className='popup accept-group'>
                    <div onClick={this.onCancel}>Cancel</div>
                    <div onClick={this.onApply}>Ok</div>
                </div>
            </div>

            </React.Fragment>
        );
    }

    getPropertyItems()
    {
        return (
            <div key='properties' className='popup table'>
            
            <div className='popup table-row'>
                <div className='popup table-cell'>
                    <div className='popup left'>Period</div>
                </div>
                <div className='popup table-cell'>
                    <div className='popup right'>
                        one
                    </div>
                </div>
            </div>

            </div>
        )
    }

    getAppearanceItems()
    {

    }

    getItems()
    {
        const opened = this.props.getPopup().opened;

        if (opened === 'properties')
        {
            return this.getPropertyItems();
        }
        else if (opened === 'appearance')
        {
            return this.getAppearanceItems();
        }
    }

    getName = () =>
    {
        const name = this.props.getPopup().properties.indicator.type
        return name.substr(0,1).toUpperCase() + name.substr(1);
    }
    
    isSelected = (name) =>
    {
        return this.props.getPopup().opened === name;
    }

    onSelect = (e) =>
    {
        const name = e.target.getAttribute('name');
        this.props.changeCategory(name);
    }

    onCancel = () =>
    {

    }

    onApply = () =>
    {

    }
}

export default IndicatorSettings;