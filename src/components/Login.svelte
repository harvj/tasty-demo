<script>
  import { session } from '../stores/session.js';

  let username = '';
  let password = '';
  let errorMessage = '';

  async function login() { 
    errorMessage = '';
    try {
      const response = await fetch('https://api.cert.tastyworks.com/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: username, password })
      });

      if (response.ok) {
        const data = await response.json();
        session.set({
          user: {
            username: data.data.user.username,
            email: data.data.user.email
          },
          token: data.data['session-token']
        });
      } else {
        errorMessage = 'Invalid username or password.';
        session.set(null);
      }
    } catch (err) {
      console.error(err);
      errorMessage = 'Unable to connect to the server. Please try again.';
      session.set(null);
    }
  }
</script>

<form on:submit|preventDefault={login}>
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