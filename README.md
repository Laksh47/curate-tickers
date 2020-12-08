# Curate Tickers

- Github Actions job runs at 11:00 UTC (6AM ET) and at 23:00 UTC (6PM ET) everyday!
- Uses FinnHub for now as a data source, more API sources will be added
- API key gets loaded through Github secrets
- `finnhub_tickers_1.json` holds US and TO tickers for now (more markets can be added moving forward)
- `yahoo_validations_*.json` files hold validated tickers from yahoo API
