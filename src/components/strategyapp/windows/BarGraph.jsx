import React, { Component } from 'react';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

class BarGraph extends Component
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
        description: 'Percentage equity curve not including commissions.',
        infoLocation: 'top',
        graph: null,
        datasets: []
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
        const y_values = this.props.y_values;

        let { datasets } = this.state;
        for (let i=0; i < y_values.length; i++)
        {
            // datasets.push({
            //     label: this.props.labels[i],
            //     backgroundColor: [
            //         'rgba(52, 152, 219, 0.2)',
            //     ],
            //     borderColor: [
            //         'rgba(52, 152, 219, 1.0)',
            //     ],
            //     borderWidth: 2,
            //     fill: true,
            //     data: [{
            //         y: parseFloat(y_values[i]), 
            //         x: this.props.labels[i]
            //     }]
            // });

            datasets.push({
                y: parseFloat(y_values[i]), 
                x: this.props.labels[i]
            });
        }
        console.log(datasets)
        this.setState({ datasets });
    }

    createGraph()
    {
        const ctx = this.canvas.getContext("2d");
        
        let { graph, datasets } = this.state;
        graph = new Chart(ctx, {
            type: 'bar',
            data: {
                // datasets: datasets
                datasets: [{
                    backgroundColor: [
                        'rgba(231, 76, 60, 0.2)',
                        'rgba(52, 152, 219, 0.2)'
                    ],
                    borderColor: [
                        'rgba(231, 76, 60, 1.0)',
                        'rgba(52, 152, 219, 1.0)'
                    ],
                    borderWidth: 2,
                    fill: true,
                    data: datasets,
                    legend: {
                        display: false
                    }
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                    // x: {
                    //     ticks: {
                    //         maxTicksLimit: 12,
                    //         callback: function(value, index, values) { 
                    //             return '';
                    //             // return data[index].x.split(' ')[0];
                    //         }
                    //     }
                    // }
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

export default BarGraph;