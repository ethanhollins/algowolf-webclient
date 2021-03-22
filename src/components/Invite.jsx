import React, { Component } from 'react';
import { ReactSVG } from 'react-svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faArrowAltCircleRight, faSignOut, faTrash, faCheck, faTimes
} from '@fortawesome/pro-regular-svg-icons';

class Invite extends Component
{
    constructor(props)
    {
        super(props);

        this.checkAuth = this.checkAuth.bind(this);
        this.pendingItems = [];
        this.approvedItems = [];

        this.setPendingCheckboxRef = elem => {
            this.pendingCheckbox = elem;
        }
        this.setPendingItemRef = elem => {
            this.pendingItems.push(elem);
        }
        this.setPendingMessageRef = elem => {
            this.pendingMessage = elem;
        }

        this.setApprovedCheckboxRef = elem => {
            this.approvedCheckbox = elem;
        }
        this.setApprovedItemRef = elem => {
            this.approvedItems.push(elem);
        }
        this.setApprovedMessageRef = elem => {
            this.approvedMessage = elem;
        }

        this.setPopupFade = elem => {
            this.popupFade = elem;
        }
        this.setPopupBody = elem => {
            this.popupBody = elem;
        }
        this.setPopupMessageRef = elem => {
            this.popupMessage = elem;
        }
        this.setYesRef = elem => {
            this.yesElem = elem;
        }
        this.setEmailMessageRef = elem => {
            this.emailMessage = elem;
        }

        this.setEmailTextBoxRef = elem => {
            this.emailTextBox = elem;
        }
    }

    state = {
        checkLogin: false,
        pending: [],
        pending_selected: [],
        approved: [],
        approved_selected: [],
        email_text: '',
        processed_emails: []
    }

    async componentDidMount()
    {
        window.addEventListener("resize", this.onResize.bind(this));

        await this.checkAuth();
        await this.retrieveData();
    }

