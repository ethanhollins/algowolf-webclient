
class Indicator {
    /* Overlays */
    calc = (timestamps, mids) =>
    {
        // this.cache_asks.splice(0, this.min_bars-1);
        this.cache_mids.splice(0, this.min_bars-1);
        // this.cache_bids.splice(0, this.min_bars-1);

        // Calculate new values before
        let start = undefined;
        let ask, mid, bid = undefined;
        if (this.cache_ts.length > 0)
        {
            start = timestamps.filter((x) => x < this.cache_ts[0]).length;
            for (let i = start-1; i > 0; i--)
            {
                // ask = this.get_value(i, asks, this.cache_asks);
                mid = this.get_value(i, mids, this.cache_mids);
                // bid = this.get_value(i, bids, this.cache_bids);

                if (mid[0] !== null || mids[i].every((x) => x === null))
                {
                    this.cache_ts.unshift(timestamps[i]);
                }
                // this.cache_asks.unshift(ask);
                this.cache_mids.unshift(mid);
                // this.cache_bids.unshift(bid);
            }
        }

        // Re-calculate last value
        start = timestamps.lastIndexOf(this.cache_ts[this.cache_ts.length-1]);
        while (start > 0)
        {
            if (!(mids[start].every((x) => x === null)) || mids[start][0] !== null)
            {
                // this.cache_asks[start] = this.get_value(start, asks, this.cache_asks);
                this.cache_mids[start] = this.get_value(start, mids, this.cache_mids);
                // this.cache_bids[start] = this.get_value(start, bids, this.cache_bids);
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
            // ask = this.get_value(i, asks, this.cache_asks);
            mid = this.get_value(i, mids, this.cache_mids);
            // bid = this.get_value(i, bids, this.cache_bids);
            if (mid[0] !== null || mids[i].every((x) => x === null))
            {
                this.cache_ts.push(timestamps[i]);
            }
            // this.cache_asks.push(ask);
            this.cache_mids.push(mid);
            // this.cache_bids.push(bid);
        }
    }

    reset = () =>
    {
        this.cache_ts = [];
        // this.cache_asks = [];
        this.cache_mids = [];
        // this.cache_bids = [];
    }

    setProperties = (broker, product, chart_period, properties, appearance) =>
    {
        this.broker = broker;
        this.product = product;
        this.chart_period = chart_period;
        this.properties = properties;
        this.appearance = appearance;
        this.period = properties.Period.value;
        this.min_bars = this.period;
    }
}

/**
 *  Overlays
 */ 

// Bolinger Bands
class boll extends Indicator
{
    constructor(broker, product, chart_period, properties, appearance)
    {
        super();

        this.type = 'boll';
        this.broker = broker;
        this.product = product;
        this.chart_period = chart_period;
        this.properties = properties;
        this.appearance = appearance;
        this.period = properties.Period.value;
        this.min_bars = this.period;
        this.precision = 5;

        this.display_name = `BOLL\n${this.period}, ${this.properties.StdDev}`;

        this.cache_ts = [];
        // this.cache_asks = [];
        this.cache_mids = [];
        // this.cache_bids = [];
    }

    get_value(i, ohlc, values)
    {
        // Validation Check
        if (i < this.min_bars || ohlc[i].every((x) => x === null))
        {
            return [null, null]
        }

        const std_dev = this.properties.StdDev.value;

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
    constructor(broker, product, chart_period, properties, appearance)
    {
        super();

        this.type = 'donch';
        this.broker = broker;
        this.product = product;
        this.chart_period = chart_period;
        this.properties = properties;
        this.appearance = appearance;
        this.period = properties.Period.value;
        this.min_bars = this.period;
        this.precision = 5;

        this.display_name = `DONCH\n${this.period}`;

        this.cache_ts = [];
        // this.cache_asks = [];
        this.cache_mids = [];
        // this.cache_bids = [];
    }

    get_value(i, ohlc, values)
    {
        // Validation Check
        if (i < this.min_bars || ohlc[i].every((x) => x === null))
        {
            return [null, null, null]
        }

        let result = [0,0,0]
        for (let j = 0; j < this.period; j++)
        {
            if (result[1] === 0 || ohlc[i-j-1][1] > result[1])
                result[1] = ohlc[i-j-1][1]
            if (result[2] === 0 || ohlc[i-j-1][2] < result[2])
                result[2] = ohlc[i-j-1][2]
            result[0] = (result[1] + result[2]) / 2
        }
        return result;
    }
}

// Exponential Moving Average
class ema extends Indicator
{
    constructor(broker, product, chart_period, properties, appearance)
    {
        super();

        this.type = 'ema';
        this.broker = broker;
        this.product = product;
        this.chart_period = chart_period;
        this.properties = properties;
        this.appearance = appearance;
        this.period = properties.Period.value;
        this.min_bars = this.period;
        this.precision = 5;

        this.display_name = `EMA ${this.period}`;

        this.cache_ts = [];
        // this.cache_asks = [];
        this.cache_mids = [];
        // this.cache_bids = [];
    }

