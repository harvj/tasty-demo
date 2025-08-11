<script>
  import { session } from '../stores/session';
  import { logout } from '../lib/api';
</script>

{#if $session}
  <span>Logged in as {$session.user.username}</span>
  <button type="button" on:click={logout}>Logout</button>
{/if}
