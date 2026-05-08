import https from 'https';
import { Notice, QueryParams } from '../types';

const API_HOST = 'np-anotice-stock.eastmoney.com';
const API_PATH = '/api/security/ann';

interface EastMoneyResponse {
  code: string;
  message: string;
  data?: {
    total_hits: number;
    list: RawNoticeData[];
  };
}

interface RawNoticeData {
  notice_date: string;
  codes: Array<{
    code: string;
    ann_type: string;
  }>;
  columns: Array<{
    column_name: string;
  }>;
  art_code: string;
  title: string;
  short_name?: string;
  stock_code?: string;
}

export class EastMoneyService {
  private async fetchData(params: Record<string, string | number>): Promise<EastMoneyResponse> {
    return new Promise((resolve, reject) => {
      const queryParts: string[] = [];
      for (const [key, value] of Object.entries(params)) {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
      }
      const queryString = queryParts.join('&');

      const options = {
        hostname: API_HOST,
        port: 443,
        path: `${API_PATH}?${queryString}`,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://data.eastmoney.com/notices/',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Connection': 'keep-alive',
        },
      };

      const req = https.request(options, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          const dataStr = buffer.toString('utf-8');
          try {
            const jsonData = JSON.parse(dataStr);
            resolve(jsonData as EastMoneyResponse);
          } catch (error) {
            console.error('Parse error, first 500 chars:', dataStr.substring(0, 500));
            reject(new Error('Failed to parse JSON response'));
          }
        });
      });

      req.on('error', (err) => {
        console.error('Request error:', err.message);
        reject(err);
      });

      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  private mapToNotice(raw: RawNoticeData, index: number): Notice {
    const stockCode = raw.codes?.[0]?.code || raw.stock_code || '';
    const artCode = raw.art_code || '';
    const noticeUrl = `https://data.eastmoney.com/notices/detail/${stockCode}/${artCode}.html`;

    return {
      noticeDate: raw.notice_date || '',
      securityCode: stockCode,
      securityNameAbbr: raw.short_name || '',
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
    const pageSize = Math.min(params.pageSize || 20, 100);

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
