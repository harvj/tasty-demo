<script>
  import { session } from './stores/session';
  import Login from './components/Login.svelte';
  import Navbar from './components/Navbar.svelte';
  import Sidebar from './components/Sidebar.svelte';
  import WatchlistView from './components/WatchlistView.svelte';
  import { onDestroy } from 'svelte';

  let sidebarRef;
  let loggedIn = false;

  function handleWatchlistsChanged() {
    sidebarRef.refreshWatchlists();
  }
  const unsubscribe = session.subscribe(s => {
    loggedIn = !!s?.token;
  });
  onDestroy(unsubscribe);
</script>

<Navbar />

{#if loggedIn}
  <div class='layout'>
    <div class="main-content">
      <WatchlistView events={{ watchlistsChanged: handleWatchlistsChanged }} />
    </div>
    <Sidebar bind:this={sidebarRef} />
  </div>
{:else}
  <Login />
{/if}

<style>
.layout {
  display: grid;
  grid-template-columns: auto minmax(auto, 300px);
  height: 100%;
}

.main-content {
  padding: 1rem;
}
</style>
