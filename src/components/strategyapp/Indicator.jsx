
class Indicator {
    /* Overlays */

    calc = (timestamps, asks, mids, bids) =>
    {
        this.cache_asks.splice(0, this.min_bars-1);
        this.cache_mids.splice(0, this.min_bars-1);
        this.cache_bids.splice(0, this.min_bars-1);

        // Calculate new values before
        let start = undefined;
        let ask, mid, bid = undefined;
        if (this.cache_ts.length > 0)
        {
            start = timestamps.filter((x) => x < this.cache_ts[0]).length;
            for (let i = start-1; i > 0; i--)
            {
                ask = this.get_value(i, asks, this.cache_asks);
                mid = this.get_value(i, mids, this.cache_mids);
                bid = this.get_value(i, bids, this.cache_bids);

                if (ask[0] !== null || asks[i].every((x) => x === null))
                {
                    this.cache_ts.unshift(timestamps[i]);
                }
                this.cache_asks.unshift(ask);
                this.cache_mids.unshift(mid);
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
                this.cache_mids[start] = this.get_value(start, mids, this.cache_mids);
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
            mid = this.get_value(i, mids, this.cache_mids);
            bid = this.get_value(i, bids, this.cache_bids);
            if (ask[0] !== null || asks[i].every((x) => x === null))
            {
                this.cache_ts.push(timestamps[i]);
            }
            this.cache_asks.push(ask);
            this.cache_mids.push(mid);
            this.cache_bids.push(bid);
        }
    }

    reset = () =>
    {
        this.cache_ts = [];
        this.cache_asks = [];
        this.cache_mids = [];
        this.cache_bids = [];
    }
}

/**
 *  Overlays
 */ 

// Bolinger Bands
class boll extends Indicator
{
    constructor(broker, product, chart_period, properties)
    {
        super();

        this.type = 'boll';
        this.broker = broker;
        this.product = product;
        this.chart_period = chart_period;
        this.properties = properties;
        this.period = properties.periods[0];
        this.min_bars = this.period;

        this.display_name = `BOLL\n${this.period}, ${this.properties.StdDev}`;

        this.cache_ts = [];
        this.cache_asks = [];
        this.cache_mids = [];
        this.cache_bids = [];
    }

