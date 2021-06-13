const fs = require('fs')

const { AlphaVantage } = require("../src/alpha_vantage/alpha_vantage");
const { fetch_stock_info } = require("../src/utils");

const CONFIG_FILE = "etc/ta-tool.cfg";

// Unsafe read
let config = JSON.parse(
	fs.readFileSync(CONFIG_FILE)
);
console.log(config);

// get stock ticker names
let tickers = config.tickers;

// alpha vantage
let alpha_vantage_config = config.alpha_vantage || null;
if (alpha_vantage_config) {
	let alpha_vantage = new AlphaVantage(alpha_vantage_config)
	tickers.forEach(function(ticker) { 
		fetch_stock_info(alpha_vantage, ticker);
	});
}