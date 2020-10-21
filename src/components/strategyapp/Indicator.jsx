
class Indicator {
    /* Overlays */

    calc = (timestamps, asks, bids) =>
    {
        this.cache_asks.splice(0, this.min_bars-1);
        this.cache_bids.splice(0, this.min_bars-1);

        // Calculate new values before
        let start = undefined;
        let ask, bid = undefined;
        if (this.cache_ts.length > 0)
        {
            start = timestamps.filter((x) => x < this.cache_ts[0]).length;
            for (let i = start-1; i > 0; i--)
            {
                ask = this.get_value(i, asks, this.cache_asks);
                bid = this.get_value(i, bids, this.cache_bids);

                if (ask[0] !== null || asks[i].every((x) => x === null))
                {
                    this.cache_ts.unshift(timestamps[i]);
                }
                this.cache_asks.unshift(ask);
                this.cache_bids.unshift(bid);
            }
        }

        // Re-calculate last value
        start = timestamps.lastIndexOf(this.cache_ts[this.cache_ts.length-1]);
        while (start > 0)
        {
            if (!(asks[start].every((x) => x === null)) || asks[start][0] !== null)
            {
                this.cache_asks[start] = this.get_value(start, asks, this.cache_asks);
                this.cache_bids[start] = this.get_value(start, bids, this.cache_bids);
                break;
            }
            else
            {
                start -= 1;
            }
        }

        // Calculate new values after

        if (this.cache_ts.length > 0)
            start = timestamps.length - timestamps.filter((x) => x > this.cache_ts[this.cache_ts.length-1]).length;
        else
            start = 0;

        for (let i = start; i < timestamps.length; i++) 
        {
            ask = this.get_value(i, asks, this.cache_asks);
            bid = this.get_value(i, bids, this.cache_bids);
            if (ask[0] !== null || asks[i].every((x) => x === null))
            {
                this.cache_ts.push(timestamps[i]);
            }
            this.cache_asks.push(ask);
            this.cache_bids.push(bid);
        }
    }

    reset = () =>
    {
        this.cache_ts = [];
        this.cache_asks = [];
        this.cache_bids = [];
    }
}

class sma extends Indicator
{
    constructor(broker, product, properties)
    {
        super();

        this.type = 'sma';
        this.broker = broker;
        this.product = product;
        this.properties = properties;
        this.period = properties.periods[0];
        this.min_bars = this.period;

        this.cache_ts = [];
        this.cache_asks = [];
        this.cache_bids = [];
    }

    get_value(i, ohlc, values)
    {
        // Validation Check
        if (i < this.min_bars || ohlc[i].every((x) => x === null))
            return [null]
            
        let ma = 0
        for (let j = 0; j < this.period; j++)
        {
            ma = ma + ohlc[i - j][3];
        }
        return [Math.round((
            ma / this.period
        ) * 100000) / 100000];
    }
}

class ema extends Indicator
{
    constructor(broker, product, properties)
    {
        super();

        this.type = 'ema';
        this.broker = broker;
        this.product = product;
        this.properties = properties;
        this.period = properties.periods[0];
        this.min_bars = this.period;

        this.cache_ts = [];
        this.cache_asks = [];
        this.cache_bids = [];
    }

    get_value(i, ohlc, values)
    {
        // Validation Check
        if (i < this.min_bars || ohlc[i].every((x) => x === null))
            return [null]
    
        if (i > 0 && values[i-1][0] !== null)
        {
            const multi = 2 / (this.period + 1);
            const prev_ema = values[i-1][0];
            return [
                (ohlc[i][3] - prev_ema) * multi + prev_ema
            ];
        }
        else
        {
            let ma = 0
            for (let j = 0; j < this.period; j++)
            {
                ma = ma + ohlc[i - j][3];
            }
            return [
                ma / this.period
            ];
        }
    }
}

class donch extends Indicator
{
    constructor(broker, product, properties)
    {
        super();

        this.type = 'donch';
        this.broker = broker;
        this.product = product;
        this.properties = properties;
        this.period = properties.periods[0];
        this.min_bars = this.period;

        this.cache_ts = [];
        this.cache_asks = [];
        this.cache_bids = [];
    }

    get_value(i, ohlc, values)
    {
        // Validation Check
        if (i < this.min_bars || ohlc[i].every((x) => x === null))
        {
            return [null, null]
        }

        let high_low = [0,0]
        for (let j = 0; j < this.period; j++)
        {
            if (high_low[0] === 0 || ohlc[i-j-1][1] > high_low[0])
                high_low[0] = ohlc[i-j-1][1]
            if (high_low[1] === 0 || ohlc[i-j-1][2] < high_low[1])
                high_low[1] = ohlc[i-j-1][2]
        }
        return high_low;
    }
}


export default {
    sma, ema, donch
};
