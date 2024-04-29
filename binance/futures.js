require("dotenv").config();
const utility = require("./util");

//Get Symbol Info
async function getMiniumPerAsset(symbol) {
  const endpoint = "https://fapi.binance.com/fapi/v1/exchangeInfo";
  const response = await fetch(endpoint);
  const exchangeInfo = await response.json();

  // Check if exchangeInfo and exchangeInfo.symbols are defined
  if (!exchangeInfo || !exchangeInfo.symbols) {
    throw new Error("Failed to retrieve exchange information");
  }

  const symbolInfo = exchangeInfo.symbols.find((s) => s.symbol === symbol);

  if (!symbolInfo) {
    throw new Error(`Symbol ${symbol} not found`);
  }
  // console.log(symbolInfo)
  const minOrderQty = symbolInfo.filters.find(
    (f) => f.filterType === "MIN_NOTIONAL"
  ).notional;
  const lotSizeFilter = symbolInfo.filters.find(
    (filter) => filter.filterType === "LOT_SIZE"
  );
  const minNotionalFilter = symbolInfo.filters.find(
    (filter) => filter.filterType === "MIN_NOTIONAL"
  );

  const minQty =
    lotSizeFilter && lotSizeFilter.minQty
      ? parseFloat(lotSizeFilter.minQty)
      : 0;
  const minNotional =
    minNotionalFilter && minNotionalFilter.notional
      ? parseFloat(minNotionalFilter.notional)
      : 0;

  return { minOrderQty, minQty, minNotional };
}

//futures order
//can be a LIMIT or MARKET order depending on specified "type" in params
//can be a BUY or SELL order depending on specified "side" in params
async function futuresOrder(
  symbol,
  action,
  quantity,
  price = 0,
  marketType = "MARKET",
  leverage = "25",
  timeInForce = "GTC"
) {
  try {
    const timestamp = Date.now();
    return marketType == "MARKET"
      ? utility("https://fapi.binance.com/fapi/v1/order", "POST", {
          symbol,
          leverage,
          side: action,
          type: marketType,
          quantity,
          timestamp,
        })
      : utility("https://fapi.binance.com/fapi/v1/order", "POST", {
          symbol,
          leverage,
          side: action,
          type: marketType,
          quantity,
          price,
          timestamp,
          timeInForce,
        });
  } catch (error) {
    console.log(error, ":error");
    throw error;
  }
}

async function getAllActiveFutures() {
  try {
    const timestamp = Date.now();
    return utility("https://fapi.binance.com/fapi/v2/positionRisk", "GET", {
      timestamp,
    });
  } catch {
    console.log(error, ":error");
    throw error;
  }
}

//Check balances
async function checkFuturesBalance(symbol = "USDT") {
  try {
    const timestamp = Date.now();
    const recvWindow = 10000;
    const balances = await utility(
      "https://fapi.binance.com/fapi/v2/balance",
      "GET",
      {
        symbol,
        timestamp,
        recvWindow,
      }
    );
    const assetBalances = balances.filter((a) => parseInt(a.balance) > 0);
    if (assetBalances) {
      return {
        assets: assetBalances,
        assetBalance: assetBalances.find((asset) => asset.asset == symbol),
      };
    } else {
      return "Asset does not exist";
    }
  } catch (error) {
    console.log(error, ":error");
    throw error;
  }
}

async function getAllOpenFuturesOrders(symbol = null) {
  try {
    const timestamp = Date.now();
    return utility(
      "https://fapi.binance.com/fapi/v1/openOrders",
      "GET",
      symbol
        ? {
            symbol,
            timestamp,
            recvWindow: 600000,
          }
        : {
            timestamp,
            recvWindow: 600000,
          }
    );
  } catch (error) {
    console.log(error, ":error");
    throw error;
  }
}

async function getFuturesRiskPNLOrders(symbol = null) {
  try {
    const timestamp = Date.now();
    return utility(
      "https://fapi.binance.com/fapi/v2/positionRisk",
      "GET",
      symbol
        ? {
            timestamp,
            symbol,
          }
        : {
            timestamp,
          }
    );
  } catch (error) {
    console.log(error, ":error");
    throw error;
  }
}

//GETs all Futures orders; ACTIVE, CANCELLED or FILLED
async function getAllFuturesOrders() {
  try {
    const timestamp = Date.now();
    return utility("https://fapi.binance.com/fapi/v1/allOrders", "GET", {
      timestamp,
    });
  } catch (error) {
    console.log(error, ":error");
    throw error;
  }
}

async function deleteFuturesOrder(symbol, orderId) {
  try {
    const timestamp = Date.now();
    return await utility("https://fapi.binance.com/fapi/v1/order", "DELETE", {
      symbol,
      timestamp,
    });
  } catch (error) {
    console.log(error, ":error");
    throw error;
  }
}

async function deleteAllFuturesOrder(symbol) {
  try {
    const timestamp = Date.now();
    return await utility(
      "https://fapi.binance.com/fapi/v1/allOpenOrders",
      "DELETE",
      {
        symbol,
        timestamp,
      }
    );
  } catch (error) {
    console.log(error, ":error");
    throw error;
  }
}

(async () => {
  const symbol = "LQTYUSDT";

  const balance = await checkFuturesBalance(symbol);
  const minOrdNotional = await getMiniumPerAsset(symbol); //Get minimum oder notional

  const leverage = 20; //Leverage on the futures
  const percent = 20; //Specify the percentage of USDT balance you want to trade with
  const type = "LIMIT";
  const price = 1.3; //THe price you wanna trade at

  const stake = parseFloat((percent / 100) * balance); //amount traded with in USDT
  const setQty = Math.round(stake / price); //Quantity of assets futures traded
  const minQty = price * minOrdNotional;
  const qtyArray = [setQty, minQty];
  const quantity = Math.max(qtyArray);
  console.log("Quantity: ", quantity);

  const action = "BUY";
  const orderId = 1206851765;

  const transaction = await futuresOrder(
    symbol,
    leverage,
    action,
    quantity,
    price
  );
  //   // const openOrders = await getAllOpenFuturesOrders();
  //   // const getAllOrders = await getAllFuturesOrders();
  //   // const deleteTransaction = await deleteFuturesOrder(symbol, orderId);
  //   // const deleteAllTransactions = await deleteAllFuturesOrder(symbol);

  //   console.log("Minimun Order Notional Qty of", symbol, "is:", orderQty);
  console.log("Futures Order:", transaction);
  //   // console.log("OPen Orders: ", openOrders);
  //   // console.log("All Orders: ", getAllOrders);
  //   // console.log("Balance is:", balance);
  //   // console.log("Successfully Deleted: ", deleteTransaction);
  //   // console.log("Successfully Deleted: ", deleteAllTransactions);
})();

module.exports = {
  futuresOrder,
  getMiniumPerAsset,
  checkFuturesBalance,
  getAllOpenFuturesOrders,
  getAllFuturesOrders,
  deleteFuturesOrder,
  deleteAllFuturesOrder,
  getAllActiveFutures,
  getFuturesRiskPNLOrders,
};
