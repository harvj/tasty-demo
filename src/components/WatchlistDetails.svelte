<script>
  import { updateWatchlist } from '../lib/api';

  export let events = {};
  export let watchlistName = '';
  export let entries = [];

  async function removeEntry(symbol) {
    const response = await updateWatchlist(watchlistName, entries.filter(e => e.symbol !== symbol));
    if (response.success) {
      events.removeWatchlistEntry?.();
    } else {
      console.error(`Failed to remove ${symbol} from ${watchlistName}`);
    }
  }

</script>

<div class="watchlist-details">
  <h2>Watchlist: <span class="name">{watchlistName}</span></h2>
  <table>
    <thead>
      <tr>
        <th></th>
        <th>Symbol</th>
        <!-- Add other columns if needed -->
      </tr>
    </thead>
    <tbody>
      {#each entries as entry}
        <tr>
          <td>
            <button class="small-btn remove-btn" on:click={() => removeEntry(entry.symbol)}>-</button>
          </td>
          <td>{entry.symbol}</td>
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
  }

  .watchlist-details th,
  .watchlist-details td {
    padding: 0.5rem;
    border-bottom: 1px solid var(--border-color, #eee);
    text-align: left;
  }
</style>
