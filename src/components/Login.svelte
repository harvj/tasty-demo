<script>
  import { login, getApiQuoteToken } from '../lib/api';

  let username = '';
  let password = '';
  let errorMessage = '';

  async function handleLogin() {
    errorMessage = '';
    const result = await login(username, password);

    if (result.success) {
      await getApiQuoteToken();
    } else {
      errorMessage = result.message;
    }
  }
</script>

<div class='login-wrapper'>
  <form on:submit|preventDefault={handleLogin}>
    <input type="text" placeholder="Username" bind:value={username} />
    <input type="password" placeholder="Password" bind:value={password} />
    <button type="submit">Login</button>

    {#if errorMessage}
      <p class="error">{errorMessage}</p>
    {/if}
  </form>
</div>

<style>
  .login-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: calc(100vh - 60px); /* Adjust if navbar height changes */
  }

  .error {
    margin-top: 0.5rem;
  }
</style>
