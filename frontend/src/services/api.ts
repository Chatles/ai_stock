import axios from 'axios';
import { NoticeResponse, AnalysisResponse, QueryParams, NoticeAnalysis } from '../types';

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

export const fetchAnalysisNotices = async (
  analysisFilter?: string,
  sortBy: '利好程度' | 'notice_date' = '利好程度',
  order: 'ASC' | 'DESC' = 'DESC'
): Promise<{ notices: NoticeAnalysis[]; total: number }> => {
  const params: Record<string, any> = {
    sortBy,
    order,
  };
  if (analysisFilter && analysisFilter !== 'ALL') {
    params.result = analysisFilter;
  }
  const response = await apiClient.get<AnalysisResponse>('/analysis/notices', { params });
  return {
    notices: response.data.data || [],
    total: (response.data.data || []).length,
  };
};

export const triggerAnalysis = async (): Promise<void> => {
  await apiClient.post('/analysis/run');
};

export const api = {
  getNotices: fetchNotices,
  getAnalysisNotices: fetchAnalysisNotices,
  triggerAnalysis,
};
