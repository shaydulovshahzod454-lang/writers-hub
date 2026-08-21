import apiClient from './client';

export async function getTimelineEvents(projectId) {
  const response = await apiClient.get(`/timeline-events/?project=${projectId}`);
  return response.data;
}

export async function createTimelineEvent(data) {
  const response = await apiClient.post('/timeline-events/', data);
  return response.data;
}

export async function deleteTimelineEvent(id) {
  await apiClient.delete(`/timeline-events/${id}/`);
}