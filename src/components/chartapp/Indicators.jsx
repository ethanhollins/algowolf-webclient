class Indicators {
    /* Overlays */

    static calc = (ind, period, timestamps, asks, bids, get_value) =>
    {
        let cache_ts = ind.timestamps[period];
        let cache_asks = ind.asks[period];
        cache_asks.splice(0, period-1);
        let cache_bids = ind.bids[period];
        cache_bids.splice(0, period-1);

        // Calculate new values before
        let start = undefined;
        if (cache_ts.length > 0)
        {
            start = timestamps.filter((x) => x < cache_ts[0]).length;
            for (let i = start-1; i > 0; i--)
            {
                if (period !== undefined && i < period)
                {
                    cache_asks.unshift(null);
                    cache_bids.unshift(null);
                } 
                else if (asks[i].every((x) => x === 0))
                {
                    cache_ts.unshift(timestamps[i]);
                    cache_asks.unshift(null);
                    cache_bids.unshift(null);
                }
                else
                {
                    cache_ts.unshift(timestamps[i]);
                    cache_asks.unshift(get_value(i, asks));
                    cache_bids.unshift(get_value(i, bids));
                }
            }
        }

        // Re-calculate last value
        start = timestamps.indexOf(cache_ts[cache_ts.length-1]);
        if (start !== -1)
        {
            if (!(asks[start].every((x) => x === 0)))
            {
                cache_asks[start] = get_value(start, asks);
                cache_bids[start] = get_value(start, bids);
            }
        }

        // Calculate new values after

        if (cache_ts.length > 0)
            start = timestamps.length - timestamps.filter((x) => x > cache_ts[cache_ts.length-1]).length;
        else
            start = 0;

        for (let i = start; i < timestamps.length; i++) 
        {
            if (period !== undefined && i < period)
            {
                cache_asks.push(null);
                cache_bids.push(null);
            }
            else if (asks[i].every((x) => x === 0))
            {
                cache_ts.push(timestamps[i]);
                cache_asks.push(null);
                cache_bids.push(null);
            }
            else
            {
                cache_ts.push(timestamps[i]);
                cache_asks.push(get_value(i, asks));
                cache_bids.push(get_value(i, bids));
            }
        }
    }

    // Simple Moving Average
    static sma = (timestamps, asks, bids, properties) => 
    {
        const period = properties.periods[0];

        if (!(period in Indicators.sma.timestamps))
        {
            Indicators.sma.timestamps[period] = [];
            Indicators.sma.asks[period] = [];
            Indicators.sma.bids[period] = [];
        }

        function get_value(i, ohlc)
        {
            let ma = 0
            for (let j = 0; j < period; j++)
            {
                ma = ma + ohlc[i - j][3];
            }
            return Math.round((
                ma / period
            ) * 100000) / 100000;
        }

        Indicators.calc(Indicators.sma, period, timestamps, asks, bids, get_value);
    }

    /* Studies */

    // True Range
    static tr = (timestamps, asks, bids, properties) =>
    {
        for (let i = 0; i < properties.periods.length; i++)
        {
            const period = properties.periods[i];

            if (!(period in Indicators.tr.timestamps))
            {
                Indicators.tr.timestamps[period] = [];
                Indicators.tr.asks[period] = [];
                Indicators.tr.bids[period] = [];
            }
    
            function get_value(i, ohlc)
            {
                let ma = 0
                for (let j = 0; j < period; j++)
                {
                    ma = Math.abs(ohlc[i - j][0] - ohlc[i - j][3]);
                }
                return ma / period;
            }
            Indicators.calc(Indicators.tr, period, timestamps, asks, bids, get_value);
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
