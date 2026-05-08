export interface Notice {
  noticeDate: string;
  securityCode: string;
  securityNameAbbr: string;
  noticeType: string;
  noticeTitle: string;
  noticeUrl: string;
  id?: string;
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

export type MarketType = 'ALL' | 'SHA' | 'SZA' | 'KCB' | 'CYB';

export interface QueryParams {
  page?: number;
  pageSize?: number;
  market?: MarketType;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}
