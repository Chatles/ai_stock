import { spawn } from 'child_process';
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
  private fetchData(params: Record<string, string | number>): Promise<EastMoneyResponse> {
    return new Promise((resolve, reject) => {
      const queryParts: string[] = [];
      for (const [key, value] of Object.entries(params)) {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
      }
      const queryString = queryParts.join('&');
      const url = `${API_URL}?${queryString}`;

      const curl = spawn('curl', [
        '-s',
        '--max-time', '15',
        '--noproxy', '*',
        '-H', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        '-H', 'Accept: application/json',
        url
      ]);

      let data = '';
      let error = '';

      curl.stdout.on('data', (chunk) => {
        data += chunk.toString();
      });

      curl.stderr.on('data', (chunk) => {
        error += chunk.toString();
      });

      curl.on('close', (code) => {
        if (code !== 0) {
          console.error('Curl error:', error);
          reject(new Error(`Curl exited with code ${code}`));
          return;
        }

        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData as EastMoneyResponse);
        } catch (err) {
          console.error('Parse error:', data.substring(0, 500));
          reject(new Error('Failed to parse JSON response'));
        }
      });

      curl.on('error', (err) => {
        reject(err);
      });
    });
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

    try {
      const response = await this.fetchData(requestParams);

      if (!response.data || !response.data.list) {
        return {
          list: [],
          total: 0,
          page,
          pageSize,
        };
      }

      const list = (response.data.list || []).map((item, idx) => this.mapToNotice(item, idx));
      const total = response.data.total_hits || list.length;

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
