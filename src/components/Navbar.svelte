<script>
  import Logout from './Logout.svelte';
</script>

<nav class="navbar">
  <div class="nav-left">
    <h1>Watchlist Demo 🍒</h1>
  </div>
  <div class="nav-right">
    <Logout />
  </div>
</nav>

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
</style>
