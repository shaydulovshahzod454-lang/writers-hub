import apiClient from './client';

export async function getChapters(projectId) {
  const response = await apiClient.get(`/chapters/?project=${projectId}`);
  return response.data;
}

export async function createChapter(data) {
  const response = await apiClient.post('/chapters/', data);
  return response.data;
}

export async function getChapter(id) {
  const response = await apiClient.get(`/chapters/${id}/`);
  return response.data;
}

export async function updateChapter(id, data) {
  const response = await apiClient.patch(`/chapters/${id}/`, data);
  return response.data;
}