import { render, screen, fireEvent } from '@testing-library/svelte';
import { vi, describe, it, expect } from 'vitest';
import Logout from '../src/components/Logout.svelte';
import { session } from '../src/stores/session';

describe('Logout', () => {
  it('clears session on logout', async () => {
    session.set({ user: { username: 'jimharvey' }, token: 'fake-token' });

    // Mock fetch to simulate API success
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true })));

    render(Logout);

    await fireEvent.click(screen.getByRole('button', { name: /Logout/i }));

    let storeValue;
    session.subscribe(v => (storeValue = v))();
    expect(storeValue).toBeNull();
  });
});
