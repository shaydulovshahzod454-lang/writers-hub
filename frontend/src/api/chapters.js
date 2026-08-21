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

export async function reorderChapters(order) {
  await apiClient.post('/chapters/reorder/', { order });
}

export async function checkConsistency(chapterId) {
  const response = await apiClient.post(`/chapters/${chapterId}/check_consistency/`);
  return response.data;
}

export async function deleteChapter(id) {
  await apiClient.delete(`/chapters/${id}/`);
}