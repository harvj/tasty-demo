<script>
  import { session } from '../stores/session';
  import { getWatchlist, createWatchlist, updateWatchlist, searchSymbols } from '../lib/api';
  import { onMount } from 'svelte';

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
      errorMessage = 'Please enter a name and add at least one symbol.';
      return;
    }
    const { success, message } = await createWatchlist(newName, selectedEntries);
    if (success) {
      session.set({ ...$session, watchlist: newName });
      watchlistData = null;
      await fetchWatchlist();
    } else {
      errorMessage = message;
    }
  }

  async function handleSearch() {
    if (searchTerm.length < 3) {
      searchResults = [];
      return;
    }
    const { success, result } = await searchSymbols(searchTerm);
    if (success) {
      searchResults = result.data.items;
    }
  }

  function addSymbol(symbol) {
    if (!selectedEntries.find(e => e.symbol === symbol)) {
      selectedEntries = [...selectedEntries, { symbol }];
    }
  }

  function removeSymbol(symbol) {
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
            on:click={() => removeSymbol(e.symbol)}
          >−</button>
        </span>
      {/each}
    {:else}
      None
    {/if}
  </div>

  <div class='search-symbols'>
    <h2>Search Symbols</h2>
    <input placeholder="Search Symbol" bind:value={searchTerm} on:input={handleSearch} />
    {#if searchResults.length}
      <ul>
        {#each searchResults as result}
          <li>
            {result.symbol} - {result.description}
            {#if !selectedEntries.some(entry => entry.symbol === result.symbol)}
              <button
                class="small-btn add-btn"
                on:click={() => addSymbol(result.symbol)}
              >+</button>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </div>

{:else}
  {#if watchlistData}
    <h2>Watchlist: <span class="name">{watchlistData.name}</span></h2>
    <ul>
      {#each watchlistData['watchlist-entries'] as entry}
        <li>{entry.symbol}</li>
      {/each}
    </ul>
  {:else}
    {#if errorMessage}<p class="error">{errorMessage}</p>{/if}
    <p>Loading watchlist...</p>
  {/if}
{/if}

<style>
  .error { color: red; }

  h2 span.name {
    color: #6a6a6a;
  }

  .selected-symbols {
    font-size: 1.17em;
    font-weight: bold;
    margin: 1em 0;
  }

  .search-symbols {
    background-color: #f0f7ff; /* light blue */
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06); /* subtle depth */
    border: 1px solid #d6e4f5; /* soft border */
  }

  .search-symbols h2 {
    margin-top: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a4b7c; /* deep blue for heading */
  }

  .search-symbols input {
    border: 1px solid #c3d9f0;
    /* border-radius: 4px; */
    /* padding: 0.5rem;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease; */
  }

  .search-symbols input:focus {
    border-color: #4a90e2;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
  }

  .small-btn {
    padding: 0.15rem 0.4rem;
    font-size: 0.85rem;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    margin-left: 0.3rem;
  }

  .add-btn {
    background-color: #4a90e2;
    color: white;
  }

  .add-btn:hover {
    background-color: #357ab8;
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
  }
</style>
