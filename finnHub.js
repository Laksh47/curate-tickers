const axios = require("axios");
const fs = require("fs");

const FILENAME = "json_files/finnhub_tickers_1.json";
const { log } = console;

const saveState = (stateJSON) => {
  const stateJSONString = JSON.stringify(stateJSON, null, 2);
  fs.writeFileSync(FILENAME, stateJSONString);
};

const finnHub = {
  finnHubUrl: "https://finnhub.io/api/v1/stock/symbol",

  finnHubAuthToken: process.env.FINNHUB_TOKEN || "finnHub_token_needed",

  buildRequest: () => {
    return {
      method: "get",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Finnhub-Token": finnHub.finnHubAuthToken,
      },
    };
  },

  parseResponse: (finnHubResponse) => {
    return finnHubResponse["data"];
  },

  getTickers: async (exchange) => {
    const USTickersUrl = `${finnHub.finnHubUrl}?exchange=${exchange}`;
    log(`Gathering tickers from ${exchange} exchange`);
    try {
      const response = await axios(USTickersUrl, finnHub.buildRequest());
      return finnHub.parseResponse(response);
    } catch (err) {
      log("Something went wrong, prevent updating tickers.json");
      log(err);
      process.exit(-1);
    }
  },
};

const main = async () => {
  const USTickers = await finnHub.getTickers("US"); // US Tickers
  const canadaTickers = await finnHub.getTickers("TO"); // Canada tickers

  const tickersJSON = {
    TO: canadaTickers,
    US: USTickers,
  };

  saveState(tickersJSON);
};

main();
