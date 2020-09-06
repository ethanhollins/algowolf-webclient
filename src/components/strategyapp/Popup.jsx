import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faChevronRight
} from '@fortawesome/pro-regular-svg-icons';

class Popup extends Component
{
    constructor(props)
    {
        super(props);

        this.setPopupBody = elem => {
            this.popupBody = elem;
        };
    }

    state = {
        opened: []
    }

    render()
    {
        return(
            <div ref={this.setPopupBody} className='popup body'>
                {this.generatePopup()}
            </div>
        );
    }

    generatePopup()
    {
        if (this.popupBody !== undefined)
        {
            const popup = this.props.getPopup();
    
            if (popup.type === 'windows-charts')
            {
                return this.generateWindowsCharts();
            }
            else if (popup.type === 'windows-stats')
            {
                return this.generateWindowsStats();
            }
            else if (popup.type === 'settings-general')
            {
                return this.generateSettingsGeneral();
            }
            else if (popup.type === 'settings-chart')
            {
                return this.generateSettingsChart();
            }
            else if (popup.type === 'welcome')
            {
                return this.generateWelcome();
            }
        }
    }

    handleBody()
    {
        const popup = this.props.getPopup();
        const container_size = this.props.getSize();
        const width = container_size.width * (popup.size.width / 100);
        const height = container_size.height * (popup.size.height / 100);
        // Handle Sizing
        this.popupBody.style.top = parseInt((container_size.height/2) * (1 - (popup.size.height / 100))) + 'px';
        this.popupBody.style.left = parseInt((container_size.width/2) * (1 - (popup.size.width / 100))) + 'px';
        this.popupBody.style.width = parseInt(width) + 'px';
        this.popupBody.style.height = parseInt(height) + 'px';
    }

    generateWindowsCharts()
    {
        this.handleBody();

        const popup = this.props.getPopup();

        return (
            <React.Fragment>
            
            <div className='popup category'>
                <div className='popup category-title'>
                    <span>Markets</span>
                </div>
                <div className='popup category-btn'>
                    <span className='popup category-left'>Cryptocurrencies</span>
                    <span className='popup category-right'><FontAwesomeIcon icon={faChevronRight} className='popup category-icon' /></span>
                </div>
                <div className='popup category-btn'>
                    <span className='popup category-left'>Currencies</span>
                    <span className='popup category-right'><FontAwesomeIcon icon={faChevronRight} className='popup category-icon' /></span>
                </div>
                <div className='popup category-btn'>
                    <span className='popup category-left'>Stocks</span>
                    <span className='popup category-right'><FontAwesomeIcon icon={faChevronRight} className='popup category-icon' /></span>
                </div>
                <div className='popup category-btn'>
                    <span className='popup category-left'>Indicies</span>
                    <span className='popup category-right'><FontAwesomeIcon icon={faChevronRight} className='popup category-icon' /></span>
                </div>
                <div className='popup category-btn'>
                    <span className='popup category-left'>Futures</span>
                    <span className='popup category-right'><FontAwesomeIcon icon={faChevronRight} className='popup category-icon' /></span>
                </div>
                <div className='popup category-btn'>
                    <span className='popup category-left'>Bonds</span>
                    <span className='popup category-right'><FontAwesomeIcon icon={faChevronRight} className='popup category-icon' /></span>
                </div>
            </div>
            <div className='popup main'>
                <div className='popup main-title'>
                    <span>Charts</span>
                </div>
                <div className='popup main-list'>
                    <span className='popup item-left'>Cryptocurrencies</span>
                    <span className='popup item-right'><FontAwesomeIcon icon={faChevronRight} className='popup item-icon' /></span>
                </div>
            </div>

            </React.Fragment>
        )
    }

    generateWindowsStats()
    {
        const { pos, size } = this.props;

    }

    generateSettingsGeneral()
    {
        const { pos, size } = this.props;

    }

    generateSettingsChart()
    {
        const { pos, size } = this.props;

    }

    generateWelcome()
    {
        const { pos, size } = this.props;

    }
}

export default Popup;