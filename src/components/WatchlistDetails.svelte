<script>
  import { updateWatchlist } from '../lib/api';
  import { quotes, connectQuotes, disconnectQuotes } from '../stores/quotes';
  import { onDestroy } from 'svelte';

  export let events = {};
  export let watchlistName = '';
  export let entries = [];

  $: liveQuotes = $quotes;

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
      disconnectQuotes();
      connectQuotes(entries.map(e => e.symbol));
    } else {
      disconnectQuotes();
    }
  }

  function formatPrice(value) {
    return (typeof value === 'number') ? `$${value.toFixed(2)}` : '--';
  }

  onDestroy(() => {
    disconnectQuotes();
  });

</script>

<div class="watchlist-details">
  <h2>Watchlist: <span class="name">{watchlistName}</span></h2>
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
          <td>{entry.symbol}</td>
          <td class="d">{formatPrice(liveQuotes[entry.symbol]?.bid)}</td>
          <td class="d">{formatPrice(liveQuotes[entry.symbol]?.bid)}</td>
          <td class="d">{formatPrice(liveQuotes[entry.symbol]?.bid)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
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
