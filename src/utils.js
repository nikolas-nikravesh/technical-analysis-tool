const { get } = require("https");
const { MACD, RSI } = require("./constants");
const { BuySellSignal } = require("./objects");

// Get stock value and buy/sell confidence value for a given stock
async function fetch_stock_info(financial_api, ticker, enabled_indicators, total_weight) {
    // Get stock time series
    let stock_time_series = await financial_api.get_stock_time_series(ticker);
    if (stock_time_series) {
        console.log(stock_time_series.latest_data_point().to_string());
    }

    // determine buy/sell signal confidence value
    let buy_sell_signals = await get_buy_sell_signals(financial_api, ticker, enabled_indicators, total_weight);
    if (buy_sell_signals) {
        console.log(buy_sell_signals);
        let total_buy_sell_signal = buy_sell_signals.reduce((a, b) => a + b, 0);
        console.log(`buy/sell signal confidence value for ${ticker}: ${total_buy_sell_signal}`);
    } else {
        console.log("Could not properly calculate buy/sell signals");
    }
}

async function get_buy_sell_signals(financial_api, ticker, enabled_indicators, total_weight) {
    let buy_sell_signals = [];

    // get stock data for enabled technical indicators
    for (const indicator of enabled_indicators) {
        // TODO: This logic can be consolidated
        if (indicator.get_name() == MACD) {
            // Get MACD time series
            let macd_time_series = await financial_api.get_macd_time_series(ticker);
            if (macd_time_series) {
                let latest_data_point = macd_time_series.latest_data_point();
                console.log(latest_data_point.to_string());
                let buy_sell_signal = latest_data_point.get_buy_sell_signal();
                let weighted_buy_sell_value = await get_weighted_buy_sell_value(buy_sell_signal, indicator.weight, total_weight);
                buy_sell_signals.push(weighted_buy_sell_value);
            } else {
                return null;
            }
        }

        if (indicator.get_name() == RSI) {
            // Get RSI time series
            let rsi_time_series = await financial_api.get_rsi_time_series(ticker);
            if (rsi_time_series) {
                let latest_data_point = rsi_time_series.latest_data_point();
                console.log(latest_data_point.to_string());
                let buy_sell_signal = latest_data_point.get_buy_sell_signal();
                let weighted_buy_sell_value = await get_weighted_buy_sell_value(buy_sell_signal, indicator.weight, total_weight);
                buy_sell_signals.push(weighted_buy_sell_value);
            } else {
                return null;
            }
        }
    }

    return buy_sell_signals;
}

async function get_weighted_buy_sell_value(signal, weight, total_weight) {
    let percentage_of_total = weight/total_weight;
    
    if (signal == BuySellSignal.BUY) {
        return 1 * percentage_of_total;
    } else if (signal == BuySellSignal.SELL) {
        return 0 * percentage_of_total;
    } else {
        // inconclusive
        return 0.5 * percentage_of_total;
    }
}

module.exports = { fetch_stock_info };