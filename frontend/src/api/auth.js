import apiClient from './client';

export async function login(email, password) {
  const response = await apiClient.post('/token/', { username: email, password });
  localStorage.setItem('access_token', response.data.access);
  localStorage.setItem('refresh_token', response.data.refresh);
  try {
    const me = await apiClient.get('/me/');
    localStorage.setItem('display_name', me.data.first_name || email);
  } catch {
    localStorage.setItem('display_name', email);
  }
  return response.data;
}

export async function register(fullName, email, password) {
  const response = await apiClient.post('/register/', {
    full_name: fullName,
    email,
    password,
  });
  return response.data;
}

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('display_name');
}

export function isAuthenticated() {
  return !!localStorage.getItem('access_token');
}

export function getUsername() {
  return localStorage.getItem('display_name');
}