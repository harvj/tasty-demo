import { get, writable } from 'svelte/store';
import { session } from './session';

export const quotes = writable({});

let socket;
let channelId = 1;

export function connectQuotes(symbols) {
  const current = get(session);
  socket = new WebSocket(current.dxlinkUrl);

  socket.onopen = () => {
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
      add: symbols.map(symbol => ({ symbol, type: 'Quote' }))
    }));
  };

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    if (msg.type === 'FEED_DATA' && msg.channel === channelId) {
      const updates = {};
      msg.data.forEach(d => {
        updates[d.eventSymbol] = {
          bid: d.bidPrice,
          ask: d.askPrice,
          bidSize: d.bidSize,
          askSize: d.askSize
        };
      });
      quotes.update(q => ({ ...q, ...updates }));
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
