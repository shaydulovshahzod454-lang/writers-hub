import apiClient from './client';

export async function getRelationships(projectId) {
  const response = await apiClient.get(`/relationships/?project=${projectId}`);
  return response.data;
}

export async function createRelationship(data) {
  const response = await apiClient.post('/relationships/', data);
  return response.data;
}

export async function deleteRelationship(id) {
  await apiClient.delete(`/relationships/${id}/`);
}