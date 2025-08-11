<script>
  import { session } from '../stores/session';
  import { onMount } from 'svelte';
  import { getWatchlists } from '../lib/api';

  let watchlists = [];
  let errorMessage = '';

  export async function loadWatchlists() {
    errorMessage = '';
    const { success, result, message } = await getWatchlists();
    if (success) {
      watchlists = result.data.items;
      session.update(s => ({ ...s, watchlist: watchlists[0]?.name }));
    } else {
      watchlists = [];
      errorMessage = message;
    }
  }

  function selectWatchlist(name) {
    session.update(s => ({ ...s, watchlist: name }));
  }

  onMount(loadWatchlists);
</script>

{#if errorMessage}
  <div class="error">{errorMessage}</div>
{/if}

<h2>Watchlists</h2>

{#if watchlists.length > 0}
  <ul>
    {#each watchlists as wl}
      <li>
        <button
          class:active={$session?.watchlist === wl.name}
          disabled={$session?.watchlist === wl.name}
          type="button"
          on:click={() => selectWatchlist(wl.name)}
        >
          {wl.name}
        </button>
      </li>
    {/each}
  </ul>
{:else}
  <p>No watchlists found.</p>
{/if}

{#if $session?.watchlist}
  <div class='new-watchlist'>
    <button
      type="button"
      on:click={() => selectWatchlist(null)}
    >
      Create New Watchlist
    </button>
  </div>
{/if}

<style>
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    cursor: pointer;
    padding: 0.25rem 0;
  }

  .active {
    font-weight: bold;
    cursor: default;
  }

  button {
    all: unset;
    cursor: pointer;
    display: inline-block;
    text-align: right;
    width: 100%;
    padding: 0.25rem 0;
  }

  .new-watchlist {
    margin-top: 20px;
  }

  .new-watchlist button {
    font-style: italic;
    color: lightblue;
  }

  .error {
    margin-bottom: 8px;
  }
</style>
