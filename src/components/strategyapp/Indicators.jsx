class Indicators {
    /* Overlays */

    static calc = (ind, period, min_bars, timestamps, asks, bids, get_value) =>
    {
        let cache_ts = ind.timestamps[period];
        let cache_asks = ind.asks[period];
        cache_asks.splice(0, min_bars-1);
        let cache_bids = ind.bids[period];
        cache_bids.splice(0, min_bars-1);

        // Calculate new values before
        let start = undefined;
        let ask, bid = undefined;
        if (cache_ts.length > 0)
        {
            start = timestamps.filter((x) => x < cache_ts[0]).length;
            for (let i = start-1; i > 0; i--)
            {
                ask = get_value(i, asks);
                bid = get_value(i, bids);

                if (ask[0] !== null || asks[i].every((x) => x === 0))
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
            ask = get_value(i, asks);
            bid = get_value(i, bids);
            if (ask[0] !== null || asks[i].every((x) => x === 0))
            {
                cache_ts.push(timestamps[i]);
            }
            cache_asks.push(ask);
            cache_bids.push(bid);
        }
    }

    // Simple Moving Average
    static sma = (timestamps, asks, bids, properties) => 
    {
        const period = properties.periods[0];
        const min_bars = period;

        if (!(period in Indicators.sma.timestamps))
        {
            Indicators.sma.timestamps[period] = [];
            Indicators.sma.asks[period] = [];
            Indicators.sma.bids[period] = [];
        }

        function get_value(i, ohlc)
        {
            // Validation Check
            if (i < min_bars || ohlc[i].every((x) => x === 0))
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

        Indicators.calc(Indicators.sma, period, min_bars, timestamps, asks, bids, get_value);
    }

    // Donchian Channel
    static donch = (timestamps, asks, bids, properties) => 
    {
        const period = properties.periods[0];
        const min_bars = period+1;

        if (!(period in Indicators.donch.timestamps))
        {
            Indicators.donch.timestamps[period] = [];
            Indicators.donch.asks[period] = [];
            Indicators.donch.bids[period] = [];
        }

        function get_value(i, ohlc)
        {
            // Validation Check
            if (i < min_bars || ohlc[i].every((x) => x === 0))
                return [null, null]

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

        Indicators.calc(Indicators.donch, period, min_bars, timestamps, asks, bids, get_value);
    }

    /* Studies */

    // True Range
    static tr = (timestamps, asks, bids, properties) =>
    {
        for (let i = 0; i < properties.periods.length; i++)
        {
            const period = properties.periods[i];
            const min_bars = period;

            if (!(period in Indicators.tr.timestamps))
            {
                Indicators.tr.timestamps[period] = [];
                Indicators.tr.asks[period] = [];
                Indicators.tr.bids[period] = [];
            }
    
            function get_value(i, ohlc)
            {
                // Validation Check
                if (i < min_bars || ohlc[i].every((x) => x === 0))
                    return [null]

                let ma = 0
                for (let j = 0; j < period; j++)
                {
                    ma = Math.abs(ohlc[i - j][0] - ohlc[i - j][3]);
                }
                return [ma / period];
            }
            Indicators.calc(Indicators.tr, period, min_bars, timestamps, asks, bids, get_value);
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
