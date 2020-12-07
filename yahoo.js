const axios = require("axios");
const fs = require("fs");

const FILENAME = "json_files/finnhub_tickers_1.json";
const { log } = console;

const saveState = (filename, stateJSON) => {
  const stateJSONString = JSON.stringify(stateJSON, null, 2);
  fs.writeFileSync(filename, stateJSONString);
};

const loadState = (filename) => {
  const rawdata = fs.readFileSync(filename);
  return JSON.parse(rawdata);
};

const yahoo = {
  yahooUrl: "https://query2.finance.yahoo.com/v6/finance/quote/validate",

  buildRequest: () => {
    return {
      method: "get",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };
  },

  parseResponse: (yahooResponse) => {
    return yahooResponse["data"]["symbolsValidation"]["result"][0];
  },

  isYahooTickers: async (symbols) => {
    const url = `${yahoo.yahooUrl}?symbols=${encodeURIComponent(symbols)}`;
    log(`Gathering yahoo tickers for all finnhub tickers`);
    try {
      const response = await axios(url, yahoo.buildRequest());
      return yahoo.parseResponse(response);
    } catch (err) {
      log("Something went wrong, prevent updating tickers.json");
      saveState("errors.json", err);
      process.exit(-1);
    }
  },
};

const main = async () => {
  finnHubTickers = loadState(FILENAME);
  let allTickers = finnHubTickers["US"].concat(finnHubTickers["TO"]);

  allTickers = allTickers.filter((ticker) => {
    if (ticker["type"] != "") {
      return ticker;
    }
  });
  console.log(allTickers.length);

  // pass 1

  console.log("yahoo validations, performing pass 1...");

  tickerData = {}; // declared for future use

  for (let index = 0; index < allTickers.length; index++) {
    const ticker = allTickers[index]["symbol"];
    tickerData[ticker] = allTickers[index];
  }

  tickerList = Object.keys(tickerData);
  const numberOfTickers = tickerList.length;

  let valid = [],
    invalid = [];

  for (let index = 0; index < numberOfTickers; index = index + 1000) {
    const upperBound = Math.min(numberOfTickers, index + 1000);

    console.log(index, upperBound);
    const response = await yahoo.isYahooTickers(
      tickerList.slice(index, upperBound)
    );

    for (const ticker in response) {
      if (response[ticker]) {
        valid.push(ticker);
      } else {
        invalid.push(ticker);
      }
    }
  }

  const yahooValidations = {
    valid,
    invalid,
  };

  console.log("pass one valid tickers: " + valid.length);
  console.log("pass one invalid tickers: " + invalid.length);

  console.log("yahoo validations, saving pass 1...");
  saveState("json_files/yahoo_validations_2.json", yahooValidations);

  // pass 2

  console.log("yahoo validations, performing pass 2...");

  mutatedInvalid = invalid.map((i) => {
    return i.replace(".", "-");
  });

  let validPassTwo = [],
    invalidPassTwo = [];

  for (let index = 0; index < mutatedInvalid.length; index = index + 1000) {
    const upperBound = Math.min(mutatedInvalid.length, index + 1000);

    console.log(index, upperBound);
    const response = await yahoo.isYahooTickers(
      mutatedInvalid.slice(index, upperBound)
    );

    for (const ticker in response) {
      if (response[ticker]) {
        validPassTwo.push(ticker);
      } else {
        invalidPassTwo.push(ticker);
      }
    }
  }

  const yahooValidTickers = valid.concat(validPassTwo);
  console.log("Total valid tickers: " + yahooValidTickers.length);

  console.log("yahoo validations, saving pass 2...");

  saveState("json_files/yahoo_validations_3.json", { yahooValidTickers });
};

main();
