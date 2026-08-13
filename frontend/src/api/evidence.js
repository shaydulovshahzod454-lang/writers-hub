import apiClient from './client';

export async function getEvidence(projectId) {
  const response = await apiClient.get(`/evidence/?project=${projectId}`);
  return response.data;
}

export async function createEvidence(data) {
  const response = await apiClient.post('/evidence/', data);
  return response.data;
}