    render()
    {
        const { checkLogin } = this.state;
        if (checkLogin)
        {
            return (
                <React.Fragment>
    
                <nav>
                    <div className='account-settings nav-group'>
                        <a className='account-settings logo' href='/'>
                            <ReactSVG src={process.env.PUBLIC_URL + "/algowolf.svg"} />
                        </a>
                        <div>
                            <div className='account-settings header'>Prison Paycheck Demo Manager</div>
                        </div>
                    </div>
                    <div className='account-settings nav-group'>
                        <a className='account-settings btn' href='/app'>
                            <FontAwesomeIcon className='account-settings icon' icon={faArrowAltCircleRight} />
                            <span>Goto App</span>
                        </a>
                        <a className='account-settings btn' href='/logout'>
                            <FontAwesomeIcon className='account-settings icon' icon={faSignOut} />
                            <span>Logout</span>
                        </a>
                    </div>
                </nav>

                <div className='account-settings container'>
                    <div className='invite main'>

                        <div className="account-settings field">
                            <div className="account-settings field-header">Invite By Email</div>
                            <div 
                                ref={this.setEmailMessageRef}
                                className='invite message'
                            ></div>
                            <textarea
                                ref={this.setEmailTextBoxRef}
                                className='invite email-textbox'
                                placeholder='Enter emails separated by spaces or commas.'
                                onChange={this.onEmailTextBoxChange.bind(this)}
                                style={{}}
                            ></textarea>
                            <div className='invite btn-group'>
                                <div 
                                    className={'invite btn' + this.isEmailTextBoxPopulated.bind(this)()}
                                    onClick={this.onSendInvite.bind(this)}
                                >
                                    Send Invites
                                </div>
                            </div>
                        </div>

                        <div className="account-settings field">
                            <div className="account-settings field-header">
                                Requested Approval <span className="invite sub-header">(People who have requested to be approved from the demo page.)</span>
                            </div>

                            <div 
                                ref={this.setPendingMessageRef}
                                className='invite message'
                            ></div>

                            <div className="spreadsheet body invite">
                                <div className="spreadsheet row invite">
                                    <div className='spreadsheet cell index invite'>
                                        <label className='login checkbox'>
                                            <input 
                                                ref={this.setPendingCheckboxRef}
                                                type='checkbox' 
                                                defaultChecked={false}
                                                onChange={this.onParentPendingCheckboxInputChange.bind(this)}
                                            />
                                            <div className='login checkmark'></div>
                                        </label>
                                    </div>
                                    <div className='spreadsheet cell item'><div>First Name</div></div>
                                    <div className='spreadsheet cell item'><div>Last Name</div></div>
                                    <div  className='spreadsheet cell item'><div>Email</div></div>
                                </div>
                                {this.generateUserTable('pending')}
                            </div>

                            <div className='invite btn-group'>
                                <div 
                                    className={'invite btn' + this.isSelectedItems('pending')}
                                    onClick={this.isSelectedItems('pending') ? undefined : this.onPendingApproveSelected.bind(this)}
                                >
                                    Approve Selected
                                </div>
                                <div 
                                    className={'invite btn' + this.isSelectedItems('pending')}
                                    onClick={this.isSelectedItems('pending') ? undefined : this.onPendingRemoveSelected.bind(this)}
                                >
                                    Remove Selected
                                </div>
                                <div 
                                    className='invite btn'
                                    onClick={this.onPendingApproveAll.bind(this)}
                                >
                                    Approve All
                                </div>
                            </div>
                            
                        </div>
                        <div className="account-settings field">
                            <div className="account-settings field-header">Approved <span className="invite sub-header">(People who have access to the demo page.)</span></div>

                            <div 
                                ref={this.setApprovedMessageRef}
                                className='invite message'
                            ></div>

                            <div className="spreadsheet body invite">
                                <div className="spreadsheet row invite">
                                    <div className='spreadsheet cell index invite'>
                                        <label className='login checkbox'>
                                            <input 
                                                ref={this.setApprovedCheckboxRef}
                                                type='checkbox' 
                                                defaultChecked={false}
                                                onChange={this.onParentApprovedCheckboxInputChange.bind(this)}
                                            />
                                            <div className='login checkmark'></div>
                                        </label>
                                    </div>
                                    <div className='spreadsheet cell item'><div>First Name</div></div>
                                    <div className='spreadsheet cell item'><div>Last Name</div></div>
                                    <div  className='spreadsheet cell item'><div>Email</div></div>
                                </div>
                                {this.generateUserTable('approved')}
                            </div>

                            <div className='invite btn-group'>
                                <div 
                                    className={'invite btn' + this.isSelectedItems('approved')}
                                    onClick={this.isSelectedItems('approved') ? undefined : this.onApprovedRemoveSelected.bind(this)}
                                >
                                    Remove Selected
                                </div>
                            </div>

                        </div>
                        
                    </div>
                </div>

                <div ref={this.setPopupFade} className='popup fade invite'></div>

                <div 
                    ref={this.setPopupBody} className='popup body invite' 
                >
                    <div className='popup header'>
                        <span>Are You Sure</span>
                    </div>
                    <div className='popup content'>
                        <div className='popup main'>
                            <div className='popup main-list'>
                                <div className='are-you-sure body'>
                                    <div ref={this.setPopupMessageRef} className='invite popup-message'>Are you sure you want to remove this user.</div>
                                    <div className='are-you-sure btn-group'>
                                        <div 
                                            ref={this.setYesRef}
                                            className='are-you-sure btn'
                                        >
                                            Yes
                                        </div>
                                        <div 
                                            className='are-you-sure btn'
                                            onClick={this.closePopup.bind(this)}
                                        >
                                            No
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>   
                </div>
    
                </React.Fragment>
            );
        }
        else
        {
            return <React.Fragment />;
        }
    }


