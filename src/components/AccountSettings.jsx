import React, { Component } from 'react';
import { ReactSVG } from 'react-svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faArrowAltCircleRight, faUser, faLock, faEnvelope
} from '@fortawesome/pro-regular-svg-icons';

class AccountSettings extends Component
{
    constructor(props)
    {
        super(props);

        this.retrieveAccountInfo = this.retrieveAccountInfo.bind(this);
        this.updateAccountInfo = this.updateAccountInfo.bind(this);
        this.deleteAccount = this.deleteAccount.bind(this);
        this.checkPassword = this.checkPassword.bind(this);
        this.onFieldSaveChanges = this.onFieldSaveChanges.bind(this);
        this.onDeleteAccount = this.onDeleteAccount.bind(this);

        this.setFirstNameRef = elem => {
            this.firstNameElem = elem;
        }
        this.setLastNameRef = elem => {
            this.lastNameElem = elem;
        }
        this.setNameMsgRef = elem => {
            this.nameMsgElem = elem;
        }
        this.setNameSuccessMsgRef = elem => {
            this.nameSuccessMsgElem = elem;
        }
        this.setEmailRef = elem => {
            this.emailElem = elem;
        }
        this.setEmailMsgRef = elem => {
            this.emailMsgElem = elem;
        }
        this.setEmailSuccessMsgRef = elem => {
            this.emailSuccessMsgElem = elem;
        }
        this.setNotifyMeMsgRef = elem => {
            this.notifyMeMsgElem = elem;
        }
        this.setNotifyMeSuccessMsgRef = elem => {
            this.notifyMeSuccessMsgElem = elem;
        }
        this.setOldPasswordRef = elem => {
            this.oldPasswordElem = elem;
        }
        this.setNewPasswordRef = elem => {
            this.newPasswordElem = elem;
        }
        this.setConfirmPasswordRef = elem => {
            this.confirmPasswordElem = elem;
        }
        this.setPasswordMsgRef = elem => {
            this.passwordMsgElem = elem;
        }
        this.setPasswordSuccessMsgRef = elem => {
            this.passwordSuccessMsgElem = elem;
        }
    }

    state = {
        account: null,
        is_change_name: false,
        is_change_email: false,
        is_change_notify_me: false,
        is_change_password: false,
        is_delete_account: false,
        first_name: '',
        last_name: '',
        email: '',
        notify_me: null,
        old_password: '',
        new_password: '',
        confirm_password: '',
        delete_account: ''
    }

    async componentDidMount()
    {
        let { account } = this.state;
        account = await this.retrieveAccountInfo();
        this.setState({ account });
    }

    render()
    {
        const { account } = this.state;
        if (account)
        {
            return (
                <React.Fragment>
    
                <nav>
                    <div className='account-settings nav-group'>
                        <a className='account-settings logo' href='/'>
                            <ReactSVG src={process.env.PUBLIC_URL + "/algowolf.svg"} />
                            
                        </a>
                        <div>
                            <div className='account-settings header'>Account Settings</div>
                        </div>
                    </div>
                    <a className='account-settings btn' href='/app'>
                        <FontAwesomeIcon className='account-settings icon' icon={faArrowAltCircleRight} />
                        <span>Goto App</span>
                    </a>
                </nav>
    
                <div className='account-settings container'>
                    <div className='account-settings main'>
                        <div className="account-settings field">
                            <div className="account-settings field-header">Personal</div>
                            {this.generateNameField()}
                        </div>
                        <div className="account-settings field">
                            <div className="account-settings field-header">Email</div>
                            {this.generateEmailField()}
                            {this.generateNotifyMeField()}
                            <div className="account-settings sub-field">
                                <span className="account-settings item-header disabled">Confirmed:</span> 
                                <span className="account-settings item-value disabled">No</span>
                                {/* <span className="account-settings link-text">Send Confirmation</span> */}
                            </div>
                        </div>
                        
                        <div className="account-settings field">
                            <div className="account-settings field-header">Password</div>
                            {this.generatePasswordField()}
                        </div>
                        <div className="account-settings field disabled">
                            <div className="account-settings field-header">Billing</div>
                            <div className="account-settings sub-field">
                                <div className="account-settings small-text">
                                    No current on-going subscriptions.
                                </div>
                            </div>
                        </div>
                        <div className="account-settings field">
                            <div className="account-settings field-header">General</div>
                            {this.generateDeleteAccountField()}
                        </div>
                    </div>
                </div>
    
                </React.Fragment>
            );
        }
        else
        {
            return <React.Fragment/>;
        }
    }

