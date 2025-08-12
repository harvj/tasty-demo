# tastytrade Watchlist Demo

This is a Svelte 5 application for viewing live market quotes and candle charts via the DxLink WebSocket feed and tastytrade REST API.

It includes:
- Full watchlist management
- Live bid/ask/last quote updates.
- Historical and live candle data (e.g., 24 hours at 5-minute intervals).
- Plotly-based candlestick chart.
- Full Svelte component structure with reactive WebSocket subscriptions.

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/harvj/tasty-demo.git
cd tasty-demo