    onResize()
    {
        if (this.popupBody.style.display === 'block')
        {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            this.popupBody.style.top = 'calc(50vh + ' + scrollTop + 'px - 95px)';
            this.popupBody.style.right = (window.innerWidth/2 - 400/2) + 'px';
        }
    }

    async checkAuth()
    {
        const { REACT_APP_API_URL } = process.env;
        let { checkLogin } = this.state;

        var requestOptions = {
            method: 'POST',
            headers: this.props.getHeaders(),
            credentials: 'include'
        };

        const res = await fetch(`${REACT_APP_API_URL}/v1/holygrail/auth/${this.props.getUserId()}`, requestOptions);
        
        if (res.status === 200)
        {
            // Redirect to App
            checkLogin = true;
            this.setState({ checkLogin });
        }
        else
        {
            window.location = '/login';
        }
    }

    async retrieveData()
    {
        const { REACT_APP_API_URL } = process.env;

        var requestOptions = {
            method: 'GET',
            headers: this.props.getHeaders(),
            credentials: 'include'
        };

        const res = await fetch(`${REACT_APP_API_URL}/v1/holygrail`, requestOptions);
        const data = await res.json();

        if (res.status === 200)
        {
            // Redirect to App
            let { pending, approved } = this.state;

            pending = [];
            approved = [];

            for (let i of data.users)
            {
                if (i.approved)
                {
                    approved.push(i);
                }
                else
                {
                    pending.push(i);
                }
            }
            this.setState({ pending, approved });
        }
    }

