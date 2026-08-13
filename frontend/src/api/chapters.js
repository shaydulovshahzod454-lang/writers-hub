import apiClient from './client';

export async function getChapters(projectId) {
  const response = await apiClient.get(`/chapters/?project=${projectId}`);
  return response.data;
}

export async function createChapter(data) {
  const response = await apiClient.post('/chapters/', data);
  return response.data;
}