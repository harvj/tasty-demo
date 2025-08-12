# tastytrade Watchlist Demo

This is a Svelte 5 application for viewing live market quotes and candle charts via the DxLink WebSocket feed and tastytrade REST API.

It includes:
- Full watchlist management
- Live bid/ask/last quote updates.
- Historical and live candle data (e.g., 24 hours at 5-minute intervals).
*(Note: Dxlink is no longer giving me historic data with an adjusted FEED_SETUP so the chart is only displaying live candle data)*
- Plotly-based candlestick chart.
- Full Svelte component structure with reactive WebSocket subscriptions.

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/harvj/tasty-demo.git
cd tasty-demo
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```
This will start the Vite dev server.
By default it runs at: http://localhost:5173

### 4. Login with Sandbox credentials
This project uses the tastytrade API at `https://api.cert.tastyworks.com` so you will need valid credentials to login and successfully interact with the API.

### 5. Running tests
This repo uses Vitest for unit/component tests.

To run all tests:
```bash
npm run test
```

### 6. Project structure
```bash
src/
  components/         # Svelte components
  stores/             # Svelte stores (quotes, candles, session, etc.)
  lib/                # API utilities
  App.svelte
  main.js
```
- `stores/quotes.js` — WebSocket connection & store for quotes and candles.
- `stores/session.js` — Session store with auth tokens and user info.
- `components/WatchlistView.svelte` — Main watchlist UI.
- `components/WatchlistDetails.svelte` — Table view for watchlist entries.
- `components/SymbolSearch.svelte` — Search UI for adding new symbols.

### 7. AI
This project was built with assistance from ChatGPT 5 but mainly coded by hand in VS Code.
