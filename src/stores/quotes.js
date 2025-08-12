import { get, writable } from 'svelte/store';
import { session } from './session';
import { getMarketData } from '../lib/api';

export const quotes = writable({});
export const candles = writable([]);

let socket;
let channelId = 1;

const current = get(session);

const setupJson = JSON.stringify({
  type: 'SETUP',
  channel: 0,
  keepaliveTimeout: 60,
  acceptKeepaliveTimeout: 60,
  version: '1.0.0'
});

const authJson = JSON.stringify({
  type: 'AUTH',
  channel: 0,
  token: current.apiQuoteToken
});

const channelRequestJson = JSON.stringify({
  type: 'CHANNEL_REQUEST',
  channel: channelId,
  service: 'FEED',
  parameters: { contract: 'AUTO' }
});

export async function fetchInitialQuotes(symbols) {
  for (const symbol of symbols) {
    const { success, result, message } = await getMarketData(symbol);
    if (success) {
      const updates = {};
      const d = result.data;
      updates[d.symbol] = {
        bid: d.bid !== undefined ? parseFloat(d.bid) : undefined,
        ask: d.ask !== undefined ? parseFloat(d.ask) : undefined,
        last: d.last !== undefined ? parseFloat(d.last) : undefined
       };
      quotes.update(q => {
        const merged = { ...q };
        for (const sym in updates) {
          merged[sym] = { ...(q[sym] || {}), ...updates[sym] };
        }
        return merged;
      });
    } else {
      console.error(message);
    }
  };
}

export function connectQuotes(symbols) {
  const feedConfig = JSON.stringify({
    type: "FEED_SETUP",
    channel: 1,
    acceptAggregationPeriod: 10,
    acceptDataFormat: "COMPACT",
    acceptEventFields: {
      Quote: ["eventType", "eventSymbol", "bidPrice", "askPrice", "bidSize", "askSize"]
    }
  })

  const subscribeJson = JSON.stringify({
    type: 'FEED_SUBSCRIPTION',
    channel: channelId,
    add: symbols.flatMap(symbol => [
      { symbol, type: 'Quote' },
      { symbol, type: 'Trade' }
    ])
  });

  if (!socket) {
    socket = new WebSocket(current.dxlinkUrl);
    socket.onopen = () => {
      // 1. Setup
      socket.send(setupJson);
      // 2. Authenticate
      socket.send(authJson);
      // 3. Request feed channel
      socket.send(channelRequestJson);
      // 4. Subscribe to Quote events
      socket.send(feedConfig);
      socket.send(subscribeJson);
    };
  } else {
    socket.send(subscribeJson);
  }

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    console.log(msg);

    if (msg.type === 'FEED_DATA' && msg.channel === channelId) {
      const updates = {};
      msg.data.forEach(d => {
        if (d[0] === 'Quote') {         // eventType from Array
          updates[d[1]] = {             // eventSymbol from Array
            ...(updates[d[1]] || {}),
            bid: d[7],                  // bidPrice from Array
            ask: d[11]                  // askPrice from Array
          };
        } else if (d[0] === 'Trade') {  // eventType from Array
          updates[d[1]] = {             // eventSymbol from Array
            ...(updates[d[1]] || {}),
            last: d[7]                  // lastPrice from Array
          };
        }
      });
      quotes.update(q => {
        const merged = { ...q };
        for (const sym in updates) {
          merged[sym] = { ...(q[sym] || {}), ...updates[sym] };
        }
        return merged;
      });
    }
  };

  socket.onclose = () => {
    console.log('WebSocket closed');
  };
}

export function connectCandles() {
  const symbol = current?.symbol
  const now = Math.round(new Date().getTime());
  const fromTime = now - (24 * 3600 * 1000);

  const candleSymbol = `${symbol}{=5m}`;

  const subscribeJson = JSON.stringify({
    type: 'FEED_SUBSCRIPTION',
    channel: channelId,
    add: [{ symbol: candleSymbol, type: 'Candle', fromTime }]
  });

  if (!socket) {
    socket = new WebSocket(current.dxlinkUrl);
    socket.onopen = () => {
      // 1. Setup
      socket.send(setupJson);
      // 2. Authenticate
      socket.send(authJson);
      // 3. Request feed channel
      socket.send(channelRequestJson);
      // 4. Subscribe to Quote events
      socket.send(subscribeJson);
    };
  } else {
    socket.send(subscribeJson);
  }

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    console.log(msg);

    if (msg.type === 'FEED_DATA' && msg.channel === channelId) {
    msg.data.forEach(d => {
      if (Array.isArray(d) && d[0] === 'Candle') {
        const candleSize = 18; // number of fields in one candle record
        const startIndex = 0;  // index in d where first candle record begins
        const candleArray = [];

        for (let i = startIndex; i < d.length; i += candleSize) {
          candleArray.push({
            time: new Date(d[i + 5]),
            open: d[i + 8],
            high: d[i + 9],
            low: d[i + 10],
            close: d[i + 11]
          });
        }

        candles.set(candleArray);
      }
    });
  }
  };
}

export function disconnectQuotes() {
  if (socket) {
    socket.close();
    socket = null;
  }
}
