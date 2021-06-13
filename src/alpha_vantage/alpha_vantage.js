const { TimeSeries, StockDataPoint, FinancialApi, RSIDataPoint} = require("../objects");
const { get } = require("../https");

const STOCK_FUNCTION = "TIME_SERIES_INTRADAY";
const OPEN      = "1. open";
const HIGH      = "2. high";
const LOW       = "3. low";
const CLOSE     = "4. close";
const VOLUME    = "5. volume";

const RSI_FUNCTION = "RSI";

const BASE_DOMAIN = "https://www.alphavantage.co";
const META_DATA = "Meta Data";

class AlphaVantage extends FinancialApi {    
    constructor(config) {
        let api_key_env = config.api_key_env;
        let api_key = process.env[api_key_env];
        if (!api_key) {
            throw "'api_key' is a required parameter for this API";
        }
        super("Alpha Vantage", api_key);
        
        // TODO: move into config file
        this.interval = "60min";
        this.data_type = "json";
        this.rsi_time_period = 50;  
        this.rsi_series_type = "close";   
    }

    async get_stock_time_series(ticker) {
        console.log(`Getting stock time series for ${ticker} from ${this.friendly_identifier()}`);
        let args = {
            'function': STOCK_FUNCTION,
            'symbol': ticker,
            'interval': this.interval,
            'datatype': this.data_type,
            'apikey': this.api_key
        };
        
        let url = this.build_query_string(args);
        console.log(`Query url: ${url}`);

        let data = await get(url);
        if (!data) {
            console.log(`Unable to retrieve data for ${ticker}`);
            return null;
        }

        let _metadata = data[META_DATA]; // unused for now, may be useful later
        let time_series = data[`Time Series (${this.interval})`];
        if (!time_series) {
            console.log(`Time series unavailable for ${ticker}`);
            console.log("Maybe there is an error message:", data);
            return null;
        }
        
        let data_points = [];
        Object.keys(time_series)
            .map(function(key) {
                var timestamp = key;
                let open = time_series[key][OPEN];
                let high = time_series[key][HIGH];
                let low = time_series[key][LOW];
                let close = time_series[key][CLOSE];
                let volume = time_series[key][VOLUME];
                let data_point = new StockDataPoint(timestamp, open, high, low, close, volume);
                data_points.push(data_point);
            });
        
        return new TimeSeries(ticker, data_points);
    }

    async get_rsi_time_series(ticker) {
        console.log(`Getting RSI time series for ${ticker} from ${this.friendly_identifier()}`);
        let args = {
            'function': RSI_FUNCTION,
            'symbol': ticker,
            'interval': this.interval,
            'time_period': this.rsi_time_period,
            'series_type': this.rsi_series_type,
            'datatype': this.data_type,
            'apikey': this.api_key
        };
        
        let url = this.build_query_string(args);
        console.log(`Query url: ${url}`);

        let data = await get(url);
        if (!data) {
            console.log(`Unable to retrieve data for ${ticker}`);
            return null;
        }

        let _metadata = data[META_DATA]; // unused for now, may be useful later
        let time_series = data['Technical Analysis: RSI'];
        if (!time_series) {
            console.log(`Time series unavailable for ${ticker}`);
            console.log("Maybe there is an error message:", data);
            return null;
        }
        
        let data_points = [];
        Object.keys(time_series)
            .map(function(key) {
                var timestamp = key;
                let rsi = time_series[key][RSI_FUNCTION];
                let data_point = new RSIDataPoint(timestamp, rsi);
                data_points.push(data_point);
            });
        
        return new TimeSeries(ticker, data_points);
    }

    build_query_string(args) {
        let serialized_args = Object.keys(args)
            .map(function(key) { 
                return key + "=" + args[key] 
            })
            .join("&");
        let url = `${BASE_DOMAIN}/query?${serialized_args}`;
        return url;
    }
}

module.exports = { AlphaVantage };