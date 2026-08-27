import apiClient from './client';

export async function getBoardItems(projectId) {
  const response = await apiClient.get(`/board-items/?project=${projectId}`);
  return response.data;
}

export async function createBoardItem(data) {
  const response = await apiClient.post('/board-items/', data);
  return response.data;
}

export async function updateBoardItemPosition(id, x, y) {
  const response = await apiClient.patch(`/board-items/${id}/`, { x, y });
  return response.data;
}

export async function deleteBoardItem(id) {
  await apiClient.delete(`/board-items/${id}/`);
}

export async function getBoardConnections(projectId) {
  const response = await apiClient.get(`/board-connections/?project=${projectId}`);
  return response.data;
}

export async function createBoardConnection(data) {
  const response = await apiClient.post('/board-connections/', data);
  return response.data;
}

export async function deleteBoardConnection(id) {
  await apiClient.delete(`/board-connections/${id}/`);
}