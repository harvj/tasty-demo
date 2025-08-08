<script>
  import { session } from '../stores/session.js';

  let username = '';
  let password = '';

  function handleLogin() { 
    session.set({ user: username, token: 'fake-token' })
  }
</script>

<form on:submit|preventDefault={handleLogin}>
  <input type="text" placeholder="Username" bind:value={username} />
  <input type="password" placeholder="Password" bind:value={password} />
  <button type="submit">Log In</button>
</form>