    get_value(i, ohlc, values)
    {
        // Validation Check
        if (i < this.min_bars || ohlc[i].every((x) => x === null))
        {
            return [null, null]
        }

        const std_dev = this.properties.StdDev;

        // Calc mean
        let mean = 0;
        for (let j = 0; j < this.period; j++)
        {
            mean += ohlc[i-j][3];
        }
        mean /= this.period;

        // Calc Standard Deviation
        let d_sum = 0;
        for (let j = 0; j < this.period; j++)
        {
            d_sum += Math.pow(ohlc[i-j][3] - mean, 2);
        }
        let sd = Math.sqrt(d_sum/this.period);

        return [
            mean + sd * std_dev,
            mean - sd * std_dev
        ];
    }
}

// Dochian Bands
class donch extends Indicator
{
    constructor(broker, product, chart_period, properties)
    {
        super();

        this.type = 'donch';
        this.broker = broker;
        this.product = product;
        this.chart_period = chart_period;
        this.properties = properties;
        this.period = properties.periods[0];
        this.min_bars = this.period;

        this.display_name = `DONCH\n${this.period}`;

        this.cache_ts = [];
        this.cache_asks = [];
        this.cache_mids = [];
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

// Exponential Moving Average
class ema extends Indicator
{
    constructor(broker, product, chart_period, properties)
    {
        super();

        this.type = 'ema';
        this.broker = broker;
        this.product = product;
        this.chart_period = chart_period;
        this.properties = properties;
        this.period = properties.periods[0];
        this.min_bars = this.period;

        this.display_name = `EMA ${this.period}`;

        this.cache_ts = [];
        this.cache_asks = [];
        this.cache_mids = [];
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

// Moving Average Envelope
class mae extends Indicator
{
    constructor(broker, product, chart_period, properties)
    {
        super();

        this.type = 'mae';
        this.broker = broker;
        this.product = product;
        this.chart_period = chart_period;
        this.properties = properties;
        this.period = properties.periods[0];
        this.min_bars = this.period;

        this.display_name = `MAE\n${this.period}, ${this.properties.Percent}`;

        this.cache_ts = [];
        this.cache_asks = [];
        this.cache_mids = [];
        this.cache_bids = [];
    }

    get_value(i, ohlc, values)
    {
        // Validation Check
        if (i < this.min_bars || ohlc[i].every((x) => x === null))
            return [null, null, null]
    
        const percent = this.properties.Percent / 100;

        let ema;
        if (i > 0 && values[i-1][0] !== null)
        {
            const multi = 2 / (this.period + 1);
            const prev_ema = values[i-1][0];

            ema = (ohlc[i][3] - prev_ema) * multi + prev_ema;
        }
        else
        {
            let ma = 0
            for (let j = 0; j < this.period; j++)
            {
                ma = ma + ohlc[i - j][3];
            }
            ema = ma / this.period;
        }

        const off = ema * percent;
        return [
            ema, ema + off, ema - off
        ];
    }
}

// Simple Moving Average
class sma extends Indicator
{
    constructor(broker, product, chart_period, properties)
    {
        super();

        this.type = 'sma';
        this.broker = broker;
        this.product = product;
        this.chart_period = chart_period;
        this.properties = properties;
        this.period = properties.periods[0];
        this.min_bars = this.period;

        this.display_name = `SMA ${this.period}`;
        
        this.cache_ts = [];
        this.cache_asks = [];
        this.cache_mids = [];
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


/**
 *  Studies
 */ 

// Average True Range
class atr extends Indicator
{
    constructor(broker, product, chart_period, properties)
    {
        super();

        this.type = 'atr';
        this.broker = broker;
        this.product = product;
        this.chart_period = chart_period;
        this.properties = properties;
        this.period = properties.periods[0];
        this.min_bars = this.period;

        this.display_name = `ATR ${this.period}`;

        this.cache_ts = [];
        this.cache_asks = [];
        this.cache_mids = [];
        this.cache_bids = [];
    }

    get_value(i, ohlc, values)
    {
        // Validation Check
        if (i < this.min_bars || ohlc[i].every((x) => x === null))
            return [null]

        let atr;
        if (values[i-1][0] !== null)
        {
            const prev_close = ohlc[i-1][3];
            const high = ohlc[i][1];
            const low = ohlc[i][2];

            const prev_atr = values[i-1][0];

            let tr;
            if (prev_close > high)
            {
                tr = prev_close - low;
            }
            else if (prev_close < low)
            {
                tr = high - prev_close
            }
            else
            {
                tr = high - low
            }

            atr = (prev_atr * (this.period-1) + tr) / this.period;
        }
        else
        {
            let tr_sum = 0;
            for (let j = this.period-1; j >= 0; j--)
            {
                if (j === this.period-1)
                {
                    tr_sum += ohlc[i-j][1] - ohlc[i-j][2];
                }
                else
                {
                    const prev_close = ohlc[i-j-1][3];
                    const high = ohlc[i-j][1];
                    const low = ohlc[i-j][2];

                    if (prev_close > high)
                    {
                        tr_sum += prev_close - low;
                    }
                    else if (prev_close < low)
                    {
                        tr_sum += high - prev_close
                    }
                    else
                    {
                        tr_sum += high - low
                    }
                }
            }

            atr = tr_sum / this.period;
        }

        return [atr];
    }
}

// Modified Average True Range
class tr extends Indicator
{
    constructor(broker, product, chart_period, properties)
    {
        super();

        this.type = 'tr';
        this.broker = broker;
        this.product = product;
        this.chart_period = chart_period;
        this.properties = properties;
        this.period = properties.periods[0];
        this.min_bars = this.period+1;

        this.display_name = `ATR ${this.period}`;

        this.cache_ts = [];
        this.cache_asks = [];
        this.cache_mids = [];
        this.cache_bids = [];
    }

    get_value(i, ohlc, values)
    {
        // Validation Check
        if (i < this.min_bars || ohlc[i].every((x) => x === null))
            return [null]

        let tr_sum = 0;
        for (let j = 0; j < this.period; j++)
        {
            const prev_close = ohlc[i-j-1][3];
            const high = ohlc[i-j][1];
            const low = ohlc[i-j][2];

            if (prev_close > high)
            {
                tr_sum += prev_close - low;
            }
            else if (prev_close < low)
            {
                tr_sum += high - prev_close
            }
            else
            {
                tr_sum += high - low
            }
        }

        atr = tr_sum / this.period;

        return [atr];
    }
}


export default {
    boll, donch, ema, mae, sma, atr, tr
};
