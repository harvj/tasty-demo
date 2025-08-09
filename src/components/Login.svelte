<script>
  import { login } from '../lib/api.js';

  let username = '';
  let password = '';
  let errorMessage = '';

  async function handleLogin() {
    errorMessage = '';
    const result = await login(username, password);

    if (!result.success) {
      errorMessage = result.message;
    }
  }
</script>

<form on:submit|preventDefault={handleLogin}>
  <input type="text" placeholder="Username" bind:value={username} />
  <input type="password" placeholder="Password" bind:value={password} />
  <button type="submit">Login</button>

  {#if errorMessage}
    <p class="error">{errorMessage}</p>
  {/if}
</form>


<style>
  .error {
    color: red;
    margin-top: 0.5rem;
  }
</style>