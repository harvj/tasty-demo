<script>
  import { session } from './stores/session';
  import Login from './components/Login.svelte';
  import Navbar from './components/Navbar.svelte';
  import Sidebar from './components/Sidebar.svelte';
  import { onDestroy } from 'svelte';

  let loggedIn = false;
  const unsubscribe = session.subscribe(s => {
    loggedIn = !!s?.token;
  });
  onDestroy(unsubscribe);
</script>

<Navbar />

{#if loggedIn}
  <div class="main-content with-sidebar">
    <h1>Welcome!</h1>
  </div>
  <Sidebar />
{:else}
  <Login />
{/if}

<style>
  .main-content {
    padding: 1rem;
    margin-top: 60px; /* navbar height */
    transition: margin-right 0.3s ease;
  }

  .with-sidebar {
    margin-right: 300px; /* sidebar width */
  }
</style>
