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

  const url = `${API_BASE_URL}${endpoint}`
  console.log(`Fetching ${url}`)
  const response = await fetch(url, {
    method, 
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('401 Unauthorized')
    }
    const errMsg = await response.text();
    throw new Error(`API ${method} ${endpoint} failed: ${errMsg}`);
  }

  return response.json();
}

export async function login(username, password) {
  try {
    const result = await request('POST', '/sessions', {
      login: username,
      password
    });

    session.set({
      user: {
        username: result.data.user.username,
        email: result.data.user.email
      },
      token: result.data['session-token']
    });

    return result;
  } catch (err) {
    console.error(err);
    session.set(null);
    return {
      success: false,
      message: err.message.includes('401')
        ? 'Invalid username or password.'
        : 'Unable to connect to the server. Please try again.'
    };
  }
}

export async function getWatchlists() {
  const result = await request('GET', '/watchlists');
  return result.data.items;
}

export default {
  getWatchlists,
  login
};
