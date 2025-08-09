<script>
  import { onDestroy } from 'svelte';
  import { session } from '../stores/session.js';
  import api from '../lib/api.js';

  let watchlists = [];
  let error = null;

  // Subscribe to the session store
  const unsubscribe = session.subscribe(async (current) => {
    if (current?.token) {
      try {
        error = null;
        watchlists = await api.getWatchlists();
      } catch (err) {
        console.error(err);
        error = 'Failed to load watchlists';
      }
    } else {
      watchlists = [];
    }
  });

  onDestroy(unsubscribe);
</script>

{#if error}
  <p style="color: red">{error}</p>
{:else if watchlists.length === 0}
  <p>No watchlists found.</p>
{:else}
  <ul>
    {#each watchlists as w}
      <li>
        <strong>{w.name}</strong>
        {#if w['group-name']}
          — {w['group-name']}
        {/if}
      </li>
    {/each}
  </ul>
{/if}
