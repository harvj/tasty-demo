<script>
  import { session } from './stores/session';
  import Login from './components/Login.svelte';
  import Logout from './components/Logout.svelte';
</script>

<nav class="navbar">
  <div class="nav-left">
    <h1>Watchlist Demo 🍒</h1>
  </div>
  <div class="nav-right">
    {#if $session}
      <span>Logged in as {$session.user.username}</span>
      <Logout />
    {/if}
  </div>
</nav>

<main>
  {#if $session}
    <h2>Welcome!</h2>
    <!-- replace with your app's main content -->
  {:else}
    <Login />
  {/if}
</main>

<style>
  .navbar {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background-color: #222;
    color: #fff;
    box-sizing: border-box;
  }

  .nav-left h1 {
    font-size: 1.25rem;
    margin: 0;
  }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: calc(100vh - 60px); /* subtract navbar height */
    text-align: center;
  }

  h2 {
    margin: 0;
  }
</style>
