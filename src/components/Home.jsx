import React, { Component } from 'react';
import '../Home.css';
import Alerts from './home/Alerts';
import Brokers from './home/Brokers';
import Feed from './home/Feed';
import Hire from './home/Hire';
import Learn from './home/Learn';
import { ReactSVG } from 'react-svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCode, faShapes, faTools, faHandshakeAlt, faArrowCircleRight, 
    faSquare, faSortDown, faBell, faSignIn, faSignOut, faUserPlus
} from '@fortawesome/pro-solid-svg-icons';
import {
    faArrowCircleRight as faArrowCircleRightRegular,
    faShapes as faShapesRegular, faTools as faToolsRegular,
    faHandshakeAlt as faHandshakeAltRegular, faBell as faBellRegular, 
    faCode as faCodeRegular, faSignIn as faSignInRegular,
    faSignOut as faSignOutRegular, faUserPlus as faUserPlusRegular,
} from '@fortawesome/pro-regular-svg-icons';

class Home extends Component
{
    state = {
        isHovered: {
            home: false,
            alerts: false,
            learn: false,
            hire: false,
            brokers: false,
            app: false,
            login: false,
            register: false
        }
    }    

    render()
    {
        return (
            <div className='main container'>
                <div className='home container'>
                    <aside className='home side-panel left'>
                        <div className='panel-group'>
                            <a href="/">
                                <ReactSVG className='home logo' src="./algowolf.svg" />
                            </a>
                            {this.getConditionalNavBtn('home')}
                            {this.getConditionalNavBtn('alerts')}
                            {this.getConditionalNavBtn('learn')}
                            {this.getConditionalNavBtn('hire')}
                            {this.getConditionalNavBtn('brokers')}
                            
                            {this.getConditionalUserComponent()}
                        </div>
                    </aside>
                    <section className='home main'>
                        {this.getConditionalMainComponent()}
                    </section>
                    <aside className='home side-panel right'>
                        <div></div>
                    </aside>
                </div>
            </div>
        )
    }

    async componentDidMount()
    {
        const user_id = await this.props.checkAuthorization();
        this.props.setUserId(user_id);
    }

    getConditionalUserComponent = () =>
    {
        if (this.props.getUserId() !== null)
        {
            return (
                <React.Fragment>

                {this.getConditionalPanelItem('app')}
                <div className='panel-item center-group header'>
                    <FontAwesomeIcon id='profile-icon' icon={faSquare} />
                    <FontAwesomeIcon id='profile-drop-icon' icon={faSortDown} size='1x' />
                    <span id='profile-balance'>$0.00</span>
                </div>
                {this.getConditionalPanelItem('logout')}

                </React.Fragment>
            );
        }
        else
        {
            return (
                <React.Fragment>
                
                {this.getConditionalPanelItem('app')}
                {this.getConditionalPanelItem('login')}
                {this.getConditionalPanelItem('register')}

                </React.Fragment>
            );
        }
    }

    getConditionalMainComponent()
    {
        if (this.props.ept === 'home')
            return <Feed />;
        else if (this.props.ept === 'alerts')
            return <Alerts />;
        else if (this.props.ept === 'learn')
            return <Learn />;
        else if (this.props.ept === 'hire')
            return <Hire />;
        else if (this.props.ept === 'brokers')
            return <Brokers />;
    }

    getConditionalPanelItem(name)
    {
        const { isHovered } = this.state;
        let result = undefined;
        if (name === 'app')
        {
            if (isHovered[name])
                result = (
                    <a 
                        href={'/app'} name={name}
                        onMouseEnter={this.setHover} onMouseLeave={this.unsetHover}
                    >
                        <div className='panel-item large center-group header'>
                            <strong>Goto App</strong><FontAwesomeIcon id='arrow-icon' icon={faArrowCircleRight} />
                        </div>
                    </a>
                );
            else
                result = (
                    <a 
                        href={'/app'} name={name}
                        onMouseEnter={this.setHover} onMouseLeave={this.unsetHover}
                    >
                        <div className='panel-item large center-group header'>
                            Goto App <FontAwesomeIcon id='arrow-icon' icon={faArrowCircleRightRegular} />
                        </div>
                    </a>
                );

            return result;
        }
        else if (name === 'login')
        {
            if (isHovered[name])
                result = (
                    <a 
                        href="/login" name='login'
                        onMouseEnter={this.setHover} onMouseLeave={this.unsetHover}
                    >
                        <div className='small-item page center-group'>
                            <strong>Log In</strong><FontAwesomeIcon id='page-icon' icon={faSignIn} />
                        </div>
                    </a>  
                );
            else
                result = (
                    <a 
                        href="/login" name='login'
                        onMouseEnter={this.setHover} onMouseLeave={this.unsetHover}
                    >
                        <div className='small-item page center-group'>
                            Log In<FontAwesomeIcon id='page-icon' icon={faSignInRegular} />
                        </div>
                    </a>  
                );

            return result;
        }
        else if (name === 'register')
        {
            if (isHovered[name])
                result = (
                    <a 
                        href="/register" name='register'
                        onMouseEnter={this.setHover} onMouseLeave={this.unsetHover}
                    >
                        <div className='small-item page center-group'>
                            <strong>Sign Up</strong><FontAwesomeIcon id='page-icon' icon={faUserPlus} />
                        </div>
                    </a>
                );
            else
                result = (
                    <a 
                        href="/register" name='register'
                        onMouseEnter={this.setHover} onMouseLeave={this.unsetHover}
                    >
                        <div className='small-item page center-group'>
                            Sign Up<FontAwesomeIcon id='page-icon' icon={faUserPlusRegular} />
                        </div>
                    </a>
                );

            return result;
        }
        else if (name === 'logout')
        {
            if (isHovered[name])
                result = (
                    <a 
                        href="/logout" name='logout'
                        onMouseEnter={this.setHover} onMouseLeave={this.unsetHover}
                    >
                        <div className='small-item page center-group'>
                            <strong>Log Out</strong><FontAwesomeIcon id='page-icon' icon={faSignOut} />
                        </div>
                    </a>
                );
            else
                result = (
                    <a 
                        href="/logout" name='logout'
                        onMouseEnter={this.setHover} onMouseLeave={this.unsetHover}
                    >
                        <div className='small-item page center-group'>
                            Log Out<FontAwesomeIcon id='page-icon' icon={faSignOutRegular} />
                        </div>
                    </a>
                );

            return result;
        }
    }

