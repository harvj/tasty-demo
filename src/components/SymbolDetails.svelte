<script>
  import Plotly from 'plotly.js-dist-min';
  import { session } from "../stores/session";
  import { candles, connectCandles, disconnectQuotes } from '../stores/quotes';

  let chartEl;

  $: liveCandles = $candles;

  $: if ($session?.symbol) {
    candles.set([]);
    disconnectQuotes();
    connectCandles();
  }

  $: if (liveCandles.length && chartEl) {
    drawChart();
  }

  function drawChart() {
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
      title: 'Price over last 24 hours',
      xaxis: { type: 'date' },
      yaxis: { autorange: true }
    };
    Plotly.newPlot(chartEl, [trace], layout);
  }
</script>

<h2>Symbol: { $session.symbol }</h2>
<h3>Last: { $session.lastPrice }</h3>

<div bind:this={chartEl}></div>
