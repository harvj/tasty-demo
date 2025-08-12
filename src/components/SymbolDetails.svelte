<script>
  import Plotly from 'plotly.js-dist-min';
  import { session } from "../stores/session";
  import { candles, subscribeCandles, disconnectQuotes } from '../stores/quotes';
  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';

  let chartEl;

  $: liveCandles = $candles;

  $: if ($session?.symbol) {
    candles.set([]);
    subscribeCandles();
  }

  $: if ($session?.symbol && $candles.length && chartEl) {
    const cData = $candles;
    const trace = {
      x: cData.map(c => c.time),
      open: cData.map(c => c.open),
      high: cData.map(c => c.high),
      low: cData.map(c => c.low),
      close: cData.map(c => c.close),
      type: 'candlestick',
      xaxis: 'x',
      yaxis: 'y'
    };
    const layout = {
      title: `${$session.symbol} - Price over last 24 hours`,
      xaxis: { type: 'date' },
      yaxis: { autorange: true }
    };

    Plotly.react(chartEl, [trace], layout);
  }

  function backToWatchlist() {
    session.update(s => ({ ...s, symbol: null, lastPrice: null }));
  }

  onMount(() => {
    const start = () => {
      const { symbol, dxlinkUrl, apiQuoteToken } = get(session);
      if (symbol && dxlinkUrl && apiQuoteToken) {
        candles.set([]);
        subscribeCandles(symbol);
        return true;
      }
      return false;
    };

    if (!start()) {
      const unsub = session.subscribe(s => {
        if (s.symbol && s.dxlinkUrl && s.apiQuoteToken) {
          candles.set([]);
          subscribeCandles(s.symbol);
          unsub();
        }
      });
    }
  });

  onDestroy(() => {
    disconnectQuotes();
  });
</script>

<h2>Symbol: { $session.symbol }</h2>
<h3>Last: { $session.lastPrice }</h3>

<div bind:this={chartEl}></div>

<p>
  <button on:click={backToWatchlist}>
    Back to Watchlist: {$session.watchlist}
  </button>
</p>

<style>
  button {
    all: unset;
    cursor: pointer;
    font-style: italic;
    color: #1a4b7c;
  }
</style>
