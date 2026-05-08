import axios from 'axios';
import { NoticeResponse, QueryParams } from '../types';

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const fetchNotices = async (params: QueryParams): Promise<NoticeResponse> => {
  const response = await apiClient.get<NoticeResponse>('/notices', { params });
  return response.data;
};

export const api = {
  getNotices: fetchNotices,
};
