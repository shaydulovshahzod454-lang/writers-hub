import apiClient from './client';

export async function getCharacters(projectId) {
  const response = await apiClient.get(`/characters/?project=${projectId}`);
  return response.data;
}

export async function createCharacter(data) {
  const response = await apiClient.post('/characters/', data);
  return response.data;
}

export async function getCharacter(id) {
  const response = await apiClient.get(`/characters/${id}/`);
  return response.data;
}

export async function updateCharacter(id, data) {
  const response = await apiClient.patch(`/characters/${id}/`, data);
  return response.data;
}

export async function deleteCharacter(id) {
  await apiClient.delete(`/characters/${id}/`);
}