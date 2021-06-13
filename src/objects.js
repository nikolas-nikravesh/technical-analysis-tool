class FinancialApi {
    constructor(name, api_key) {
        this.name = name;
        this.api_key = api_key;
    }

    async get_stock_time_series(ticker) {
        throw `get_stock_time_series not implemented for ${this.name}`;
    }

	async get_rsi_time_series(ticker) {
        throw `get_rsi_time_series not implemented for ${this.name}`;
    }

    friendly_identifier() {
        return this.name;
    }
}

class TimeSeries {
	constructor(ticker, data_points) {
		this.ticker = ticker
		this.data_points = data_points
			.sort(function (a, b) {
				return a.compare(b);
			});
	}

	to_string() {
		let str = `Time Series for ${this.ticker}:\n`
		this.data_points.forEach(function(data_point) {
			str += `${data_point.to_string()}\n`
		});
		return str;
	}

	latest_data_point() {
		return this.data_points[0];
	}
}

class DataPoint {
	constructor(timestamp) {
		this.timestamp = timestamp;
	}

	to_string() {
		return `Timestamp: ${this.timestamp}`
	}

	// when used in sorting (a.compare(b)), it will result in descending order ("largest" first)
	compare(other) {
		return (this.timestamp) < (other.timestamp) ? 1 : -1
	}
}

class StockDataPoint extends DataPoint {
	constructor(timestamp, open, high, low, close, volume) {
		super(timestamp);
		this.open = open;
	  	this.high = high;
	  	this.low = low;
		this.close = close;
		this.volume = volume;
	}

	to_string() {
		return `${super.to_string()} Open: ${this.open} High: ${this.high} Low: ${this.low} Close: ${this.close} Volume: ${this.volume}`
	}
}

class RSIDataPoint extends DataPoint {
	constructor(timestamp, rsi) {
		super(timestamp);
		this.rsi = rsi;
	}

	to_string() {
		return `${super.to_string()} RSI: ${this.rsi}`;
	}
}

module.exports = { StockDataPoint, TimeSeries, FinancialApi, RSIDataPoint };
