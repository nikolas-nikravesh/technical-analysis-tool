const {
   TimeSeries,
   StockDataPoint,
   FinancialApi,
   RSIDataPoint,
   MACDDataPoint
} = require("../objects");

const { get } = require("../https");

// Stocks
const STOCK_FUNCTION = "TIME_SERIES_DAILY";
const OPEN      = "1. open";
const HIGH      = "2. high";
const LOW       = "3. low";
const CLOSE     = "4. close";
const VOLUME    = "5. volume";

// RSI
const RSI_FUNCTION = "RSI";

// MACD
const MACD_FUNCTION = "MACD";
const MACD = "MACD";
const MACD_SIGNAL = "MACD_Signal";
const MACD_HIST = "MACD_Hist";

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
        this.interval = "daily";
        this.data_type = "json";
        
        this.rsi_time_period = 50;
        this.rsi_series_type = "close";

        this.macd_series_type = "open";
        this.macd_fast_period = 12;
        this.macd_slow_period = 26;
        this.macd_signal_period = 9;
    }

    async get_stock_time_series(ticker) {
        console.log(`Getting stock time series for ${ticker} from ${this.friendly_identifier()}`);
        let args = {
            'function': STOCK_FUNCTION,
            'symbol': ticker,
            'datatype': this.data_type,
            'apikey': this.api_key
        };

        let time_series = await this.get_time_series(args, `Time Series (Daily)`);
        if (!time_series) {
            console.log(`Time series unavailable for ${ticker}`);
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

        let time_series = await this.get_time_series(args, 'Technical Analysis: RSI');
        if (!time_series) {
            console.log(`Time series unavailable for ${ticker}`);
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

    async get_macd_time_series(ticker) {
      console.log(`Getting MACD time series for ${ticker} from ${this.friendly_identifier()}`);
      let args = {
          'function': MACD_FUNCTION,
          'symbol': ticker,
          'interval': this.interval,
          'datatype': this.data_type,
          'series_type': this.macd_series_type,
          'fastperiod' : this.macd_fast_period,
          'slowperiod' : this.macd_slow_period,
          'signalperiod' : this.macd_signal_period,
          'apikey': this.api_key
      };

      let time_series = await this.get_time_series(args, 'Technical Analysis: MACD');
      if (!time_series) {
          console.log(`Time series unavailable for ${ticker}`);
          return null;
      }

      let data_points = [];
      Object.keys(time_series)
          .map(function(key) {
             var timestamp = key;
             let macd = time_series[key][MACD];
             let signal = time_series[key][MACD_SIGNAL];
             let hist = time_series[key][MACD_HIST];
             let data_point = new MACDDataPoint(timestamp, macd, signal, hist);
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

    async get_time_series(args, key) {
        let url = this.build_query_string(args);
        console.log(`Query url: ${url}`);
  
        let data = await get(url);
        if (!data) {
            return null;
        }
  
        let _metadata = data[META_DATA]; // unused for now, may be useful later
        let time_series = data[key];
        if (!time_series) {
            console.log("Maybe there is an error message:", data);
            return null;
        }

        return time_series;
    }
}

module.exports = { AlphaVantage };
