import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHammer
} from '@fortawesome/pro-solid-svg-icons';

class UnderConstruction extends Component
{
    render()
    {
        return (
            <div id='under-construction'>
                <FontAwesomeIcon id='hammer-icon' icon={faHammer} /><br/>
                <strong>Sorry this page is under construction. Come back later!</strong>
            </div>
        );
    }
}

export default UnderConstruction;