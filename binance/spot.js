const utility = require("./util");

require("dotenv").config();

//Fetch price of specified symbol
async function getTickerprice(symbol) {
  try {
    const priceFetch = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
    );
    const priceBody = await priceFetch.json();
    const ticPrice = parseFloat(priceBody.price);
    // console.log(ticPrice);

    return ticPrice;
  } catch (error) {
    console.log("Error fetching ticker price", error);
    throw error;
  }
}
//SPOT Trade
//Make trade based on the available params
async function makeTrade(symbol, price, action, quantity) {
  try {
    const timestamp = Date.now();
    return utility("https://api.binance.com/api/v3/order", "POST", {
      symbol,
      side: action,
      type: "LIMIT", //for market orders "price"and "timeInForce" params are not needed
      quantity,
      price,
      timestamp,
      timeInForce: "GTC",
      recvWindow: 5000,
    });
  } catch (error) {
    // console.log("Error", error);
    throw error;
  }
}

async function modifyTrade(symbol, price, action, quantity) {
  try {
    const timestamp = Date.now();
    return utility("https://api.binance.com/api/v3/order", "PUT", {
      symbol,
      side: action,
      quantity,
      price,
      timestamp,
    });
  } catch (error) {
    // console.log("Error", error);
    throw error;
  }
}

async function checkBalance() {
  try {
    const timestamp = Date.now();
    const symbol = "USDT";
    const response = utility("https://api.binance.com/api/v3/account", "GET", {
      timestamp,
    });
    //Balance for a single coin
    //assign symbol variable to the queried coin
    const coinBalance = response.balances.find(
      (balance) => balance.asset === symbol
    );
    console.log(coinBalance);

    //All Balances
    return response.balances;
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
}

async function getAllOrders(symbol) {
  try {
    const timestamp = Date.now();
    return utility("https://api.binance.com/api/v3/allOrders", "GET", {
      symbol,
      timestamp,
    });
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
}

async function deleteSpotTrade(symbol, orderId) {
  try {
    const endpoint = ``;
    const timestamp = Date.now();
    return utility("https://api.binance.com/api/v3/order", "DELETE", {
      symbol,
      orderId,
      timestamp,
      recvWindow: 5000,
    });
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
}

async function deleteAllSpotTrade(symbol) {
  try {
    const endpoint = ``;
    const timestamp = Date.now();
    return utility("https://api.binance.com/api/v3/cancelOrders", "DELETE", {
      symbol,
      timestamp,
      recvWindow: 5000,
    });
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
}

(async () => {
  const symbol = "TLMUSDT";
  const price = 0.02;
  const action = "SELL";
  const quantity = 19;
  // const quantity = Math.round(5 / price);
  // const balance = await checkBalance();
  // console.log(balance)
  // const allOrders = await getAllOrders(symbol)
  const ticPrice = await getTickerprice(symbol);

  console.log(ticPrice);
  const transaction = await makeTrade(symbol, price, action, quantity);
  console.log(transaction);
  // const deleteOrder = await deleteSpotTrade("TLMUSDT", 7385677);
  // console.log(deleteOrder);
})();

module.exports = {
  getTickerprice,
  makeTrade,
  modifyTrade,
  getAllOrders,
  checkBalance,
  deleteSpotTrade,
  deleteAllSpotTrade,
};
