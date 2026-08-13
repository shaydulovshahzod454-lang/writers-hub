import apiClient from './client';

export async function getProjects() {
  const response = await apiClient.get('/projects/');
  return response.data;
}

export async function createProject(data) {
  const response = await apiClient.post('/projects/', data);
  return response.data;
}

export async function inviteMember(projectId, username) {
  const response = await apiClient.post('/project-members/', {
    project: projectId,
    username,
  });
  return response.data;
}

export async function getMembers(projectId) {
  const response = await apiClient.get(`/project-members/?project=${projectId}`);
  return response.data;
}