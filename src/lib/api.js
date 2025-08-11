import { get } from 'svelte/store';
import { session } from '../stores/session.js';

const API_BASE_URL = 'https://api.cert.tastyworks.com';

/**
 * Core request helper
 * - method: 'GET', 'POST', 'DELETE', etc.
 * - endpoint: '/path'
 * - body: JS object (will be JSON.stringified)
 */
async function request(method, endpoint, body) {
  const token = get(session)?.token;

  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'jimharvey-client/0.0.1'
  };

  if (token) {
    headers.Authorization = token;
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`
    console.log(`Fetching ${url}`)
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const message = response.status === 401 ? '401 Unauthorized' : `API ${method} ${endpoint} failed: ${await response.text()}`
      console.error(message)
      return { success: false, message };
    }

    const contentType = response.headers?.get?.('content-type') || '';
    if (!contentType.includes('application/json')) {
      return { success: true, result: null };
    }

    const result = await response.json();
    console.log(result)
    return { success: true, result };
  } catch (err) {
    console.error(err);
    return { success: false, message: err.message };
  }
}

export async function login(username, password) {
  const response = await request('POST', '/sessions', {
    login: username,
    password
  });

  if (response.success && response.result?.data) {
    session.set({
      user: {
        username: response.result.data.user.username,
        email: response.result.data.user.email
      },
      token: response.result.data['session-token']
    });
  } else {
    session.set(null);
    response.message = response.message?.includes('401')
      ? 'Invalid username or password.'
      : response.message || 'Unable to connect to the server. Please try again.';
  }

  return response;
}

export async function logout() {
  const response = await request('DELETE', '/sessions');
  session.set(null);
  return response;
}

export async function getApiQuoteToken() {
  const response = await request('GET', '/api-quote-tokens');

  if (response.success && response.result?.data) {
    session.update(current => ({
      ...current,
      apiQuoteToken: response.result.data.token,
      dxlinkUrl: response.result.data['dxlink-url']
    }));
  }
  console.log(get(session));
}

export async function getWatchlist(name) {
  return request('GET', `/watchlists/${encodeURIComponent(name)}`);
}

export async function getWatchlists() {
  return request('GET', '/watchlists');
}

export async function createWatchlist(name, entries) {
  return request('POST', '/watchlists', { name, "watchlist-entries": entries });
}

export async function updateWatchlist(name, entries) {
  return request('PUT', `/watchlists/${encodeURIComponent(name)}`, { name, "watchlist-entries": entries });
}

export async function deleteWatchlist(name) {
  return request('DELETE', `/watchlists/${encodeURIComponent(name)}`);
}

export async function searchSymbols(query) {
  return request('GET', `/symbols/search/${encodeURIComponent(query)}`);
}

export default {
  getWatchlists,
  createWatchlist,
  deleteWatchlist,
  login,
  logout
};
