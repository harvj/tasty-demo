import { writable } from "svelte/store"; 

const storedSession = localStorage.getItem('session');
export const session = writable(storedSession ? JSON.parse(storedSession) : null);

session.subscribe(value => {
  if (value) {
    localStorage.setItem('session', JSON.stringify(value));
  } else {
    localStorage.removeItem('session');
  }
})