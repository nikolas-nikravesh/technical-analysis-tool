async function fetch_stock_info(financial_api, ticker) {
    // Get stock time series
    let stock_time_series = await financial_api.get_stock_time_series(ticker);
    if (stock_time_series) {
        console.log(stock_time_series.latest_data_point().to_string());
    }

    // Get RSI time series
    let rsi_time_series = await financial_api.get_rsi_time_series(ticker);
    if (rsi_time_series) {
        console.log(rsi_time_series.latest_data_point().to_string());
    }
}

module.exports = { fetch_stock_info };