import { get, writable } from 'svelte/store';
import { session } from './session';

export const quotes = writable({});

let socket;
let channelId = 1;

export function connectQuotes(symbols) {
  const current = get(session);
  socket = new WebSocket(current.dxlinkUrl);

  socket.onopen = () => {
    console.log("opening")
    // 1. Setup
    socket.send(JSON.stringify({
      type: 'SETUP',
      channel: 0,
      keepaliveTimeout: 60,
      acceptKeepaliveTimeout: 60,
      version: '1.0.0'
    }));

    // 2. Authenticate
    socket.send(JSON.stringify({
      type: 'AUTH',
      channel: 0,
      token: current.apiQuoteToken
    }));

    // 3. Request feed channel
    socket.send(JSON.stringify({
      type: 'CHANNEL_REQUEST',
      channel: channelId,
      service: 'FEED',
      parameters: { contract: 'AUTO' }
    }));

    // 4. Subscribe to Quote events
    socket.send(JSON.stringify({
      type: 'FEED_SUBSCRIPTION',
      channel: channelId,
      add: symbols.flatMap(symbol => [
        { symbol, type: 'Quote' },
        { symbol, type: 'Trade' }
      ])
    }));
  };

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    console.log(msg);

    if (msg.type === 'FEED_DATA' && msg.channel === channelId) {
      const updates = {};
      msg.data.forEach(d => {
        if (d[0] === 'Quote') {
          updates[d[1]] = { // eventSymbol from Array
            ...(updates[d[1]] || {}),
            bid: d[7],      // bidPrice from Array
            ask: d[11]      // askPrice from Array
          };
        } else if (d[0] === 'Trade') {
          updates[d[1]] = {
            ...(updates[d[1]] || {}),
            last: d[7]
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

export function disconnectQuotes() {
  if (socket) {
    socket.close();
    socket = null;
  }
}
