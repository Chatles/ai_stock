import { execSync } from 'child_process';
import { Notice, QueryParams } from '../types';

const API_URL = 'http://np-anotice-stock.eastmoney.com/api/security/ann';

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

export class EastMoneyService {
  private fetchData(params: Record<string, string | number>): EastMoneyResponse {
    const queryParts: string[] = [];
    for (const [key, value] of Object.entries(params)) {
      queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
    const queryString = queryParts.join('&');
    const url = `${API_URL}?${queryString}`;

    try {
      const data = execSync(`curl -s --max-time 15 '${url}'`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 20000,
      });

      const jsonData = JSON.parse(data) as EastMoneyResponse;
      return jsonData;
    } catch (error: any) {
      console.error('Curl fetch error:', error.message);
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
  }

  private mapToNotice(raw: RawNoticeData, index: number): Notice {
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
  }

  async getNotices(params: QueryParams): Promise<{
    list: Notice[];
    total: number;
    page: number;
    pageSize: number;
  }> {
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

    if (params.startDate) {
      requestParams.begin_time = params.startDate;
    }

    if (params.endDate) {
      requestParams.end_time = params.endDate;
    }

    if (params.keyword) {
      requestParams.keyword = params.keyword;
    }

    if (params.noticeType) {
      requestParams.column = params.noticeType;
    }

    try {
      const response = this.fetchData(requestParams);

      if (!response.data || !response.data.list) {
        return {
          list: [],
          total: 0,
          page,
          pageSize,
        };
      }

      let list = (response.data.list || []).map((item, idx) => this.mapToNotice(item, idx));
      const total = response.data.total_hits || list.length;

      if (params.noticeType && list.length > 0) {
        list = list.filter(notice => notice.noticeType === params.noticeType);
      }

      return {
        list,
        total,
        page,
        pageSize,
      };
    } catch (error) {
      console.error('Error in getNotices:', error);
      throw error;
    }
  }
}

export const eastMoneyService = new EastMoneyService();
