import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBars, faChevronRight, faArrowAltCircleRight, faHome
} from '@fortawesome/pro-regular-svg-icons';
import { faSignOut } from '@fortawesome/pro-light-svg-icons';

class StrategyToolbar extends Component
{
    constructor(props)
    {
        super(props);

        this.setMenuElem = elem => {
            this.menuElem = elem;
        }
        this.setMenuDropdown = elem => {
            this.menuDropdown = elem;
        }
    }
    
    render()
    {
        return (
            <div className='toolbox body noselect' onDragStart={this.onDragStart}>
                <div>
                    <div className='toolbox item'>
                        <div ref={this.setMenuElem} className='toolbox item row btn' onClick={this.onMenuDropdown}>
                            <FontAwesomeIcon className='toolbox standalone-icon' icon={faBars} />
                        </div>
                        <div ref={this.setMenuDropdown} className='toolbox dropdown' style={{display: 'none'}}>
                            <div className='dropdown-item' onClick={this.onMenuDropdownItem} name='brokers'>
                                <span className='toolbox left'>My Brokers</span>
                                <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon' /></span>
                            </div>
                            {/* <div 
                                className='dropdown-item disabled' name='strategies'
                            >
                                <span className='toolbox left'>My Strategies</span>
                                <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon disabled' /></span>
                            </div> */}
                            <div className='dropdown-item' onClick={this.onMenuDropdownItem} name='account'>
                                <span className='toolbox left'>Account Settings</span>
                                <span className='toolbox right'><FontAwesomeIcon icon={faChevronRight} className='toolbox right-icon' /></span>
                            </div>
                            <div className='dropdown-separator'></div>
                            <div className='dropdown-item' onClick={this.onMenuDropdownItem} name='my-dashboard'>
                                <span className='toolbox left'>My Dashboard</span>
                                <span className='toolbox right'><FontAwesomeIcon icon={faArrowAltCircleRight} className='toolbox right-icon medium' /></span>
                            </div>
                            <div className='dropdown-item' onClick={this.onMenuDropdownItem} name='home'>
                                <span className='toolbox left'>Home</span>
                                <span className='toolbox right'><FontAwesomeIcon icon={faHome} className='toolbox right-icon medium' /></span>
                            </div>
                            <div className='dropdown-item' onClick={this.onMenuDropdownItem} name='logout'>
                                <span className='toolbox left'>Logout</span>
                                <span className='toolbox right'><FontAwesomeIcon icon={faSignOut} className='toolbox right-icon' /></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div> 
        );
    }

   

    onMenuDropdown = (e) =>
    {
        if (this.menuDropdown.style.display === 'none')
        {
            this.menuDropdown.style.display = 'block';
            const btn_rect = this.menuElem.getBoundingClientRect();
            this.menuDropdown.style.left = parseInt(btn_rect.x) + 'px';
        }
        else
        {
            this.menuDropdown.style.display = 'none';
        }
    }

    onMenuDropdownItem = (e) =>
    {
        this.menuDropdown.style.display = 'none';

        const name = e.target.getAttribute('name');

        if (name === 'brokers')
        {
            const popup = {
                type: 'broker-settings',
                size: {
                    width: 60,
                    height: 75
                }
            }
            this.props.setPopup(popup);
        }
        else if (name === 'strategies')
        {
            const popup = {
                type: 'strategy-settings',
                size: {
                    width: 60,
                    height: 75
                }
            }
            this.props.setPopup(popup);
        }
        else if (name === 'account')
        {
            this.props.history.push('/account-settings');
        }
        else if (name === 'my-dashboard')
        {
            window.location = '/app';
        }
        else if (name === 'home')
        {
            const { REACT_APP_FRONT_BASE_URL } = process.env;
            window.location.href = REACT_APP_FRONT_BASE_URL;
        }
        else if (name === 'logout')
        {
            this.props.history.push('/logout');
        }
        
    }

    onNotAvailableItem = (e) =>
    {
        const popup = {
            type: 'not-available',
            size: {
                width: 30,
                height: 30
            }
        }
        this.props.setPopup(popup);
    }

    onNotAvailableDropdownItem = (e) =>
    {
        e.target.parentNode.style.display = 'none';
        
        const popup = {
            type: 'not-available',
            size: {
                width: 30,
                height: 30
            }
        }
        this.props.setPopup(popup);
    }

    closeTemporaryWindows(mouse_pos)
    {
        if (this.menuDropdown.style.display !== 'none')
        {
            if (!this.props.isWithinBounds(this.menuDropdown.getBoundingClientRect(), mouse_pos))
                this.menuDropdown.style.display = 'none';
        }
    }
}

export default StrategyToolbar;