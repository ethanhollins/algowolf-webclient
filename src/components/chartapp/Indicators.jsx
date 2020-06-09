class Indicators {
    // Overlays
    static sma = (ohlc, properties) => 
    {
        const period = properties[0];
        let result = [];
        for (let i = 0; i < ohlc.length; i++) 
        {
            if (i < period) result.push([null]);
            else 
            {
                let ma = 0
                for (let j = 0; j < period; j++)
                {
                    ma = ma + ohlc[i - j][3];
                }
                result.push([ma / period]);
            }
        }
        return result;
    }

    // Studies
    static tr = (ohlc, properties) =>
    {
        const fast_period = properties[0];
        const slow_period = properties[1];
        let result = [];

        let start = 0;
        let ma = 0
        if (slow_period !== 0) start = slow_period;
        else start = fast_period;

        for (let i = 0; i < ohlc.length; i++)
        {
            if (i < start)
            {
                if (slow_period !== 0) result.push([null, null]);
                else result.push([null]);
                continue;
            }

            ma = 0
            result.push([]);
            for (let j = 0; j < fast_period; j++) {
                ma = ma + (ohlc[i - j][3] - ohlc[i - j][0]);
            }
            result[result.length-1].push(ma / fast_period);
            
            if (slow_period !== undefined) 
            {
                ma = 0
                for (let j = 0; j < slow_period; j++) {
                    ma = ma + (ohlc[i - j][3] - ohlc[i - j][0]);
                }
                result[result.length - 1].push(ma / slow_period);
            }
        }
        return result
    }
}

export default Indicators;
