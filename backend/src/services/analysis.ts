import { Notice } from '../types';
import { getDatabase } from '../database';
import { doubaoService } from './doubao';

export interface NoticeAnalysis {
  notice_id: string;
  security_code: string;
  security_name: string;
  notice_title: string;
  notice_date: string;
  notice_url: string;
  notice_type: string;
  notice_content: string | null;
  analysis_result: '利好' | '无影响' | '待定';
  利好程度: number;
  analysis_reason: string;
  analyzed_at: string;
}

export class AnalysisService {
  async analyzeNotice(notice: Notice, content?: string): Promise<NoticeAnalysis> {
    const db = getDatabase();
    const existing = db.prepare(
      'SELECT * FROM notice_analysis WHERE notice_id = ?'
    ).get(notice.id) as NoticeAnalysis | undefined;

    if (existing) {
      console.log(`Notice ${notice.id} already analyzed, skipping`);
      return existing;
    }

    const result = await doubaoService.analyzeNotice(
      notice.noticeTitle,
      content || '',
      notice.securityCode,
      notice.securityNameAbbr
    );

    const analysis: NoticeAnalysis = {
      notice_id: notice.id || `${notice.securityCode}_${notice.noticeDate}`,
      security_code: notice.securityCode,
      security_name: notice.securityNameAbbr,
      notice_title: notice.noticeTitle,
      notice_date: notice.noticeDate,
      notice_url: notice.noticeUrl,
      notice_type: notice.noticeType,
      notice_content: content || null,
      analysis_result: result.result,
      利好程度: result.利好程度,
      analysis_reason: result.reason,
      analyzed_at: new Date().toISOString(),
    };

    db.prepare(`
      INSERT INTO notice_analysis (
        notice_id, security_code, security_name, notice_title, notice_date,
        notice_url, notice_type, notice_content, analysis_result, 利好程度,
        analysis_reason, analyzed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      analysis.notice_id,
      analysis.security_code,
      analysis.security_name,
      analysis.notice_title,
      analysis.notice_date,
      analysis.notice_url,
      analysis.notice_type,
      analysis.notice_content,
      analysis.analysis_result,
      analysis.利好程度,
      analysis.analysis_reason,
      analysis.analyzed_at
    );

    console.log(`Analyzed notice ${analysis.notice_id}: ${analysis.analysis_result}`);
    return analysis;
  }

  async getAnalyzedNotices(
    resultFilter?: '利好' | '无影响' | '待定',
    sortBy: '利好程度' | 'notice_date' = '利好程度',
    order: 'ASC' | 'DESC' = 'DESC'
  ): Promise<NoticeAnalysis[]> {
    const db = getDatabase();
    let query = 'SELECT * FROM notice_analysis';
    const params: any[] = [];

    if (resultFilter) {
      query += ' WHERE analysis_result = ?';
      params.push(resultFilter);
    }

    const sortColumn = sortBy === '利好程度' ? '利好程度' : 'notice_date';
    query += ` ORDER BY ${sortColumn} ${order}`;

    return db.prepare(query).all(...params) as NoticeAnalysis[];
  }
}

export const analysisService = new AnalysisService();
