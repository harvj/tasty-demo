<script>
  import { session } from '../stores/session';
  import { getWatchlist, createWatchlist, deleteWatchlist } from '../lib/api';
  import { onMount } from 'svelte';
  import SymbolSearch from './SymbolSearch.svelte';

  export let events = {};

  let watchlistData = null;
  let errorMessage = '';
  let newName = '';
  let searchTerm = '';
  let searchResults = [];
  let selectedEntries = [];
  let lastWatchlist = '';

  $: if ($session?.watchlist && $session.watchlist !== lastWatchlist) {
    lastWatchlist = $session.watchlist;
    fetchWatchlist();
  }

  async function fetchWatchlist() {
    if ($session?.watchlist) {
      const { success, result, message } = await getWatchlist($session.watchlist);
      if (success) {
        watchlistData = result.data;
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
      watchlistData = null;
      await fetchWatchlist();
      events.watchlistsChanged?.();
    } else {
      errorMessage = message;
    }
  }

  async function handleDelete(name) {
    const { success, message } = await deleteWatchlist(name);
    if (success) {
      session.set({ ...$session, watchlist: null });
      watchlistData = null;
      events.watchlistsChanged?.();
    } else {
      errorMessage = message;
    }
  }

  function deselectSymbol(symbol) {
    selectedEntries = selectedEntries.filter(entry => entry.symbol !== symbol);
  }

  onMount(fetchWatchlist);
</script>

{#if !$session?.watchlist}
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
  {#if watchlistData}
    <h2>Watchlist: <span class="name">{watchlistData.name}</span></h2>
    <ul>
      {#each watchlistData['watchlist-entries'] as entry}
        <li>{entry.symbol}</li>
      {/each}
    </ul>
    <button
      class="delete"
      on:click={() => handleDelete(watchlistData.name)}
    >
      Delete Watchlist
    </button>
  {:else}
    {#if errorMessage}<p class="error">{errorMessage}</p>{/if}
    <p>Loading watchlist...</p>
  {/if}
{/if}

<style>
  h2 span.name {
    color: #6a6a6a;
  }

  .selected-symbols {
    font-size: 1.17em;
    font-weight: bold;
    margin: 1em 0;
  }

  .remove-btn {
    background-color: #e24a4a;
    color: white;
  }

  .remove-btn:hover {
    background-color: #b83535;
  }

  .symbol-item {
    margin-right: 0.5rem;
    font-weight: normal;
  }
</style>
