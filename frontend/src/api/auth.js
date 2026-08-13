import apiClient from './client';

export async function login(username, password) {
  const response = await apiClient.post('/token/', { username, password });
  localStorage.setItem('access_token', response.data.access);
  localStorage.setItem('refresh_token', response.data.refresh);
  return response.data;
}

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

export function isAuthenticated() {
  return !!localStorage.getItem('access_token');
}