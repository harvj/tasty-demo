<script>
  import Watchlists from './Watchlists.svelte';
  let watchlistsRef;

  export function refreshWatchlists() {
    watchlistsRef?.loadWatchlists();
  }
</script>

<div class="sidebar">
  <Watchlists bind:this={watchlistsRef} />
</div>

<style>
  .sidebar {
    color: white;
    background-color: #1f1f1f;
    padding: 1rem 1rem 1rem 4rem;
    height: calc(100vh - 60px); /* Adjust if Navbar height changes */
    overflow-y: auto;
    position: fixed;
    right: 0;
    top: 60px; /* height of the navbar */
    text-align: right;
  }
</style>
