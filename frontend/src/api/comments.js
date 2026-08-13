import apiClient from './client';

export async function getComments(chapterId) {
  const response = await apiClient.get(`/comments/?chapter=${chapterId}`);
  return response.data;
}

export async function createComment(chapterId, text) {
  const response = await apiClient.post('/comments/', {
    chapter: chapterId,
    text,
  });
  return response.data;
}