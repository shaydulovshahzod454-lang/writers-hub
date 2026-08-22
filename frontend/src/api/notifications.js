import apiClient from './client';

export async function getNotifications() {
  const response = await apiClient.get('/notifications/');
  return response.data;
}

export async function getUnreadCount() {
  const response = await apiClient.get('/notifications/unread_count/');
  return response.data.count;
}

export async function markRead(id) {
  await apiClient.post(`/notifications/${id}/mark_read/`);
}

export async function markAllRead() {
  await apiClient.post('/notifications/mark_all_read/');
}