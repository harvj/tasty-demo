import { session } from './session';
import { get, writable } from 'svelte/store';
import { getMarketData } from '../lib/api';

export const quotes = writable({});
export const trades = writable({});
export const candles = writable([]);

let socket;
let channelId = 1;
let currentMode = null;        // 'quotes' or 'candles'
let currentSymbols = [];
let readyPromise = null;

// WebSocket setup constants
const setupJson = JSON.stringify({
  type: 'SETUP',
  channel: 0,
  keepaliveTimeout: 60,
  acceptKeepaliveTimeout: 60,
  version: '1.0.0'
});
const channelRequestJson = JSON.stringify({
  type: 'CHANNEL_REQUEST',
  channel: channelId,
  service: 'FEED',
  parameters: { contract: 'AUTO' }
});

// ---------- FEED_SETUP builders ----------
function feedConfigQuotesTrades() {
  return JSON.stringify({
    type: "FEED_SETUP",
    channel: channelId,
    acceptAggregationPeriod: 0,
    acceptEventFields: {
      Quote: ["eventType", "eventSymbol", "bidPrice", "askPrice"],
      Trade: ["eventType", "eventSymbol", "price"]
    }
  });
}

function feedConfigCandles() {
  return JSON.stringify({
    type: "FEED_SETUP",
    channel: channelId,
    acceptAggregationPeriod: 0,
    acceptEventFields: {
      Candle: ["eventType", "eventSymbol", "time", "open", "high", "low", "close"]
    }
  });
}

// ---------- WebSocket management ----------
async function waitForSessionReady() {
  return new Promise(resolve => {
    const trySession = () => {
      const s = get(session);
      if (s?.dxlinkUrl && s?.apiQuoteToken) {
        resolve(s);
        return true;
      }
      return false;
    };
    if (trySession()) return;
    const unsub = session.subscribe(s => {
      if (s?.dxlinkUrl && s?.apiQuoteToken) {
        unsub();
        resolve(s);
      }
    });
  });
}

async function initSocket() {
  if (socket && socket.readyState !== WebSocket.CLOSED) return;

  const { dxlinkUrl, apiQuoteToken } = await waitForSessionReady();
  console.log("Opening WS to:", dxlinkUrl, "with token:", apiQuoteToken);

  socket = new WebSocket(dxlinkUrl);

  readyPromise = new Promise(resolve => {
    socket.onopen = () => {
      socket.send(setupJson);
      socket.send(JSON.stringify({
        type: 'AUTH',
        channel: 0,
        token: apiQuoteToken
      }));
      socket.send(channelRequestJson);
      resolve();
    };
  });

  socket.onmessage = handleMessage;
  socket.onclose = () => console.log("WebSocket closed");
}

async function send(json) {
  console.log(json);
  await readyPromise;
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(json);
  }
}

// ---------- Subscription helpers ----------
function subscribeSymbols(symbols, type, extra = {}) {
  if (!symbols.length) return;
  send(JSON.stringify({
    type: 'FEED_SUBSCRIPTION',
    channel: channelId,
    add: symbols.map(symbol => ({ symbol, type, ...extra }))
  }));
}

function unsubscribeSymbols(symbols, type) {
  if (!symbols.length) return;
  send(JSON.stringify({
    type: 'FEED_SUBSCRIPTION',
    channel: channelId,
    remove: symbols.map(symbol => ({ symbol, type }))
  }));
}

// ---------- Message handlers ----------
function handleMessage(event) {
  const msg = JSON.parse(event.data);
  console.log(msg);
  if (msg.type === 'FEED_DATA' && msg.channel === channelId) {
    if (currentMode === 'quotes') handleQuotesTradesMessage(msg);
    else if (currentMode === 'candles') handleCandlesMessage(msg);
  }
}

function handleQuotesTradesMessage(msg) {
  const newQuotes = {};
  const newTrades = {};

  msg.data.forEach(d => {
    if (d[0] === 'Quote') {
      const [, symbol, bid, ask] = d;
      newQuotes[symbol] = {
        bid: parseFloat(bid),
        ask: parseFloat(ask)
      };
    } else if (d[0] === 'Trade') {
      const [, symbol, price] = d;
      newTrades[symbol] = {
        last: parseFloat(price)
      };
    }
  });

  if (Object.keys(newQuotes).length) quotes.update(q => ({ ...q, ...newQuotes }));
  if (Object.keys(newTrades).length) trades.update(t => ({ ...t, ...newTrades }));
}

function handleCandlesMessage(msg) {
  const updates = [];
  msg.data.forEach(d => {
    if (d[0] === 'Candle') {
      const [, , time, open, high, low, close] = d;
      updates.push({
        time: new Date(time),
        open,
        high,
        low,
        close
      });
    }
  });
  candles.update(existing => {
    const merged = [...existing];
    updates.forEach(u => {
      const idx = merged.findIndex(c => c.time === u.time);
      if (idx >= 0) {
        merged[idx] = u; // replace existing candle
      } else {
        merged.push(u); // add new candle
      }
    });
    console.log(merged);
    return merged.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  });
}

// ---------- Public API ----------
export async function subscribeQuotesAndTrades(symbols) {
  await initSocket();
  console.log("got here quotes")
  if (currentMode === 'candles') {
    unsubscribeSymbols(currentSymbols.map(s => `${s}{=5m}`), 'Candle');
  }

  currentMode = 'quotes';
  currentSymbols = symbols;

  send(feedConfigQuotesTrades());
  subscribeSymbols(symbols, 'Quote');
  subscribeSymbols(symbols, 'Trade');
}

export async function subscribeCandles(symbol) {
  await initSocket();
  console.log("got here candles")
  if (currentMode === 'quotes') {
    unsubscribeSymbols(currentSymbols, 'Quote');
    unsubscribeSymbols(currentSymbols, 'Trade');
  } else if (currentMode === 'candles') {
    unsubscribeSymbols(currentSymbols.map(s => `${s}{=5m}`), 'Candle');
  }

  currentMode = 'candles';
  currentSymbols = [symbol];

  candles.set([]);
  send(feedConfigCandles());

  const now = Math.round(Date.now());
  const fromTime = now - (24 * 3600 * 1000);
  const candleSymbol = `${symbol}{=5m}`;

  subscribeSymbols([candleSymbol], 'Candle', { fromTime });
}

export function disconnectQuotes() {
  if (socket) {
    socket.close();
    socket = null;
    currentMode = null;
    currentSymbols = [];
  }
}

// ------------------------------
// REST helper for initial quotes
// ------------------------------
export async function fetchInitialQuotes(symbols) {
  for (const symbol of symbols) {
    const { success, result, message } = await getMarketData(symbol);
    if (success) {
      const d = result.data;

      // Update quotes store (bid/ask only)
      quotes.update(q => {
        const merged = { ...q };
        merged[d.symbol] = {
          ...(merged[d.symbol] || {}),
          bid: d.bid !== undefined ? parseFloat(d.bid) : undefined,
          ask: d.ask !== undefined ? parseFloat(d.ask) : undefined
        };
        return merged;
      });

      // Update trades store (last only)
      trades.update(t => {
        const merged = { ...t };
        if (d.last !== undefined) {
          merged[d.symbol] = {
            ...(merged[d.symbol] || {}),
            last: parseFloat(d.last)
          };
        }
        return merged;
      });

    } else {
      console.error(message);
    }
  }
}
