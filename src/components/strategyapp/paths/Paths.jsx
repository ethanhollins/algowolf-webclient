/* Drawing Paths */
import circleSolid from './circle-solid.json';
import squareSolid from './square-solid.json';
import triangleSolid from './triangle-solid.json';
import starSolid from './star-solid.json';
import arrowAltCircleUpPath from './arrow-alt-circle-up.json';
import arrowAltCircleUpSolid from './arrow-alt-circle-up-solid.json';
import caretSquareUpSolidPath from './caret-square-up-solid.json';
import timesCircle from './times-circle.json';
import caretUpSolid from './caret-up-solid.json';
import diamondSolid from './diamond-solid.json';
import heartSolid from './heart-solid.json';
import clubSolid from './club-solid.json';
import spadeSolid from './spade-solid.json';

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

    static circle = () =>
    {
        return circleSolid;
    }

    static square = () =>
    {
        return squareSolid;
    }

    static triangle = () =>
    {
        return triangleSolid;
    }

    static star = () =>
    {
        return starSolid;
    }

    static arrowAltCircleUpRegular = () => 
    {
        return arrowAltCircleUpPath;
    }

    static arrowAltCircleUpSolid = () =>
    {
        return arrowAltCircleUpSolid;
    }

    static caretSquareUpSolid = () =>
    {
        return caretSquareUpSolidPath;
    }

    static crossCircle = () =>
    {
        return timesCircle;
    }

    static caretUp = () =>
    {
        return caretUpSolid;
    }

    static diamond = () =>
    {
        return diamondSolid;
    }

    static heart = () =>
    {
        return heartSolid;
    }

    static club = () =>
    {
        return clubSolid;
    }

    static spade = () =>
    {
        return spadeSolid;
    }
}

export default Drawings;
