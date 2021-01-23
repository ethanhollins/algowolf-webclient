import React from 'react'
import reactCSS from 'reactcss'
import { TwitterPicker } from 'react-color'

class ColorSwatch extends React.Component {

    constructor(props)
    {
        super(props);

        const hex = props.getProperty(props.category, props.sub, props.name);

        let color = undefined;
        if (hex === undefined)
        {
            color = {
                r: '80',
                g: '80',
                b: '80'
            }
        }
        else
        {
            color = this.hexToRgb(hex);
        }
        color.a = '1';

        this.state = {
            displayColorPicker: false,
            color: color,
            hovered: false
        };

        this.onMouseUp = this.onMouseUp.bind(this);
    }

    componentDidMount()
    {
        window.addEventListener("mouseup", this.onMouseUp);
    }

    componentWillUnmount()
    {
        window.removeEventListener("mouseup", this.onMouseUp);
    }

    onMouseUp(e)
    {
        const { hovered } = this.state;
        if (!hovered) this.handleClose();
    }

    handleClick = () => 
    {
        this.setState({ displayColorPicker: !this.state.displayColorPicker })
    };

    handleClose = () => 
    {
        this.setState({ displayColorPicker: false })
    };

    componentToHex(c) 
    {
        var hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }

    rgbToHex(color)
    {
        return (
            "#" + this.componentToHex(parseInt(color.r)) + 
            this.componentToHex(parseInt(color.g)) + 
            this.componentToHex(parseInt(color.b))
        );
    }

    hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      }

    handleChange = (color) => {
        this.setState({ color: color.rgb })
        this.props.setProperty(this.props.category, this.props.sub, this.props.name, this.rgbToHex(color.rgb));
    };

    isWhiteSelected()
    {
        const color = this.state.color;
        return color.r === 255 && color.g === 255 && color.b === 255;
    }

    render() {

        const styles = reactCSS({
            'default': {
                color: {
                    width: '25px',
                    height: '25px',
                    borderRadius: '3px',
                    background: `rgba(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b }, ${ this.state.color.a })`,
                    boxSizing: 'border-box',
                },
                swatch: {
                    padding: '5px',
                    background: '#fff',
                    borderRadius: '3px',
                    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                    display: 'inline-block',
                    cursor: 'pointer',
                },
                popover: {
                    position: 'absolute',
                    zIndex: '2',
                },
                cover: {
                    position: 'fixed',
                    top: '0px',
                    right: '0px',
                    bottom: '0px',
                    left: '0px',
                },
                coverParent: {
                    width: '100%',
                    height: '100%',
                }
            },
        });

        if (this.isWhiteSelected())
        {
            styles.color.border = '1px solid rgb(220,220,220)';
        }
        else
        {
            styles.color.border = '';
        }

        return (
            <div className='popup right-item'>
                <div style={ styles.swatch } onClick={ this.handleClick }>
                    <div style={ styles.color } />
                </div>
                { this.state.displayColorPicker ? <div 
                    ref={this.setBodyRef} style={ styles.popover }
                    onMouseEnter={this.setHoverOn} onMouseLeave={this.setHoverOff}
                >
                    <TwitterPicker 
                        color={ this.state.color } 
                        colors={COLORS} 
                        onChange={ this.handleChange } 
                        width={'312px'}
                    />
                </div> : null }

            </div>
        )
    }

    setHoverOn = (e) =>
    {
        this.setState({ hovered: true });
        this.props.setHoverOn(1);
    }

    setHoverOff = (e) =>
    {
        this.setState({ hovered: false });
        this.props.setHoverOff(1);
    }
}

const COLORS = [
    '#ffe3e3', '#ffe7cf', '#fffdcf', '#cfffdf', '#9ed8cd', '#cffff9', '#d5cfff', '#F0F0F0',
    '#ffb8b8', '#ffd2a6', '#fffaa6', '#a6ffc4', '#7fccbe', '#a6fff4', '#aca6ff', '#d3d3d3',
    '#ff9292', '#ffbe7d', '#fff87d', '#7dffa8', '#63c1af', '#7dffef', '#867dff', '#aaaaaa',
    '#ff7d7d', '#ffaa55', '#fff655', '#55ff89', '#43af9a', '#55ffee', '#6155ff', '#828282',
    '#ff5050', '#ff9327', '#fff645', '#2cff6d', '#16a085', '#2cffea', '#3b2cff', '#595959',
    '#db1d1d', '#ea6a00', '#f2d500', '#00ea37', '#007760', '#00e5c4', '#0000c4', '#303030',
    '#FFF', '#000'
]

export default ColorSwatch;