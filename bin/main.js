const fs = require('fs')

const { TechnicalIndicator, BuySellSignal } = require("../src/objects");
const { AlphaVantage } = require("../src/alpha_vantage/alpha_vantage");
const { fetch_stock_info } = require("../src/utils");

const CONFIG_FILE = "etc/ta-tool.cfg";

// Unsafe read
let config = JSON.parse(
	fs.readFileSync(CONFIG_FILE)
);
console.log(config);

// technical analysis
let technical_analysis = config['technical_analysis'];
let config_indicators = technical_analysis['indicators'];

let all_indicators = [];
Object.keys(config_indicators)
	.map(function(key) {
		let name = key;
		let weight = config_indicators[key]['weight'];
		let enabled = config_indicators[key]['enabled'];
		let indicator = new TechnicalIndicator(name, weight, enabled);
		all_indicators.push(indicator);
	});

// filter for "enabled" indicators
let total_weight = 0;
const enabled_indicators = all_indicators.filter(indicator => indicator.is_enabled());
enabled_indicators.forEach(function(indicator) {
	console.log(indicator);
	total_weight += indicator.weight;
});
console.log(total_weight);

// get stock ticker names
let tickers = config.tickers;

// alpha vantage
let alpha_vantage_config = config.alpha_vantage || null;
if (alpha_vantage_config) {
	let alpha_vantage = new AlphaVantage(alpha_vantage_config)
	tickers.forEach(function(ticker) { 
		fetch_stock_info(alpha_vantage, ticker, enabled_indicators, total_weight);
	});
}