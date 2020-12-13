import React, { Component } from 'react';
import SpreadSheet from './SpreadSheet';

class Report extends Component
{

    state = {
        data: null
    }

    async componentDidMount()
    {
        const data = await this.retrieveData();
        console.log(data);
        this.setState({ data });
    }
    
    render()
    {
        return (
            <SpreadSheet
                key={this.getName()}
                data={this.getData()}
                getScreenSize={this.props.getScreenSize}
            />
        );
    }


    getName = () =>
    {
        return this.props.info.properties.name;
    }

    getData = () =>
    {
        return this.state.data;
    }

    retrieveData = () =>
    {
        return this.props.retrieveReport(this.getName());
    }
   
}

export default Report;