    getConditionalNavBtn(name)
    {
        if (this.props.ept === name)
        {
            return (
                <a 
                    href="/#" className='panel-item' name={name}
                    onMouseEnter={this.setHover} onMouseLeave={this.unsetHover}
                >
                    <div className='page center-group selected'>
                        {this.getConditionalNavBtnIcon(name, true)}
                    </div>
                </a>
            );
        }
        else
        {
            let link = undefined;
            if (name === 'home')
                link = '/';
            else
                link = '/' + name;

            return (
                <a 
                    href={link} className='panel-item' name={name}
                    onMouseEnter={this.setHover} onMouseLeave={this.unsetHover}
                >
                    <div className='page center-group'>
                        {this.getConditionalNavBtnIcon(name, false)}
                    </div>
                </a>
            );
        }
    }

    getConditionalNavBtnIcon(name, isSelected)
    {
        const { isHovered } = this.state;
        let result = undefined;
        if (name === 'home')
        {
            if (isSelected || isHovered[name]) 
                result = (
                    <React.Fragment>
                        <FontAwesomeIcon id='page-icon' icon={faCode} />
                        <strong>Home</strong>
                    </React.Fragment>
                );
            else
                result = (
                    <React.Fragment>
                        <FontAwesomeIcon id='page-icon' icon={faCodeRegular} />Home
                    </React.Fragment>
                );

            return result;
        }
        else if (name === 'alerts')
        {
            if (isSelected || isHovered[name]) 
                result = (
                    <React.Fragment>
                        <FontAwesomeIcon id='page-icon' icon={faBell} />
                        <div id='bubble'><div>7</div></div>
                        <strong>Alerts</strong>
                    </React.Fragment>
                );
            else
                result = (
                    <React.Fragment>
                        <FontAwesomeIcon id='page-icon' icon={faBellRegular} />
                        <div id='bubble'><div>7</div></div>
                        Alerts
                    </React.Fragment>
                );

            return result
        }
        else if (name === 'learn')
        {
            if (isSelected || isHovered[name]) 
                result = (
                    <React.Fragment>
                        <FontAwesomeIcon id='page-icon' icon={faShapes} />
                        <strong>Learn</strong>
                    </React.Fragment>
                );
            else
                result = (
                    <React.Fragment>
                        <FontAwesomeIcon id='page-icon' icon={faShapesRegular} />
                        Learn
                    </React.Fragment>
                );

            return result;
        }
        else if (name === 'hire')
        {
            if (isSelected || isHovered[name]) 
                result = (
                    <React.Fragment>
                        <FontAwesomeIcon id='page-icon' icon={faTools} />
                        <strong>Hire</strong>
                    </React.Fragment>
                );
            else
                result = (
                    <React.Fragment>
                        <FontAwesomeIcon id='page-icon' icon={faToolsRegular} />
                       Hire
                    </React.Fragment>
                );

            return result;
        }
        else if (name === 'brokers')
        {
            if (isSelected || isHovered[name]) 
                result = (
                    <React.Fragment>
                        <FontAwesomeIcon id='page-icon' icon={faHandshakeAlt} />
                        <strong>Brokers</strong>
                    </React.Fragment>
                );
            else
                result = (
                    <React.Fragment>
                        <FontAwesomeIcon id='page-icon' icon={faHandshakeAltRegular} />
                        Brokers
                    </React.Fragment>
                );

            return result;
        }
    }

    setHover = (e) =>
    {
        let { isHovered } = this.state;
        const target = e.currentTarget.getAttribute('name');
        isHovered[target] = true;
        this.setState({ isHovered });
    }

    unsetHover = (e) =>
    {
        let { isHovered } = this.state;
        const target = e.currentTarget.getAttribute('name');
        isHovered[target] = false;
        this.setState({ isHovered });
    }

}

export default Home;