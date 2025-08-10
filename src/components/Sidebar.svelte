<script>
  import Watchlists from './Watchlists.svelte';
</script>

<div class="sidebar">
  <Watchlists />
</div>

<style>
  .sidebar {
    width: 300px;
    color: white;
    background-color: #1f1f1f;
    padding: 1rem;
    border-left: 1px solid #333;
    height: calc(100vh - 60px); /* Adjust if Navbar height changes */
    overflow-y: auto;
    position: fixed;
    right: 0;
    top: 60px; /* height of the navbar */
  }
</style>
