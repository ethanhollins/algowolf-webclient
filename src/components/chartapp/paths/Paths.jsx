/* Drawing Paths */
import arrowAltCircleUpRegularPath from './arrow-alt-circle-up-regular.json';
import caretSquareUpSolidPath from './caret-square-up-solid.json';

class Drawings 
{

    static get = (type) =>
    {
        return Drawings[type]();
    }

    static create = (type, timestamps, prices, properties) =>
    {
        return {
            type: type,
            timestamps: timestamps,
            prices: prices,
            properties: properties
        }
    }

    /* Paths */

    static arrowAltCircleUpRegular = () => 
    {
        return arrowAltCircleUpRegularPath;
    }

    static caretSquareUpSolid = () =>
    {
        return caretSquareUpSolidPath;
    }
}

export default Drawings;