    get_value(i, ohlc, values)
    {
        // Validation Check
        if (i < this.min_bars || ohlc[i].every((x) => x === null))
            return [null]
    
        if (i > this.period && values[i-1])
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
    constructor(broker, product, chart_period, properties, appearance)
    {
        super();

        this.type = 'mae';
        this.broker = broker;
        this.product = product;
        this.chart_period = chart_period;
        this.properties = properties;
        this.appearance = appearance;
        this.period = properties.Period.value;
        this.min_bars = this.period;
        this.precision = 5;

        this.display_name = `MAE\n${this.period}, ${this.properties.Percent}`;

        this.cache_ts = [];
        // this.cache_asks = [];
        this.cache_mids = [];
        // this.cache_bids = [];
    }

    get_value(i, ohlc, values)
    {
        // Validation Check
        if (i < this.min_bars || ohlc[i].every((x) => x === null))
            return [null, null, null]
    
        const percent = this.properties.Percent / 100;

        let ema;
        if (i > 0 && values[i-1])
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
    constructor(broker, product, chart_period, properties, appearance)
    {
        super();

        this.type = 'sma';
        this.broker = broker;
        this.product = product;
        this.chart_period = chart_period;
        this.properties = properties;
        this.appearance = appearance;
        this.period = properties.Period.value;
        this.min_bars = this.period;
        this.precision = 5;

        this.display_name = `SMA ${this.period}`;
        
        this.cache_ts = [];
        // this.cache_asks = [];
        this.cache_mids = [];
        // this.cache_bids = [];
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
    constructor(broker, product, chart_period, properties, appearance)
    {
        super();

        this.type = 'atr';
        this.broker = broker;
        this.product = product;
        this.chart_period = chart_period;
        this.properties = properties;
        this.appearance = appearance;
        this.period = properties.Period.value;
        this.min_bars = this.period;
        this.precision = 5;

        this.display_name = `ATR ${this.period}`;

        this.cache_ts = [];
        // this.cache_asks = [];
        this.cache_mids = [];
        // this.cache_bids = [];
    }

    get_value(i, ohlc, values)
    {
        // Validation Check
        if (i < this.min_bars || ohlc[i].every((x) => x === null))
            return [null]

        let atr;
        if (i > this.period && values[i-1])
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
    constructor(broker, product, chart_period, properties, appearance)
    {
        super();

        this.type = 'tr';
        this.broker = broker;
        this.product = product;
        this.chart_period = chart_period;
        this.properties = properties;
        this.appearance = appearance;
        this.period = properties.Period.value;
        this.min_bars = this.period+1;
        this.precision = 6;

        this.display_name = `ATR ${this.period}`;

        this.cache_ts = [];
        // this.cache_asks = [];
        this.cache_mids = [];
        // this.cache_bids = [];
    }

    get_value(i, ohlc, values)
    {
        // Validation Check
        if (i < this.min_bars || ohlc[i].every((x) => x === null))
            return [null]

        let atr = 0;
        if (values[i-1])
        {
            const prev_close = ohlc[i-1][3];
            const high = ohlc[i][1];
            const low = ohlc[i][2];

            let tr = 0;
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

            const prev = values[i-1][0];
            const alpha = 1 / this.period;
            atr = alpha * tr + (1 - alpha) * prev;
        }
        else
        {
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
        }

        return [atr];
    }
}


// Relative Strength Index
class rsi extends Indicator
{
    constructor(broker, product, chart_period, properties, appearance)
    {
        super();

        this.type = 'rsi';
        this.broker = broker;
        this.product = product;
        this.chart_period = chart_period;
        this.properties = properties;
        this.appearance = appearance;
        this.period = properties.Period.value;
        this.min_bars = this.period;
        this.precision = 5;

        this.display_name = `RSI ${this.period}`;

        this.cache_ts = [];
        // this.cache_asks = [];
        this.cache_mids = [];
        // this.cache_bids = [];
        this.cache_rsi = [];
    }

    get_value(i, ohlc, values)
    {
        // Validation Check
        if (i < this.min_bars)
        {
            this.cache_rsi.push([null, null]);
            return [null];
        }
        else if (ohlc[i].every((x) => x === null))
        {
            this.cache_rsi.push(this.cache_rsi[i-1]);
            return [null];
        }

        let prev_gain;
        let prev_loss;

        prev_gain = this.cache_rsi[i-1][0];
        prev_loss = this.cache_rsi[i-1][1];

        let gain_sum = 0;
        let loss_sum = 0;
        let chng;
        let gain_avg;
        let loss_avg;
        if (prev_gain)
        {
            chng = ohlc[i][3] - ohlc[i-1][3];
            if (chng >= 0)
            {
                gain_sum += chng;
            }
            else
            {
                loss_sum += Math.abs(chng);
            }

            gain_avg = (prev_gain * (this.period-1) + gain_sum)/this.period;
            loss_avg = (prev_loss * (this.period-1) + loss_sum)/this.period;
        }
        else
        {
            for (let x = i+1-this.period; x < i+1; x++)
            {
                chng = ohlc[x][3] - ohlc[x-1][3];

                if (chng >= 0)
                {
                    gain_sum += chng;
                }
                else
                {
                    loss_sum += Math.abs(chng)
                }
            }
            
            gain_avg = gain_sum / this.period;
            loss_avg = loss_sum / this.period;
        }

        if (i > this.cache_rsi.length-1)
        {
            this.cache_rsi.push([gain_avg, loss_avg]);
        }
        else
        {
            this.cache_rsi[i] = [gain_avg, loss_avg];
        }

        if (loss_avg == 0.0)
        {
            return [100.0]
        }
        else
        {
            return [100.0 - (100.0 / (1.0 + gain_avg/loss_avg))];
        }
    }

    reset = () =>
    {
        this.cache_ts = [];
        // this.cache_asks = [];
        this.cache_mids = [];
        // this.cache_bids = [];
        this.cache_rsi = [];
    }
}

// Relative Strength Index
class macd extends Indicator
{
    constructor(broker, product, chart_period, properties, appearance)
    {
        console.log('????');
        console.log(appearance);
        console.log(properties);

        super();

        this.type = 'macd';
        this.broker = broker;
        this.product = product;
        this.chart_period = chart_period;
        this.properties = properties;
        this.appearance = appearance;
        // this.period = properties.Period.value;
        this.fast_period = properties['Fast Period'].value;
        this.slow_period = properties['Slow Period'].value;
        this.signal_period = properties['Signal Period'].value;
        this.min_bars = this.slow_period+1;
        this.precision = 5;

        this.display_name = `MACD ${this.fast_period}, ${this.slow_period}, ${this.signal_period}`;

        this.cache_ts = [];
        // this.cache_asks = [];
        this.cache_mids = [];
        // this.cache_bids = [];
        this.cache_macd = [];
    }

    get_value(i, ohlc, values)
    {
        // Validation Check
        if (i < this.min_bars)
        {
            this.cache_macd.push([null, null, null]);
            return [null, null, null];
        }
        else if (ohlc[i].every((x) => x === null))
        {
            this.cache_macd.push(this.cache_macd[i-1]);
            return [null, null, null];
        }

        let fast_ema;
        let slow_ema;
        let signal_ema;
        const prev_fast_ema = this.cache_macd[i-1][0];
        const prev_slow_ema = this.cache_macd[i-1][1];
        const prev_signal_ema = this.cache_macd[i-1][2];
        // Fast EMA
        if (prev_fast_ema)
        {
            const multi = 2 / (this.fast_period + 1);
            fast_ema = (ohlc[i][3] - prev_fast_ema) * multi + prev_fast_ema;
        }
        else
        {
            let ma = 0
            for (let j = i+1-this.fast_period; j < i+1; j++)
            {
                ma = ma + ohlc[i - j][3];
            }
            fast_ema = ma / this.fast_period;
        }

        // Slow EMA
        if (prev_slow_ema)
        {
            const multi = 2 / (this.slow_period + 1);
            slow_ema = (ohlc[i][3] - prev_slow_ema) * multi + prev_slow_ema;
        }
        else
        {
            let ma = 0
            for (let j = i+1-this.slow_period; j < i+1; j++)
            {
                ma = ma + ohlc[i - j][3];
            }
            slow_ema = ma / this.slow_period;
        }

        const macd_val = fast_ema - slow_ema;

        // Signal EMA
        if (prev_signal_ema)
        {
            const multi = 2 / (this.signal_period + 1);
            signal_ema = (macd_val - prev_signal_ema) * multi + prev_signal_ema;
        }
        else
        {
            signal_ema = macd_val / this.signal_period;
        }

        if (i > this.cache_macd.length-1)
        {
            this.cache_macd.push([fast_ema, slow_ema, signal_ema]);
        }
        else
        {
            this.cache_macd[i] = [fast_ema, slow_ema, signal_ema];
        }

        const hist = macd_val - signal_ema;

        return [macd_val, signal_ema, hist];
    }

    reset = () =>
    {
        this.cache_ts = [];
        // this.cache_asks = [];
        this.cache_mids = [];
        // this.cache_bids = [];
        this.cache_macd = [];
    }

    setProperties = (broker, product, chart_period, properties, appearance) =>
    {
        this.broker = broker;
        this.product = product;
        this.chart_period = chart_period;
        this.properties = properties;
        this.appearance = appearance;
        // this.period = properties.Period.value;
        this.fast_period = properties['Fast Period'].value;
        this.slow_period = properties['Slow Period'].value;
        this.signal_period = properties['Signal Period'].value;
        this.min_bars = this.slow_period;
    }
}

export default {
    boll, donch, ema, mae, sma, atr, tr, rsi, macd
};
