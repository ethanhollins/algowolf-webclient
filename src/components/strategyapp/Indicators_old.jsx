class Indicators {
    /* Overlays */

    static calc = (ind, product, period, min_bars, timestamps, asks, bids, get_value) =>
    {
        let cache_ts = ind.timestamps[product][period];
        let cache_asks = ind.asks[product][period];
        cache_asks.splice(0, min_bars-1);
        let cache_bids = ind.bids[product][period];
        cache_bids.splice(0, min_bars-1);

        // Calculate new values before
        let start = undefined;
        let ask, bid = undefined;
        if (cache_ts.length > 0)
        {
            start = timestamps.filter((x) => x < cache_ts[0]).length;
            for (let i = start-1; i > 0; i--)
            {
                ask = get_value(i, asks, cache_asks);
                bid = get_value(i, bids, cache_bids);

                if (ask[0] !== null || asks[i].every((x) => x === null))
                {
                    cache_ts.unshift(timestamps[i]);
                }
                cache_asks.unshift(ask);
                cache_bids.unshift(bid);
            }
        }

        // Re-calculate last value
        start = timestamps.indexOf(cache_ts[cache_ts.length-1]);
        if (start !== -1)
        {
            if (!(asks[start].every((x) => x === null)) || asks[start][0] !== null)
            {
                cache_asks[start] = get_value(start, asks, cache_asks);
                cache_bids[start] = get_value(start, bids, cache_bids);
            }
        }

        // Calculate new values after

        if (cache_ts.length > 0)
            start = timestamps.length - timestamps.filter((x) => x > cache_ts[cache_ts.length-1]).length;
        else
            start = 0;

        for (let i = start; i < timestamps.length; i++) 
        {
            ask = get_value(i, asks, cache_asks);
            bid = get_value(i, bids, cache_bids);
            if (ask[0] !== null || asks[i].every((x) => x === null))
            {
                cache_ts.push(timestamps[i]);
            }
            cache_asks.push(ask);
            cache_bids.push(bid);
        }

    }

    static setIndicator = (ind, product, period) =>
    {
        if (!(product in ind.timestamps))
        {
            ind.timestamps[product] = {};
            ind.asks[product] = {};
            ind.bids[product] = {};
        }

        if (!(period in ind.timestamps[product]))
        {
            ind.timestamps[product][period] = [];
            ind.asks[product][period] = [];
            ind.bids[product][period] = [];
        }
    }

    // Simple Moving Average
    static sma = (product, timestamps, asks, bids, properties) => 
    {
        const period = properties.periods[0];
        const min_bars = period;

        Indicators.setIndicator(Indicators.sma, product, period);

        function get_value(i, ohlc, values)
        {
            // Validation Check
            if (i < min_bars || ohlc[i].every((x) => x === null))
                return [null]
                
            let ma = 0
            for (let j = 0; j < period; j++)
            {
                ma = ma + ohlc[i - j][3];
            }
            return [Math.round((
                ma / period
            ) * 100000) / 100000];
        }

        Indicators.calc(Indicators.sma, product, period, min_bars, timestamps, asks, bids, get_value);
    }

    // Exponential Moving Average
    static ema = (product, timestamps, asks, bids, properties) => 
    {
        const period = properties.periods[0];
        const min_bars = period;

        Indicators.setIndicator(Indicators.ema, product, period);

        function get_value(i, ohlc, values)
        {
            // Validation Check
            if (i < min_bars || ohlc[i].every((x) => x === null))
                return [null]
            
            if (i > 0 && values[i-1][0] !== null)
            {
                const multi = 2 / (period + 1);
                const prev_ema = values[i-1][0];
                return [Math.round((
                    (ohlc[i][3] - prev_ema) * multi + prev_ema
                ) * 100000) / 100000];
            }
            else
            {
                let ma = 0
                for (let j = 0; j < period; j++)
                {
                    ma = ma + ohlc[i - j][3];
                }
                return [Math.round((
                    ma / period
                ) * 100000) / 100000];
            }
        }

        Indicators.calc(Indicators.ema, product, period, min_bars, timestamps, asks, bids, get_value);
    }

    // Donchian Channel
    static donch = (product, timestamps, asks, bids, properties) => 
    {
        const period = properties.periods[0];
        const min_bars = period+1;

        Indicators.setIndicator(Indicators.donch, product, period);

        function get_value(i, ohlc, values)
        {
            // Validation Check
            if (i < min_bars || ohlc[i].every((x) => x === null))
            {
                return [null, null]
            }

            let high_low = [0,0]
            for (let j = 0; j < period; j++)
            {
                if (high_low[0] === 0 || ohlc[i-j-1][1] > high_low[0])
                    high_low[0] = ohlc[i-j-1][1]
                if (high_low[1] === 0 || ohlc[i-j-1][2] < high_low[1])
                    high_low[1] = ohlc[i-j-1][2]
            }
            return high_low;
        }

        Indicators.calc(Indicators.donch, product, period, min_bars, timestamps, asks, bids, get_value);
    }

    /* Studies */

    // True Range
    static tr = (product, timestamps, asks, bids, properties) =>
    {
        for (let i = 0; i < properties.periods.length; i++)
        {
            const period = properties.periods[i];
            const min_bars = period;

            Indicators.setIndicator(Indicators.tr, product, period);
    
            function get_value(i, ohlc, values)
            {
                // Validation Check
                if (i < min_bars || ohlc[i].every((x) => x === null))
                    return [null]

                let ma = 0
                for (let j = 0; j < period; j++)
                {
                    ma = Math.abs(ohlc[i - j][0] - ohlc[i - j][3]);
                }
                return [ma / period];
            }
            Indicators.calc(Indicators.tr, product, period, min_bars, timestamps, asks, bids, get_value);
        }
    }
    
}

/* Init cache arrays */
for (let i in Indicators)
{
    Indicators[i].timestamps = {};
    Indicators[i].bids = {};
    Indicators[i].asks = {};
}

export default Indicators;
