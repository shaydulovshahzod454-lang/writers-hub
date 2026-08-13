import apiClient from './client';

export async function getCharacters(projectId) {
  const response = await apiClient.get(`/characters/?project=${projectId}`);
  return response.data;
}

export async function createCharacter(data) {
  const response = await apiClient.post('/characters/', data);
  return response.data;
}