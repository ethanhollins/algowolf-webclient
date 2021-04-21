import React, { Component } from 'react';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

class Graph extends Component
{
    constructor(props)
    {
        super(props);

        this.update = this.update.bind(this);

        this.setBackgroundRef = elem => {
            this.background = elem;
        }
        this.setCanvasRef = elem => {
            this.canvas = elem;
        }
        
    }

    state = {
        header: 'Equity %',
        description: 'Percentage equity curve not including commisions.',
        infoLocation: 'top',
        graph: null,
        data: []
    }

    componentDidMount()
    {
        window.addEventListener("resize", this.update);

        this.setData();
        this.createGraph();
    }

    componentDidUpdate()
    {
        this.update();
    }

    componentWillUnmount()
    {
        window.removeEventListener("resize", this.update);
    }

    render()
    {
        return (
            <div 
                ref={this.setBackgroundRef}
                className="graph background"
            >
                {this.generateGraph()}
            </div>
        );
    }
   
    update()
    {
        const { graph } = this.state;
        const width = Math.min(this.background.clientWidth, 1500) - this.getGraphWidthOff();
        const height = this.background.clientHeight - this.getGraphHeightOff();
        graph.resize(width, height);
    }

    setData()
    {
        const x_values = this.props.x_values[0];
        const y_values = this.props.y_values[0];

        let { data } = this.state;
        for (let i=0; i < x_values.length; i++)
        {
            data.push({
                x: x_values[i],
                y: y_values[i]
            })
        }
        this.setState({ data });
    }

    createGraph()
    {
        const ctx = this.canvas.getContext("2d");
        
        let { graph, data } = this.state;
        graph = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Equity %',
                    data: data,
                    backgroundColor: [
                        'rgba(52, 152, 219, 0.2)',
                    ],
                    borderColor: [
                        'rgba(52, 152, 219, 1.0)',
                    ],
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    },
                    x: {
                        ticks: {
                            maxTicksLimit: 12,
                            callback: function(value, index, values) { 
                                return '';
                                // return data[index].x.split(' ')[0];
                            }
                        }
                    }
                },
                layout: {
                    padding: {
                        top: 10,
                        bottom: 10,
                        left: 35,
                        right: 35
                    }
                },
                elements: {
                    point:{
                        radius: 0
                    }
                },
                responsive: false,
                maintainAspectRatio: false,
            }
        });

        const width = Math.min(this.background.clientWidth, 1000) - this.getGraphWidthOff();
        const height = this.background.clientHeight - this.getGraphHeightOff();
        graph.resize(width, height);

        this.setState({ graph });
    }

    generateGraph()
    {
        const { header, description, infoLocation } = this.state;

        let header_elem;
        let description_elem;
        if (this.props.title !== null)
        {
            header_elem = <div className="graph header">{this.props.title}</div>;
        }
        if (this.props.description !== null)
        {
            description_elem = <div className="graph description">{this.props.description}</div>;
        }

        if (infoLocation === 'top')
        {
            return (
                <React.Fragment>
                
                {header_elem}
                {description_elem}
                <canvas 
                    ref={this.setCanvasRef}
                    className="graph body"
                />
    
                </React.Fragment>
            );
        }
        else if (infoLocation === 'bottom')
        {
            return (
                <React.Fragment>
                
                <canvas 
                    ref={this.setCanvasRef}
                    className="graph body"
                />
                {header_elem}
                {description_elem}
    
                </React.Fragment>
            );
        }
    }

    getGraphWidthOff()
    {
        const { header, description, infoLocation } = this.state;

        let width_off = 20;

        return width_off;
    }

    getGraphHeightOff()
    {
        const { header, description, infoLocation } = this.state;

        let height_off = 20;
        if (infoLocation === 'top' || infoLocation === 'bottom')
        {
            if (header !== null)
            {
                height_off += 35;
            }
            if (description !== null)
            {
                height_off += 30;
            }
        }

        return height_off;
    }

}

export default Graph;