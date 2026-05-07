import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export interface Student {
  id: number;
  name: string;
  roll_number: string;
  class_name: string;
  section: string;
}

export interface StudentCreateInput {
  name: string;
  roll_number: string;
  class_name: string;
  section: string;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const studentService = {
  async getAll() {
    const response = await apiClient.get<Student[]>('/students/');
    return response.data;
  },
  async create(data: StudentCreateInput) {
    const response = await apiClient.post<Student>('/students/', data);
    return response.data;
  },
  async uploadImages(studentId: number, files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const response = await apiClient.post(`/students/${studentId}/upload-images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  async generateEmbeddings(studentId: number) {
    const response = await apiClient.post(`/ai/students/${studentId}/generate-embeddings`);
    return response.data;
  },
};

export default apiClient;