    async retrieveAccountInfo()
    {
        const { REACT_APP_API_URL } = process.env;

        const reqOptions = {
            method: 'GET',
            headers: this.props.getHeaders(),
            credentials: 'include'
        }

        const res = await fetch(
            `${REACT_APP_API_URL}/v1/account`,
            reqOptions
        );
            
        if (res.status === 200)
        {
            return await res.json();
        }
        else if (res.status === 403)
        {
            window.location = '/logout';
        }
    }

    async updateAccountInfo(update)
    {
        const { REACT_APP_API_URL } = process.env;

        const reqOptions = {
            method: 'POST',
            headers: this.props.getHeaders(),
            credentials: 'include',
            body: JSON.stringify(update)
        }

        const res = await fetch(
            `${REACT_APP_API_URL}/v1/account`,
            reqOptions
        );
            
        if (res.status === 200)
        {
            return await res.json();
        }
        else if (res.status === 403)
        {
            window.location = '/logout';
        }
    }

    async deleteAccount()
    {
        const { REACT_APP_API_URL } = process.env;

        const reqOptions = {
            method: 'DELETE',
            headers: this.props.getHeaders(),
            credentials: 'include'
        }

        const res = await fetch(
            `${REACT_APP_API_URL}/v1/account`,
            reqOptions
        );
            
        if (res.status === 200)
        {
            window.location = '/logout';
        }
    }

