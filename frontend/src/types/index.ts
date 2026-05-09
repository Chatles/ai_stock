export interface Notice {
  noticeDate: string;
  securityCode: string;
  securityNameAbbr: string;
  noticeType: string;
  noticeTitle: string;
  noticeUrl: string;
  id?: string;
}

export interface NoticeAnalysis {
  id?: number;
  notice_id: string;
  security_code: string;
  security_name: string;
  notice_title: string;
  notice_date: string;
  notice_url: string;
  notice_type: string;
  is_filtered: number;
  filter_reason: string | null;
  analysis_status: 'pending' | 'analyzing' | 'completed' | 'failed';
  analysis_result: '利好' | '无影响' | '待定' | null;
  利好程度: number;
  price_change_predict: string | null;
  content_summary: string | null;
  fundamental_analysis: string | null;
  industry_analysis: string | null;
  competitive_analysis: string | null;
  analysis_reason: string | null;
  analyzed_at: string | null;
  created_at?: string;
}

export interface NoticeResponse {
  code: number;
  data: {
    list: Notice[];
    total: number;
    page: number;
    pageSize: number;
  };
  message?: string;
}

export interface AnalysisResponse {
  code: number;
  data: NoticeAnalysis[];
  message?: string;
}

export type MarketType = 'ALL' | 'SHA' | 'SZA' | 'KCB' | 'CYB';
export type AnalysisFilter = 'ALL' | '利好' | '无影响' | '待定';

export interface QueryParams {
  page?: number;
  pageSize?: number;
  market?: MarketType;
  keyword?: string;
  startDate?: string;
  endDate?: string;
  analysisFilter?: AnalysisFilter;
  sortBy?: '利好程度' | 'notice_date';
  order?: 'ASC' | 'DESC';
}
