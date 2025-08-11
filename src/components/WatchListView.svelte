<script>
  import { session } from '../stores/session';
  import { getWatchlist, createWatchlist, deleteWatchlist } from '../lib/api';
  import { onMount } from 'svelte';
  import SymbolSearch from './SymbolSearch.svelte';
  import WatchlistDetails from './WatchlistDetails.svelte';

  export let events = {};

  let errorMessage = '';
  let newName = '';
  let watchlistName = '';
  let watchlistEntries = [];
  let selectedEntries = [];
  let lastWatchlist = '';

  $: watchlistName = $session?.watchlist

  $: if (watchlistName && watchlistName !== lastWatchlist) {
    lastWatchlist = watchlistName;
    refreshState();
    refreshWatchlist();
  }

  async function refreshWatchlist() {
    if (watchlistName) {
      const { success, result, message } = await getWatchlist(watchlistName);
      if (success) {
        watchlistEntries = result.data['watchlist-entries'];
      } else {
        errorMessage = message;
      }
    }
  }

  async function handleCreate() {
    if (!newName || selectedEntries.length === 0) {
      errorMessage = 'Please enter a name and add at least one symbol by searching below.';
      return;
    }
    const { success, message } = await createWatchlist(newName, selectedEntries);
    if (success) {
      session.set({ ...$session, watchlist: newName });
      await refreshWatchlist();
      events.watchlistsChanged?.();
    } else {
      errorMessage = message;
    }
  }

  async function handleDelete() {
    const { success, message } = await deleteWatchlist(watchlistName);
    if (success) {
      session.set({ ...$session, watchlist: null });
      refreshState();
      events.watchlistsChanged?.();
    } else {
      errorMessage = message;
    }
  }

  function refreshState() {
    errorMessage = '';
    newName = '';
    selectedEntries = [];
    watchlistEntries = [];
  }

  function deselectSymbol(symbol) {
    selectedEntries = selectedEntries.filter(entry => entry.symbol !== symbol);
  }

  onMount(refreshWatchlist);
</script>

{#if !watchlistName}
  <h2>Create New Watchlist</h2>
  {#if errorMessage}<p class="error">{errorMessage}</p>{/if}
  <input placeholder="Watchlist Name" bind:value={newName} />
  <button on:click={handleCreate}>Create Watchlist</button>
  <div class="selected-symbols">
    <strong>Selected Symbols:</strong>
    {#if selectedEntries.length > 0}
      {#each selectedEntries as e, i}
        <span class="symbol-item">
          {e.symbol}
          <button
            class="small-btn remove-btn"
            on:click={() => deselectSymbol(e.symbol)}
          >−</button>
        </span>
      {/each}
    {:else}
      <span class="symbol-item">None</span>
    {/if}
  </div>

  <SymbolSearch
    mode="new"
    {selectedEntries}
    events={{
      selectSymbol: (entry) => selectedEntries = [...selectedEntries, entry]
    }}
  />

{:else}
  {#if watchlistEntries}
    <WatchlistDetails
      {watchlistName}
      entries={watchlistEntries}
      events={{
        removeWatchlistEntry: () => refreshWatchlist()
      }}
    />

    <SymbolSearch
      mode="existing"
      {watchlistName}
      selectedEntries={watchlistEntries}
      events={{
        addWatchlistEntry: () => refreshWatchlist()
      }}
    />

    <button
      class="delete"
      on:click={handleDelete}
    >
      Delete Watchlist
    </button>
  {:else}
    {#if errorMessage}<p class="error">{errorMessage}</p>{/if}
    <p>Loading watchlist...</p>
  {/if}
{/if}

<style>
  .selected-symbols {
    font-size: 1.17em;
    font-weight: bold;
    margin: 1em 0;
  }

  .symbol-item {
    margin-right: 0.5rem;
    font-weight: normal;
  }

  button.delete {
    margin-top: 20px;
  }
</style>
