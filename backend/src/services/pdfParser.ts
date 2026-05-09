import axios from 'axios';
import * as cheerio from 'cheerio';

export class PDFParserService {
  private cache: Map<string, { content: string; timestamp: number }> = new Map();
  private cacheTTL = 30 * 60 * 1000;

  async extractNoticeContent(noticeUrl: string): Promise<string> {
    const cached = this.cache.get(noticeUrl);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.content;
    }

    try {
      const response = await axios.get(noticeUrl, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      });

      const $ = cheerio.load(response.data);
      let content = '';

      $('div.news-content, div.article-content, div.detail-content, div.content').each((_, el) => {
        content += $(el).text().trim() + '\n';
      });

      if (!content || content.length < 100) {
        $('p, h1, h2, h3, h4, div').each((_, el) => {
          const text = $(el).text().trim();
          if (text.length > 50) {
            content += text + '\n';
          }
        });
      }

      content = content.replace(/\s+/g, ' ').replace(/\n+/g, '\n').trim();

      if (content.length > 100) {
        this.cache.set(noticeUrl, { content, timestamp: Date.now() });
      }

      return content.substring(0, 5000);
    } catch (error: any) {
      console.error(`PDF解析失败: ${noticeUrl}`, error.message);
      return '';
    }
  }

  async extractKeyInfo(content: string): Promise<{
    keyNumbers: string[];
    dates: string[];
    amounts: string[];
    names: string[];
  }> {
    const keyNumbers: string[] = [];
    const dates: string[] = [];
    const amounts: string[] = [];
    const names: string[] = [];

    const percentMatches = content.match(/\d+\.?\d*%/g);
    if (percentMatches) {
      keyNumbers.push(...percentMatches.slice(0, 10));
    }

    const dateMatches = content.match(/\d{4}年\d{1,2}月\d{1,2}日/g);
    if (dateMatches) {
      dates.push(...dateMatches);
    }

    const amountMatches = content.match(/\d+\.?\d*[亿万]元/g);
    if (amountMatches) {
      amounts.push(...amountMatches.slice(0, 10));
    }

    const percentChangeMatches = content.match(/[涨跌][^\s]{0,10}\d+\.?\d*%/g);
    if (percentChangeMatches) {
      keyNumbers.push(...percentChangeMatches.slice(0, 5));
    }

    return { keyNumbers, dates, amounts, names };
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const pdfParserService = new PDFParserService();