    async checkPassword(password)
    {
        const { REACT_APP_API_URL } = process.env;

        const reqOptions = {
            method: 'POST',
            headers: this.props.getHeaders(),
            credentials: 'include',
            body: JSON.stringify({
                email: this.getEmail(),
                password: password
            })
        }

        const res = await fetch(
            `${REACT_APP_API_URL}/login`,
            reqOptions
        );
            
        if (res.status === 200)
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    handleChange = (e) => 
    {
        const name = e.target.getAttribute('name');
        let { first_name, last_name, email, notify_me, old_password, new_password, confirm_password, delete_account } = this.state;
        
        if (name === 'first_name')
        {
            first_name = e.target.value;
        }
        else if (name === 'last_name')
        {
            last_name = e.target.value;
        }
        else if (name === 'email')
        {
            email = e.target.value.toLowerCase();
        }
        else if (name === 'notify_me')
        {
            notify_me = e.target.checked;
        }
        else if (name == 'old_password')
        {
            old_password = e.target.value;
        }
        else if (name === 'new_password')
        {
            new_password = e.target.value;
        }
        else if (name === 'confirm_password')
        {
            confirm_password = e.target.value;
        }
        else if (name === 'delete')
        {
            delete_account = e.target.value;
        }

        this.setState({ first_name, last_name, email, notify_me, old_password, new_password, confirm_password, delete_account });
    }

    getFirstName = () =>
    {
        return (
            this.state.account.first_name.substr(0,1).toUpperCase() +
            this.state.account.first_name.substr(1)
        );
    }

    getLastName = () =>
    {
        return (
            this.state.account.last_name.substr(0,1).toUpperCase() +
            this.state.account.last_name.substr(1)
        );
    }

    generateNameField = () =>
    {
        if (this.getIsChangeName())
        {
            return (
                <React.Fragment>

                <div className="account-settings sub-field">
                    <div className="account-settings input-group">
                        <input 
                            ref={this.setFirstNameRef}
                            type="text" className="account-settings input" 
                            name="first_name" id="first_name" 
                            placeholder="First Name"
                            defaultValue={this.getFirstName()}
                            autoComplete="given-name" required 
                            onChange={this.handleChange}
                        />
                        <input 
                            ref={this.setLastNameRef}
                            type="text" className="account-settings input" 
                            name="last_name" id="last_name" 
                            placeholder="Last Name"
                            defaultValue={this.getLastName()}
                            autoComplete="family-name" required 
                            onChange={this.handleChange} 
                        />
                    </div>
                </div>
                <div className="account-settings sub-field">
                    <span 
                        className="account-settings link-text"
                        name='name'
                        onClick={this.onFieldSaveChanges}
                    >
                        Save Change
                    </span>
                    <span 
                        className="account-settings link-text"
                        name='name'
                        onClick={this.toggleFieldChange}
                    >
                        Cancel
                    </span>
                </div>
                <div className="account-settings sub-field">
                    <span
                        ref={this.setNameMsgRef}
                        className="account-settings error-text"
                    />
                </div>

                </React.Fragment>
            );
        }
        else
        {
            return (
                <div className="account-settings sub-field">
                    <span className="account-settings item-header">Full Name:</span> 
                    <span className="account-settings item-value">
                        {this.getFirstName() + ' ' + this.getLastName()}
                    </span>
                    <span 
                        className="account-settings link-text" 
                        name='name'
                        onClick={this.toggleFieldChange}
                    >
                        Change
                    </span>
                    <span 
                        ref={this.setNameSuccessMsgRef}
                        className="account-settings success-text" 
                    />
                </div>
            );
        }
    }

    getIsChangeName = () =>
    {
        return this.state.is_change_name;
    }

    getEmail = () =>
    {
        return this.state.account.email;
    }

    generateEmailField = () =>
    {
        if (this.getIsChangeEmail())
        {
            return (
                <React.Fragment>

                <div className="account-settings sub-field">
                    <div className="login input-parent">
                        <input 
                            ref={this.setEmailRef}
                            type="email" className="account-settings input" 
                            name="email" id="email" 
                            placeholder="Email"
                            defaultValue={this.getEmail()}
                            required onChange={this.handleChange} 
                        />
                        <span className='login icon' id="email_icon">
                            <FontAwesomeIcon icon={faEnvelope} />
                        </span>
                    </div>
                </div>
                <div className="account-settings sub-field">
                    <span 
                        className="account-settings link-text"
                        name='email'
                        onClick={this.onFieldSaveChanges}
                    >
                        Save Change
                    </span>
                    <span 
                        className="account-settings link-text"
                        name='email'
                        onClick={this.toggleFieldChange}
                    >
                        Cancel
                    </span>
                </div>
                <div className="account-settings sub-field">
                    <span
                        ref={this.setEmailMsgRef}
                        className="account-settings error-text"
                    />
                </div>

                </React.Fragment>
            );
        }
        else
        {
            return (
                <div className="account-settings sub-field">
                    <span className="account-settings item-value">{this.getEmail()}</span>
                    <span 
                        className="account-settings link-text"
                        name='email'
                        onClick={this.toggleFieldChange}
                    >
                        Change
                    </span>
                    <span 
                        ref={this.setEmailSuccessMsgRef}
                        className="account-settings success-text" 
                    />
                </div>
            );
        }
    }

    getIsChangeEmail = () =>
    {
        return this.state.is_change_email;
    }

    generateNotifyMeField = () =>
    {
        if (this.getIsChangeNotifyMe())
        {
            return (
                <React.Fragment>

                <div className="account-settings horiz sub-field">
                    <label className='account-settings checkbox'>
                        <input 
                            type='checkbox' 
                            name='notify_me'
                            defaultChecked={this.getNotifyMe()}
                            onChange={this.handleChange.bind(this)}
                        />
                        <div className='login checkmark'></div>
                    </label>
                    <div className="login small-text">Notify me by email about AlgoWolf updates.</div>
                </div>
                <div className="account-settings sub-field">
                    <span 
                        className="account-settings link-text"
                        name='notify_me'
                        onClick={this.onFieldSaveChanges}
                    >
                        Save Change
                    </span>
                    <span 
                        className="account-settings link-text"
                        name='notify_me'
                        onClick={this.toggleFieldChange}
                    >
                        Cancel
                    </span>
                </div>
                <div className="account-settings sub-field">
                    <span
                        ref={this.setNotifyMeMsgRef}
                        className="account-settings error-text"
                    />
                </div>

                </React.Fragment>
            );
        }
        else
        {
            let notify_me_elem;
            if (this.getNotifyMe())
            {
                notify_me_elem = <span id="green_text" className="account-settings item-value">Yes</span>;
            }
            else
            {
                notify_me_elem = <span id="red_text" className="account-settings item-value">No</span>;
            }

            return (
                <div className="account-settings sub-field">
                    <span className="account-settings item-header">Notifications:</span> 
                    {notify_me_elem}
                    <span 
                        className="account-settings link-text"
                        name='notify_me'
                        onClick={this.toggleFieldChange}
                    >
                        Change
                    </span>
                    <span 
                        ref={this.setNotifyMeSuccessMsgRef}
                        className="account-settings success-text" 
                    />
                </div>
            );
        }
    }

    getIsChangeNotifyMe = () =>
    {
        return this.state.is_change_notify_me;
    }

    getNotifyMe = () =>
    {
        return this.state.account.notify_me;
    }

    getEmailConfirmed = () =>
    {
        return this.state.account.email_confirmed;
    }

    sendEmailConfirmation = () =>
    {
        return;
    }

    generatePasswordField = () =>
    {
        if (this.getIsChangePassword())
        {
            return (
                <React.Fragment>

                <div className="account-settings sub-field">
                    <div className="login input-parent">
                        <input 
                            ref={this.setOldPasswordRef}
                            type="password" className="account-settings input" 
                            name="old_password" id="old_password" 
                            placeholder="Old Password"
                            required onChange={this.handleChange} 
                        />
                        <span className='login icon'>
                            <FontAwesomeIcon icon={faLock} />
                        </span>
                    </div>
                    <div className="account-settings sub-field">
                        <span className="account-settings link-text">Forgot Password?</span>
                    </div>
                    <div className="login input-parent">
                        <input 
                            ref={this.setNewPasswordRef}
                            type="password" className="account-settings input" 
                            name="new_password" id="new_password" 
                            placeholder="New Password"
                            required onChange={this.handleChange} 
                        />
                        <span className='login icon'>
                            <FontAwesomeIcon icon={faLock} />
                        </span>
                    </div>
                    <div className="login input-parent">
                        <input 
                            ref={this.setConfirmPasswordRef}
                            type="password" className="account-settings input" 
                            name="confirm_password" id="confirm_password" 
                            placeholder="Confirm New Password"
                            required onChange={this.handleChange} 
                        />
                        <span className='login icon'>
                            <FontAwesomeIcon icon={faLock} />
                        </span>
                    </div>
                </div>
                <div className="account-settings horiz sub-field">
                    <span 
                        className="account-settings link-text"
                        name='password'
                        onClick={this.onFieldSaveChanges}
                    >
                        Save Change
                    </span>
                    <span 
                        className="account-settings link-text"
                        name='password'
                        onClick={this.toggleFieldChange}
                    >
                        Cancel
                    </span>
                </div>
                <div className="account-settings sub-field">
                    <span
                        ref={this.setPasswordMsgRef}
                        className="account-settings error-text"
                    />
                </div>

                </React.Fragment>
            );
        }
        else
        {
            return (
                <div className="account-settings sub-field">
                    <span 
                        className="account-settings link-text"
                        name='password'
                        onClick={this.toggleFieldChange}
                    >
                        Change My Password
                    </span>
                    <span 
                        ref={this.setPasswordSuccessMsgRef}
                        className="account-settings success-text" 
                    />
                </div>
            );
        }
    }

    getIsChangePassword = () =>
    {
        return this.state.is_change_password;
    }

    performFieldChange = (name) =>
    {
        let { is_change_name, is_change_email, is_change_notify_me, is_change_password, is_delete_account } = this.state;

        if (name === 'name')
        {
            is_change_name = !is_change_name;
        }
        else if (name === 'email')
        {
            is_change_email = !is_change_email;
        }
        else if (name === 'notify_me')
        {
            is_change_notify_me = !is_change_notify_me;
        }
        else if (name === 'password')
        {
            is_change_password = !is_change_password;
        }
        else if (name === 'delete')
        {
            is_delete_account = !is_delete_account;
        }

        this.setState({ is_change_name, is_change_email, is_change_notify_me, is_change_password, is_delete_account });
    }

    generateDeleteAccountField = () =>
    {
        const { delete_account } = this.state;

        if (this.getIsDeleteAccount())
        {
            if (delete_account.toLowerCase() === 'permanently delete')
            {
                return (
                    <React.Fragment>
    
                    <div className="account-settings sub-field">
                        <div className="login input-parent">
                            <input 
                                ref={this.setEmailRef}
                                type="text" className="account-settings input no-icon" 
                                name="delete" id="delete" 
                                placeholder="Type `permanently delete` to delete this account."
                                required onChange={this.handleChange} 
                            />
                        </div>
                    </div>
                    <div className="account-settings sub-field">
                        <span 
                            className="account-settings link-text"
                            name='delete' id="red_text"
                            onClick={this.onDeleteAccount}
                        >
                            Permanently Delete
                        </span>
                        <span 
                            className="account-settings link-text"
                            name='delete'
                            onClick={this.toggleFieldChange}
                        >
                            Cancel
                        </span>
                    </div>
                    <div className="account-settings sub-field">
                        <span
                            ref={this.setDeleteAccountMsgRef}
                            className="account-settings error-text"
                        />
                    </div>
    
                    </React.Fragment>
                );
            }
            else
            {
                return (
                    <React.Fragment>
    
                    <div className="account-settings sub-field">
                        <div className="login input-parent">
                            <input 
                                ref={this.setEmailRef}
                                type="text" className="account-settings input no-icon" 
                                name="delete" id="delete" 
                                placeholder="Type `permanently delete` to delete this account."
                                required onChange={this.handleChange} 
                            />
                        </div>
                    </div>
                    <div className="account-settings sub-field">
                        <span 
                            className="account-settings link-text disabled"
                            name='delete'
                        >
                            Permanently Delete
                        </span>
                        <span 
                            className="account-settings link-text"
                            name='delete'
                            onClick={this.toggleFieldChange}
                        >
                            Cancel
                        </span>
                    </div>
                    <div className="account-settings sub-field">
                        <span
                            ref={this.setDeleteAccountMsgRef}
                            className="account-settings error-text"
                        />
                    </div>
    
                    </React.Fragment>
                );
            }
        }
        else
        {
            return (
                <div className="account-settings sub-field">
                    <span 
                        className="account-settings link-text" 
                        id="red_text" name="delete"
                        onClick={this.toggleFieldChange}
                    >
                        Delete Account
                    </span>
                </div>
            );
        }
    }

    getIsDeleteAccount = () =>
    {
        return this.state.is_delete_account;
    }

    toggleFieldChange = (e) =>
    {
        const name = e.target.getAttribute('name');

        this.performFieldChange(name);
    }

    async onFieldSaveChanges(e)
    {
        const name = e.target.getAttribute('name');
     
        let { account } = this.state;

        if (name === 'name')
        {
            this.firstNameElem.style.borderColor = 'rgb(220,220,220)';
            this.firstNameElem.style.borderWidth = '1px';
            this.lastNameElem.style.borderColor = 'rgb(220,220,220)';
            this.lastNameElem.style.borderWidth = '1px';
            
            let { first_name, last_name } = this.state;
            if (!first_name)
            {
                first_name = this.getFirstName();
            }
            if (!last_name)
            {
                last_name = this.getLastName();
            }

            if (first_name.length <= 1)
            {
                this.firstNameElem.borderColor = '#e74c3c';
                this.firstNameElem.borderWidth = '2px';
                this.nameMsgElem.textContent = 'First name too short.';
            }
            else if (last_name.length <= 1)
            {
                this.lastNameElem.borderColor = '#e74c3c';
                this.lastNameElem.borderWidth = '2px';
                this.nameMsgElem.textContent = 'Last name too short.';
            }
            else
            {
                this.performFieldChange(name);
                const res = await this.updateAccountInfo({
                    first_name: first_name,
                    last_name: last_name
                });

                account = res;
                first_name = '';
                last_name = '';
                this.nameSuccessMsgElem.textContent = 'Successfully updated.'
                this.setState({ account, first_name, last_name });
            }
        }
        else if (name === 'email')
        {
            this.emailElem.style.borderColor = 'rgb(220,220,220)';
            this.emailElem.style.borderWidth = '1px';

            let { email } = this.state;
            if (!email)
            {
                email = this.getEmail();
            }

            if (this.validateEmail(email))
            {
                this.performFieldChange(name);
                const res = await this.updateAccountInfo({
                    email: email
                });

                account = res;
                this.emailSuccessMsgElem.textContent = 'Successfully updated.'
            }
            else
            {
                this.emailElem.style.borderColor = '#e74c3c';
                this.emailElem.style.borderWidth = '2px';
                this.emailMsgElem.textContent = 'Email is not valid.';
            }

            email = '';
            this.setState({ account, email });
        }
        else if (name === 'notify_me')
        {
            let { notify_me } = this.state;
            if (notify_me === null)
            {
                notify_me = this.getNotifyMe();
            }

            this.performFieldChange(name);
            const res = await this.updateAccountInfo({
                notify_me: notify_me
            });

            account = res;
            notify_me = null;
            this.notifyMeSuccessMsgElem.textContent = 'Successfully updated.'
            this.setState({ account, notify_me });
        }
        else if (name === 'password')
        {
            this.oldPasswordElem.style.borderColor = 'rgb(220,220,220)';
            this.oldPasswordElem.style.borderWidth = '1px';
            this.newPasswordElem.style.borderColor = 'rgb(220,220,220)';
            this.newPasswordElem.style.borderWidth = '1px';
            this.confirmPasswordElem.style.borderColor = 'rgb(220,220,220)';
            this.confirmPasswordElem.style.borderWidth = '1px';

            let { old_password, new_password, confirm_password } = this.state;

            const is_password_match = await this.checkPassword(old_password);

            if (is_password_match)
            {
                if (this.passwordStrengthCheck(new_password))
                {
                    if (new_password === confirm_password)
                    {
                        const res = await this.updateAccountInfo({
                            password: new_password
                        });
            
                        account = res;
                        this.performFieldChange(name);
                        this.passwordSuccessMsgElem.textContent = 'Successfully updated.'
                    }
                    else
                    {
                        this.oldPasswordElem.value = '';
                        this.newPasswordElem.value = '';
                        this.newPasswordElem.style.borderColor = '#e74c3c';
                        this.newPasswordElem.style.borderWidth = '2px';
                        this.confirmPasswordElem.value = '';
                        this.confirmPasswordElem.style.borderColor = '#e74c3c';
                        this.confirmPasswordElem.style.borderWidth = '2px';
                        this.passwordMsgElem.textContent = 'Passwords do not match.';
                    }
                }
                else
                {
                    this.confirmPasswordElem.value = '';
                    this.newPasswordElem.value = '';
                    this.oldPasswordElem.value = '';
                    this.newPasswordElem.style.borderColor = '#e74c3c';
                    this.newPasswordElem.style.borderWidth = '2px';
                    this.passwordMsgElem.textContent = 'New password not strong enough.';
                }
            }
            else
            {
                this.confirmPasswordElem.value = '';
                this.newPasswordElem.value = '';
                this.oldPasswordElem.value = '';
                this.oldPasswordElem.style.borderColor = '#e74c3c';
                this.oldPasswordElem.style.borderWidth = '2px';
                this.passwordMsgElem.textContent = 'Old password incorrect.';
            }
            
            old_password = '';
            new_password = '';
            confirm_password = '';
            this.setState({ account, old_password, new_password, confirm_password });
        }
    }

    isDeleteAccount = () =>
    {
        return this.state.is_delete_account;
    }

    async onDeleteAccount()
    {
        await this.deleteAccount();
    }

    validateEmail(email) 
    {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    passwordStrengthCheck(password) {
        var strongRegex = new RegExp("^(?=.{14,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$", "g");
        var mediumRegex = new RegExp("^(?=.{10,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$", "g");
        var enoughRegex = new RegExp("(?=.{8,}).*", "g");

        if (password.length == 0) 
        {
            // Type password
            return false;
        } 
        else if (false == enoughRegex.test(password)) 
        {
            // More Characters
            return false;
        } 
        else if (strongRegex.test(password)) 
        {
            // Strong
            return true;
        } 
        else if (mediumRegex.test(password)) 
        {
            // Medium
            return true;
        } 
        else 
        {
            // Weak
            return true;
        }
    }

}

export default AccountSettings;