    async approveUsers(users)
    {
        const { REACT_APP_API_URL } = process.env;

        var requestOptions = {
            method: 'PUT',
            headers: this.props.getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ 
                'approved': true,
                'users': users 
            })
        };

        const res = await fetch(`${REACT_APP_API_URL}/v1/holygrail/approve`, requestOptions);

        if (res.status === 200)
        {
            await this.retrieveData();
            return true;
        }
        else
        {
            return false;
        }
    }

    async removeUsers(users)
    {
        const { REACT_APP_API_URL } = process.env;

        var requestOptions = {
            method: 'DELETE',
            headers: this.props.getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ 
                'users': users 
            })
        };

        const res = await fetch(`${REACT_APP_API_URL}/v1/holygrail`, requestOptions);

        if (res.status === 200)
        {
            await this.retrieveData();
            return true;
        }
        else
        {
            return false;
        }
    }

    async sendInvites(emails)
    {
        const { REACT_APP_API_URL } = process.env;

        var requestOptions = {
            method: 'POST',
            headers: this.props.getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ 
                'emails': emails 
            })
        };

        const res = await fetch(`${REACT_APP_API_URL}/v1/holygrail/invite`, requestOptions);

        if (res.status === 200)
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    generateUserTable(table_name)
    {
        let onChange, itemRef, data, options;

        if (table_name === 'pending')
        {
            itemRef = this.setPendingItemRef;
            onChange = this.onPendingCheckboxInputChange.bind(this);
            data = this.state.pending;
        }
        else
        {
            itemRef = this.setApprovedItemRef;
            onChange = this.onApprovedCheckboxInputChange.bind(this);
            data = this.state.approved;
        }

        const num_rows = data.length;
        const num_cols = 4;

        let result = [];
        for (let i = 0; i < num_rows; i++)
        {
            if (table_name === 'pending')
            {
                options = (
                    <div className='spreadsheet options'>
                        <div 
                            className='spreadsheet options-item' 
                            title='Remove'
                            name={i}
                            onClick={this.onPendingRemove.bind(this)}
                        >
                            <FontAwesomeIcon className='account-settings icon' icon={faTimes} />
                        </div>
                        <div 
                            className='spreadsheet options-item' 
                            title='Approve'
                            name={i}
                            onClick={this.onPendingApprove.bind(this)}
                        >
                            <FontAwesomeIcon className='account-settings icon' icon={faCheck} />
                        </div>
                    </div>
                );
            }
            else
            {
                options = (
                    <div className='spreadsheet options'>
                        <div 
                            className='spreadsheet options-item' 
                            title='Remove'
                            name={i}
                            onClick={this.onApprovedRemove.bind(this)}
                        >
                            <FontAwesomeIcon className='account-settings icon' icon={faTimes} />
                        </div>
                    </div>
                );
            }


            const first_name = data[i].first_name;
            const last_name = data[i].last_name;
            const email = data[i].email;
            result.push(
                <div key={i} className='spreadsheet row'>
                    <div className='spreadsheet cell index invite'>
                        <label className='login checkbox'>
                            <input 
                                ref={itemRef}
                                type='checkbox' 
                                name={i}
                                defaultChecked={false}
                                onChange={onChange}
                            />
                            <div className='login checkmark'></div>
                        </label>
                    </div>
                    <div className='spreadsheet cell item'>
                        <div className='spreadsheet content'>{first_name}</div>
                    </div>
                    <div className='spreadsheet cell item'>
                        <div className='spreadsheet content'>{last_name}</div>
                    </div>
                    <div className='spreadsheet cell item'>
                        <div className='spreadsheet content'>
                            {email}
                        </div>
                        {options}
                    </div>
                </div>
            );
        }

        return result;
    } 

    onParentPendingCheckboxInputChange(e)
    {
        let { pending, pending_selected } = this.state;
        if (e.target.checked)
        {
            pending_selected = [...Array(pending.length).keys()];

            for (let i of this.pendingItems)
            {
                if (i)
                {
                    i.checked = true;
                }
            }
        }
        else
        {
            pending_selected = [];

            for (let i of this.pendingItems)
            {
                if (i)
                {
                    i.checked = false;
                }
            }
        }

        this.setState({ pending_selected });
    }

    onPendingCheckboxInputChange(e)
    {
        const idx = parseInt(e.target.getAttribute('name'));
        
        let { pending, pending_selected } = this.state;

        if (e.target.checked)
        {
            pending_selected.push(idx);
        }
        else
        {
            pending_selected.splice(pending_selected.indexOf(idx), 1);
        }

        if (pending_selected.length === pending.length)
        {
            this.pendingCheckbox.checked = true;
        }
        else
        {
            this.pendingCheckbox.checked = false;
        }

        this.setState({ pending_selected });
    }

    onParentApprovedCheckboxInputChange(e)
    {
        let { approved, approved_selected } = this.state;
        if (e.target.checked)
        {
            approved_selected = [...Array(approved.length).keys()];

            for (let i of this.approvedItems)
            {
                if (i)
                {
                    i.checked = true;
                }
            }
        }
        else
        {
            approved_selected = [];

            for (let i of this.approvedItems)
            {
                if (i)
                {
                    i.checked = false;
                }
            }
        }

        this.setState({ approved_selected });
    }

    onApprovedCheckboxInputChange(e)
    {
        const idx = parseInt(e.target.getAttribute('name'));
        
        let { approved, approved_selected } = this.state;

        if (e.target.checked)
        {
            approved_selected.push(idx);
        }
        else
        {
            approved_selected.splice(approved_selected.indexOf(idx), 1);
        }

        if (approved_selected.length === approved.length)
        {
            this.approvedCheckbox.checked = true;
        }
        else
        {
            this.approvedCheckbox.checked = false;
        }
        
        this.setState({ approved_selected });
    }

    isSelectedItems = (table_name) =>
    {
        const { pending_selected, approved_selected } = this.state;
        if (table_name === 'pending' && pending_selected.length > 0)
        {
            return '';
        }
        else if (table_name === 'approved' && approved_selected.length > 0)
        {
            return '';
        }

        return ' disabled';
    }

    onAreYouSure(message)
    {
        const body = document.body,
              html = document.documentElement;

        const height = Math.max( body.scrollHeight, body.offsetHeight, 
                            html.clientHeight, html.scrollHeight, html.offsetHeight );

        this.popupFade.style.display = 'block';
        this.popupFade.style.height = height + 'px';

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        this.popupBody.style.display = 'block';
        this.popupBody.style.top = 'calc(50vh + ' + scrollTop + 'px - 95px)';
        this.popupBody.style.right = (window.innerWidth/2 - 450/2) + 'px';
        this.popupMessage.textContent = message;
    }

    resetSelected = () =>
    {
        let { approved_selected, pending_selected } = this.state;
        
        for (let i of this.pendingItems)
        {
            if (i)
            {
                i.checked = false;
            }
        }
        this.pendingCheckbox.checked = false;

        for (let i of this.approvedItems)
        {
            if (i)
            {
                i.checked = false;
            }
        }
        this.approvedCheckbox.checked = false;

        pending_selected = [];
        approved_selected = [];
        this.setState({ approved_selected, pending_selected });
    }

    onPendingMessage(success)
    {
        if (success)
        {
            this.pendingMessage.textContent = 'Operation completed successfully!';
            this.pendingMessage.style.display = 'block';
            this.pendingMessage.style.backgroundColor = '#2ecc71';
        }
        else
        {
            this.pendingMessage.textContent = 'Operation failed.';
            this.pendingMessage.style.display = 'block';
            this.pendingMessage.style.backgroundColor = '#e74c3c';
        }
    }

    onApprovedMessage(success)
    {
        if (success)
        {
            this.approvedMessage.textContent = 'Operation completed successfully!';
            this.approvedMessage.style.display = 'block';
            this.approvedMessage.style.backgroundColor = '#2ecc71';
        }
        else
        {
            this.approvedMessage.textContent = 'Operation failed.';
            this.approvedMessage.style.display = 'block';
            this.approvedMessage.style.backgroundColor = '#e74c3c';
        }
    }

    onPendingRemove(e)
    {
        const idx = e.target.getAttribute('name');
        this.yesElem.setAttribute('name', idx);
        this.yesElem.onclick = this.onPendingRemoveYes.bind(this);
        this.onAreYouSure('Are you sure you want to remove this request.');
    }

    async onPendingRemoveYes(e)
    {
        const { pending } = this.state;
        
        const idx = e.target.getAttribute('name');
        this.closePopup();

        this.resetSelected();
        const success = await this.removeUsers([pending[parseInt(idx)].user_id]);

        this.onPendingMessage(success);
    }

    onPendingApprove(e)
    {
        const idx = e.target.getAttribute('name');
        this.yesElem.setAttribute('name', idx);
        this.yesElem.onclick = this.onPendingApproveYes.bind(this);
        this.onAreYouSure('Are you sure you want to approve this request.');
    }

    async onPendingApproveYes(e)
    {
        const { pending } = this.state;

        const idx = e.target.getAttribute('name');
        this.closePopup();

        this.resetSelected();
        const success = await this.approveUsers([pending[parseInt(idx)].user_id]);

        this.onPendingMessage(success);
    }

    onPendingApproveSelected(e)
    {
        this.yesElem.onclick = this.onPendingApproveSelectedYes.bind(this);
        this.onAreYouSure('Are you sure you want to approve all selected requests.');
    }

    async onPendingApproveSelectedYes(e)
    {
        let { pending, pending_selected } = this.state;

        let users = [];
        for (let i of pending_selected)
        {
            users.push(pending[i].user_id);
        }
        
        this.closePopup();

        this.resetSelected();
        const success = await this.approveUsers(users);

        this.onPendingMessage(success);
    }

    onPendingRemoveSelected(e)
    {
        this.yesElem.onclick = this.onPendingRemoveSelectedYes.bind(this);
        this.onAreYouSure('Are you sure you want to remove all selected requests.');
    }

    async onPendingRemoveSelectedYes(e)
    {
        let { pending, pending_selected } = this.state;

        let users = [];
        for (let i of pending_selected)
        {
            users.push(pending[i].user_id);
        }

        this.closePopup();
        
        this.resetSelected();
        const success = await this.removeUsers(users);

        this.onPendingMessage(success);
    }

    onPendingApproveAll(e)
    {
        this.yesElem.onclick = this.onPendingApproveAllYes.bind(this);
        this.onAreYouSure('Are you sure you want to approve all requests.');
    }

    async onPendingApproveAllYes(e)
    {
        const { pending } = this.state;

        let users = [];
        for (let i of pending)
        {
            users.push(i.user_id);
        }
        
        this.closePopup();

        this.resetSelected();
        const success = await this.approveUsers(users);

        this.onPendingMessage(success);
    }

    onApprovedRemove(e)
    {
        const idx = e.target.getAttribute('name');
        this.yesElem.setAttribute('name', idx);
        this.yesElem.onclick = this.onApprovedRemoveYes.bind(this);
        this.onAreYouSure('Are you sure you want to remove this user.');
    }

    async onApprovedRemoveYes(e)
    {
        const { approved } = this.state;
        
        const idx = e.target.getAttribute('name');
        this.closePopup();
        
        this.resetSelected();
        const success = await this.removeUsers([approved[parseInt(idx)].user_id]);

        this.onApprovedMessage(success);
    }

    onApprovedRemoveSelected(e)
    {
        this.yesElem.onclick = this.onApprovedRemoveSelectedYes.bind(this);
        this.onAreYouSure('Are you sure you want to remove all selected users.');
    }

    async onApprovedRemoveSelectedYes(e)
    {
        let { approved, approved_selected } = this.state;

        let users = [];
        for (let i of approved_selected)
        {
            users.push(approved[i].user_id);
        }

        this.resetSelected();
        this.closePopup();

        const success = await this.removeUsers(users);

        this.onApprovedMessage(success);
    }

    closePopup()
    {
        this.popupFade.style.display = 'none';
        this.popupBody.style.display = 'none';

        let { email_text, processed_emails } = this.state;
        email_text = '';
        processed_emails = [];
        this.emailTextBox.value = '';
        this.setState({ email_text, processed_emails });
    }

    isEmailTextBoxPopulated()
    {
        const { email_text } = this.state;
        if (email_text.length > 0)
        {
            return '';
        }
        
        return ' disabled';
    }

    onEmailTextBoxChange(e)
    {
        let { email_text } = this.state;
        email_text = this.emailTextBox.value;
        this.setState({ email_text });
    }

    validateEmail(email) 
    {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    onSendInvite(e)
    {
        let { email_text, processed_emails } = this.state;
        
        const emails_raw = email_text.split(/[\s,]+/);

        for (let i of emails_raw)
        {
            if (this.validateEmail(i))
            {
                processed_emails.push(i);
            }
        }

        processed_emails = [...new Set(processed_emails)];

        this.setState({ email_text, processed_emails });
        this.yesElem.onclick = this.onSendInviteYes.bind(this);
        this.onAreYouSure(`Are you sure you want to send invite to ${processed_emails.length} emails.`);
    }

    async onSendInviteYes()
    {
        let { processed_emails } = this.state;
        console.log('SENDING');
        console.log(processed_emails);
        this.closePopup();
        
        const success = await this.sendInvites(processed_emails);

        if (success)
        {
            this.emailMessage.textContent = 'Invites sent successfully!';
            this.emailMessage.style.display = 'block';
            this.emailMessage.style.backgroundColor = '#2ecc71';
        }
        else
        {
            this.emailMessage.textContent = 'Invites failed to send.';
            this.emailMessage.style.display = 'block';
            this.emailMessage.style.backgroundColor = '#e74c3c';
        }
    }

}

export default Invite;