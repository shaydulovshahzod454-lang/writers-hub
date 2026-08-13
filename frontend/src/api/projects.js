import apiClient from './client';

export async function getProjects() {
  const response = await apiClient.get('/projects/');
  return response.data;
}

export async function createProject(data) {
  const response = await apiClient.post('/projects/', data);
  return response.data;
}