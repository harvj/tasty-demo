<script>
  import { searchSymbols, updateWatchlist } from '../lib/api';

  export let events = {};
  export let mode = 'new';
  export let selectedEntries = [];
  export let watchlistName = '';

  let searchTerm = '';
  let searchResults = [];
  let loading = false;

  async function doSearch() {
    if (!searchTerm.trim()) {
      searchResults = [];
      return;
    }
    loading = true;
    const response = await searchSymbols(searchTerm);
    loading = false;
    if (response.success) {
      searchResults = response.result.data.items;
    } else {
      searchResults = [];
    }
  }

  async function addSymbol(symbol) {
    if (isSelected(symbol)) return;

    if (mode === 'new') {
      events.selectSymbol({ symbol });
    } else if (mode === 'existing' && watchlistName) {
      const response = await updateWatchlist(watchlistName, [...selectedEntries, { symbol }]);
      if (response.success) {
        events.addWatchlistEntry({ symbol });
      }
    }
  }

  function isSelected(symbol) {
    return selectedEntries.some(e => e.symbol === symbol);
  }

  function clearSearch() {
    searchTerm = '';
    searchResults = [];
  }
</script>

<div class="symbol-search">
  <h2>Search Symbols</h2>
  <input
    type="text"
    placeholder="Search symbols..."
    bind:value={searchTerm}
    on:input={doSearch}
  />
  {#if searchTerm.length > 0}
    <button
      class="clear"
      on:click={clearSearch}
    >
      Clear Search
    </button>
  {/if}

  {#if loading}
    <div class="loading">Searching...</div>
  {/if}

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

<style>
  .symbol-search {
    background-color: #f0f7ff;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    border: 1px solid #d6e4f5;
  }

  .symbol-search h2 {
    margin-top: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a4b7c;
  }

  .symbol-search input {
    border: 1px solid #c3d9f0;
    margin-right: 10px;
  }

  .symbol-search input:focus {
    border-color: #4a90e2;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
  }

  .add-btn {
    background-color: #4a90e2;
    color: white;
  }

  .add-btn:hover {
    background-color: #357ab8;
  }

  button.clear {
    all: unset;
    cursor: pointer;
    display: inline-block;
    font-style: italic;
    color: #6d8196;
  }
</style>
