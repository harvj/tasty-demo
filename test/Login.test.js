import { render, screen, fireEvent } from '@testing-library/svelte';
import { vi, describe, it, expect } from 'vitest';
import Login from '../src/components/Login.svelte';
import { session } from '../src/stores/session';

describe('Login', () => {
  it('sets session on successful login', async () => {
    // Mock fetch to return fake token
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: {
            user: { username: 'jimharvey' },
            'session-token': 'fake-token'
          }
        })
      })
    ));

    render(Login);

    // Fill in username/password
    await fireEvent.input(screen.getByPlaceholderText(/Username/i), {
      target: { value: 'jimharvey' }
    });
    await fireEvent.input(screen.getByPlaceholderText(/Password/i), {
      target: { value: 'secret' }
    });

    // Submit form
    await fireEvent.submit(screen.getByRole('button', { name: /Login/i }));

    // Assert store updated
    let storeValue;
    session.subscribe(v => (storeValue = v))();
    expect(storeValue).toEqual({
      user: { username: 'jimharvey' },
      token: 'fake-token'
    });
  });

  it('shows error message on failed login', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({ ok: false })
    ));

    render(Login);

    await fireEvent.input(screen.getByPlaceholderText(/Username/i), {
      target: { value: 'foobar' }
    });
    await fireEvent.input(screen.getByPlaceholderText(/Password/i), {
      target: { value: 'wrong' }
    });

    await fireEvent.submit(screen.getByRole('button', { name: /Login/i }));

    expect(await screen.findByText(/Invalid username or password/i)).toBeInTheDocument();
  });
});
