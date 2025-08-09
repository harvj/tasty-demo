<script>
  import { session } from '../stores/session';
  import { get } from 'svelte/store';

  async function logout() {
    try {
      const current = get(session);

      if (current?.token) {
        const response = await fetch('https://api.cert.tastyworks.com/sessions', {
          method: 'DELETE',
          headers: {
            Authorization: current.token,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          session.set(null);
        } else {
          console.error('Logout failed.');
        }
      } else {
        console.warn('No session token found.');
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  }
</script>

<button type="button" on:click={logout}>Logout</button>
