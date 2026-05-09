import axios from 'axios';
import { NoticeResponse, Notice, NoticeAnalysis } from '../types';

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const fetchNotices = async (params: {
  page?: number;
  pageSize?: number;
  market?: string;
  keyword?: string;
  noticeType?: string;
}): Promise<NoticeResponse> => {
  const response = await apiClient.get<NoticeResponse>('/notices', { params });
  return response.data;
};

export interface NoticeTypeResponse {
  code: number;
  data: Array<{ type: string; count: number }>;
  message: string;
}

export const fetchNoticeTypes = async (): Promise<NoticeTypeResponse> => {
  const response = await apiClient.get<NoticeTypeResponse>('/notice-types');
  return response.data;
};

export interface AnalysisResponse {
  code: number;
  data: NoticeAnalysis[];
  message: string;
}

export interface FundamentalResponse {
  code: number;
  data: {
    fundamental: string;
    valuation: any;
    industry: any;
  };
  message: string;
}

export const getAnalysisNotices = async (
  resultFilter?: '利好' | '无影响' | '待定',
  sortBy: '利好程度' | 'notice_date' = '利好程度',
  order: 'ASC' | 'DESC' = 'DESC'
): Promise<{ notices: NoticeAnalysis[]; total: number }> => {
  const params: Record<string, any> = { sortBy, order };
  if (resultFilter) {
    params.result = resultFilter;
  }
  const response = await apiClient.get<AnalysisResponse>('/analysis/notices', { params });
  return {
    notices: response.data.data || [],
    total: (response.data.data || []).length,
  };
};

export const analyzeNotice = async (notice: Notice): Promise<AnalysisResponse> => {
  const response = await apiClient.post<AnalysisResponse>('/analysis/analyze', {
    noticeId: notice.id,
    securityCode: notice.securityCode,
    securityName: notice.securityNameAbbr,
    noticeTitle: notice.noticeTitle,
    noticeDate: notice.noticeDate,
    noticeUrl: notice.noticeUrl,
    noticeType: notice.noticeType,
  });
  return response.data;
};

export const getFundamental = async (code: string): Promise<FundamentalResponse> => {
  const response = await apiClient.get<FundamentalResponse>(`/analysis/fundamental/${code}`);
  return response.data;
};

export const api = {
  getNotices: fetchNotices,
  getNoticeTypes: fetchNoticeTypes,
  getAnalysisNotices,
  analyzeNotice,
  getFundamental,
};
