import apiClient from './client';

export async function getComments(chapterId) {
  const response = await apiClient.get(`/comments/?chapter=${chapterId}`);
  return response.data;
}

export async function createComment(chapterId, text, quotedText = '') {
  const response = await apiClient.post('/comments/', {
    chapter: chapterId,
    text,
    quoted_text: quotedText,
  });
  return response.data;
}