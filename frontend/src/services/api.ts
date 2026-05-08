import axios from 'axios';
import { NoticeResponse, QueryParams } from '../types';

const API_URL = 'http://np-anotice-stock.eastmoney.com/api/security/ann';

interface RawNoticeData {
  notice_date: string;
  codes: Array<{
    stock_code: string;
    short_name?: string;
    ann_type: string;
  }>;
  columns: Array<{
    column_name: string;
  }>;
  art_code: string;
  title: string;
}

interface EastMoneyResponse {
  data?: {
    list: RawNoticeData[];
    total_hits: number;
    page_index: number;
    page_size: number;
  };
  error?: string;
  success: number;
}

const mapToNotice = (raw: RawNoticeData, index: number) => {
  const stockCode = raw.codes?.[0]?.stock_code || '';
  const artCode = raw.art_code || '';
  const noticeUrl = `https://data.eastmoney.com/notices/detail/${stockCode}/${artCode}.html`;

  return {
    noticeDate: raw.notice_date || '',
    securityCode: stockCode,
    securityNameAbbr: raw.codes?.[0]?.short_name || '',
    noticeType: raw.columns?.[0]?.column_name || '',
    noticeTitle: raw.title || '',
    noticeUrl: noticeUrl,
    id: `${stockCode}_${artCode}_${index}`,
  };
};

export const fetchNotices = async (params: QueryParams): Promise<NoticeResponse> => {
  const page = params.page || 1;
  const pageSize = Math.min(params.pageSize || 20, 50);

  const requestParams: Record<string, string | number> = {
    sr: -1,
    page_size: pageSize,
    page_index: page,
    ann_type: 'A',
    client_source: 'web',
    f_node: 0,
    s_node: 0,
  };

  if (params.keyword) {
    requestParams.keyword = params.keyword;
  }

  if (params.startDate) {
    requestParams.begin_time = params.startDate;
  }

  if (params.endDate) {
    requestParams.end_time = params.endDate;
  }

  try {
    const response = await axios.get<EastMoneyResponse>(API_URL, {
      params: requestParams,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      timeout: 15000,
    });

    if (!response.data?.data?.list) {
      return {
        code: 200,
        data: { list: [], total: 0, page, pageSize },
        message: 'success',
      };
    }

    const list = response.data.data.list.map((item, idx) => mapToNotice(item, idx));
    const total = response.data.data.total_hits || list.length;

    return {
      code: 200,
      data: { list, total, page, pageSize },
      message: 'success',
    };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const api = {
  getNotices: fetchNotices,
};
