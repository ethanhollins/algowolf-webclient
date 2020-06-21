import React from 'react';


class Drawings {
    // Paths

    static scale = (path, scale) =>
    {
        const num_val = '0123456789.';
        let num_buffer = [];
        let result = '';

        for (let i = 0; i < path.length; i++)
        {
            let c = path[i];
            if (num_val.includes(c))
            {
                num_buffer.push(c);
            }
            else
            {
                if (num_buffer.length > 0)
                {
                    result += String(Math.round(parseFloat(num_buffer.join('')) * scale));
                    num_buffer = [];
                }
                result += c;
            }
        }

        return result;
    }

    static get = (key, ref, name, properties) =>
    {
        return Drawings[name](key, ref, properties);
    }

    static create = (name, timestamps, properties) =>
    {
        return {
            type: name,
            timestamps: timestamps,
            properties: properties
        }
    }

    static arrow = (key, ref, properties) => 
    {
        // return (
        //     <svg 
        //         key={'drawing_'+key}
        //         ref={ref}

        //         style={DRAWING_STYLE} 
        //         xmlns="http://www.w3.org/2000/svg" 
        //         viewBox="0 0 256 512"
        //     >
        //         <path fill="currentColor" d="M88 166.059V468c0 6.627 5.373 12 12 12h56c6.627 0 12-5.373 12-12V166.059h46.059c21.382 0 32.09-25.851 16.971-40.971l-86.059-86.059c-9.373-9.373-24.569-9.373-33.941 0l-86.059 86.059c-15.119 15.119-4.411 40.971 16.971 40.971H88z">
        //         </path>
        //     </svg>
        // );
        
        return new Path2D("M256 504c137 0 248-111 248-248S393 8 256 8 8 119 8 256s111 248 248 248zm0-448c110.5 0 200 89.5 200 200s-89.5 200-200 200S56 366.5 56 256 145.5 56 256 56zm20 328h-40c-6.6 0-12-5.4-12-12V256h-67c-10.7 0-16-12.9-8.5-20.5l99-99c4.7-4.7 12.3-4.7 17 0l99 99c7.6 7.6 2.2 20.5-8.5 20.5h-67v116c0 6.6-5.4 12-12 12z");

        // svg.props.children.props.fill = properties.colors[0];
        // svg.props.children.props.fill = properties.colors[0];
        // svg.style.width = Math.round(svg.props.viewBox.split(' ')[2] / properties.scale) + "px"
        // svg.style.height = Math.round(svg.props.viewBox.split(' ')[3] / properties.scale) + "px"

        // console.log(svg.props.children.props);
        // console.log(properties);

    }
}

const DRAWING_STYLE = {
    position: "relative",
    left: "0px",
    top: "-686px",
}

export default Drawings;
