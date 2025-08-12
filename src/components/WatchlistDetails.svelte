<script>
  import { onMount, onDestroy } from 'svelte';
  import { updateWatchlist } from '../lib/api';
  import { quotes, subscribeQuotesAndTrades, disconnectQuotes, fetchInitialQuotes, trades } from '../stores/quotes';
  import { session } from '../stores/session';
  import { get } from 'svelte/store';

  export let events = {};
  export let watchlistName = '';
  export let entries = [];

  $: liveQuotes = $quotes;
  $: liveTrades = $trades;

  async function removeEntry(symbol) {
    entries = entries.filter(e => e.symbol !== symbol)
    const response = await updateWatchlist(watchlistName, entries);
    if (response.success) {
      events.removeWatchlistEntry?.();
    } else {
      console.error(`Failed to remove ${symbol} from ${watchlistName}`);
    }
  }

  $: {
    if (entries.length > 0) {
      const symbols = entries.map(e => e.symbol);
      fetchInitialQuotes(symbols);
      subscribeQuotesAndTrades(symbols);
    } else {
      disconnectQuotes();
    }
  }

  function selectSymbol(symbol, lastPrice) {
    session.update(s => ({ ...s, symbol, lastPrice }));
  }

  function formatPrice(value) {
    return (typeof value === 'number') ? `$${value.toFixed(2)}` : '--';
  }

  onMount(() => {
    const start = () => {
      const symbols = entries.map(e => e.symbol);
      const { dxlinkUrl, apiQuoteToken } = get(session);
      if (symbols.length && dxlinkUrl && apiQuoteToken) {
        subscribeQuotesAndTrades(symbols);
        fetchInitialQuotes(symbols);
        return true;
      }
      return false;
    };

    if (!start()) {
      const unsub = session.subscribe(s => {
        if (entries.length && s.dxlinkUrl && s.apiQuoteToken) {
          const symbols = entries.map(e => e.symbol);
          subscribeQuotesAndTrades(symbols);
          fetchInitialQuotes(symbols);
          unsub();
        }
      });
    }
  });

  onDestroy(() => {
    disconnectQuotes();
  });
</script>

<div class="watchlist-details">
  <h2>Watchlist: <span class="name">{watchlistName}</span></h2>
  <p>Click on symbol name for candle view</p>
  <table>
    <thead>
      <tr>
        <th></th>
        <th>Symbol</th>
        <th class="d">Bid</th>
        <th class="d">Ask</th>
        <th class="d">Last</th>
      </tr>
    </thead>
    <tbody>
      {#each entries as entry}
        <tr>
          <td>
            <button class="small-btn remove-btn" on:click={() => removeEntry(entry.symbol)}>-</button>
          </td>
          <td>
            <button class="symbol" on:click={() => {
              selectSymbol(entry.symbol, formatPrice(liveTrades[entry.symbol]?.last))
            }}
            >
              {entry.symbol}
            </button>
          </td>
          <td class="d">{formatPrice(liveQuotes[entry.symbol]?.bid)}</td>
          <td class="d">{formatPrice(liveQuotes[entry.symbol]?.ask)}</td>
          <td class="d">{formatPrice(liveTrades[entry.symbol]?.last)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  button.symbol {
    all: unset;
    cursor: pointer;
  }
  button.symbol:hover {
    font-weight: bold;
  }

  h2 span.name {
    color: #6a6a6a;
  }

  .watchlist-details table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }

  .watchlist-details th,
  .watchlist-details td {
    padding: 0.5rem;
    border-bottom: 1px solid var(--border-color, #eee);
    text-align: left;
  }
  .watchlist-details th.d {
    text-align: right;
  }
  .watchlist-details td.d {
    font-family:'Courier New', Courier, monospace;
    text-align: right;
  }
</style>
