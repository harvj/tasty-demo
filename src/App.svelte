<script>
  import { session } from './stores/session.js';
  import Login from './lib/Login.svelte';
</script>

<main>
  <h1>Welcome!</h1>
  {#if $session}
    You are logged in as {$session.user}
  {:else}
    <Login />
  {/if}
</main>
