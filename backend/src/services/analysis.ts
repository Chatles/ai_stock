import { Notice } from '../types';
import { getDatabase } from '../database';
import { doubaoService } from './doubao';
import { akshareService } from './akshare';
import { pdfParserService } from './pdfParser';

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
  notice_content: string | null;
  fundamental_data: string | null;
  analyzed_at: string | null;
  created_at?: string;
}

const NO_IMPACT_KEYWORDS = [
  '董事会', '监事会', '独立董事', '候选人', '声明', '承诺',
  '会议通知', '召开', '议案', '延期', '补充公告', '更正',
  '辞职', '离任', '退休', '工作调整', '董事候选人', '监事候选人',
  '征集投票权', '股东大会通知', '年度股东大会', '临时股东大会'
];

const HIGH_IMPACT_KEYWORDS = [
  '业绩', '净利润', '营收', '利润', '分红', '送股', '配股',
  '回购', '增持', '减持', '并购', '重组', '战略', '订单',
  '合同', '突破', '创新', '获批', '中标', '新药', '专利',
  '合作', '投资', '扩产', '产能', '签约'
];

export class AnalysisService {
  private quickFilter(notice: Notice): { filtered: boolean; reason: string } {
    const title = notice.noticeTitle.toLowerCase();
    for (const keyword of NO_IMPACT_KEYWORDS) {
      if (title.includes(keyword.toLowerCase())) {
        return { filtered: true, reason: `标题含"${keyword}"，日常事务公告` };
      }
    }
    return { filtered: false, reason: '' };
  }

  private needsDeepAnalysis(notice: Notice): boolean {
    const title = notice.noticeTitle.toLowerCase();
    for (const keyword of HIGH_IMPACT_KEYWORDS) {
      if (title.includes(keyword.toLowerCase())) {
        return true;
      }
    }
    return false;
  }

  async analyzeNotice(notice: Notice, forceRefresh: boolean = false): Promise<NoticeAnalysis> {
    const db = getDatabase();
    const noticeId = notice.id || `${notice.securityCode}_${notice.noticeDate}`;

    const existing = !forceRefresh ? db.prepare(
      'SELECT * FROM notice_analysis WHERE notice_id = ?'
    ).get(noticeId) as NoticeAnalysis | undefined : null;

    if (existing && existing.analysis_status === 'completed') {
      console.log(`Notice ${noticeId} already analyzed`);
      return existing;
    }

    const filterResult = this.quickFilter(notice);

    const analysis: NoticeAnalysis = {
      notice_id: noticeId,
      security_code: notice.securityCode,
      security_name: notice.securityNameAbbr,
      notice_title: notice.noticeTitle,
      notice_date: notice.noticeDate,
      notice_url: notice.noticeUrl,
      notice_type: notice.noticeType,
      is_filtered: filterResult.filtered ? 1 : 0,
      filter_reason: filterResult.reason || null,
      analysis_status: 'pending',
      analysis_result: null,
      利好程度: 0,
      price_change_predict: null,
      content_summary: null,
      fundamental_analysis: null,
      industry_analysis: null,
      competitive_analysis: null,
      analysis_reason: null,
      notice_content: null,
      fundamental_data: null,
      analyzed_at: null,
    };

    db.prepare(`
      INSERT OR REPLACE INTO notice_analysis (
        notice_id, security_code, security_name, notice_title, notice_date,
        notice_url, notice_type, is_filtered, filter_reason, analysis_status,
        analysis_result, 利好程度, price_change_predict, content_summary,
        fundamental_analysis, industry_analysis, competitive_analysis,
        analysis_reason, notice_content, fundamental_data, analyzed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      analysis.notice_id, analysis.security_code, analysis.security_name,
      analysis.notice_title, analysis.notice_date, analysis.notice_url,
      analysis.notice_type, analysis.is_filtered, analysis.filter_reason,
      analysis.analysis_status, analysis.analysis_result, analysis.利好程度,
      analysis.price_change_predict, analysis.content_summary,
      analysis.fundamental_analysis, analysis.industry_analysis,
      analysis.competitive_analysis, analysis.analysis_reason,
      analysis.notice_content, analysis.fundamental_data, analysis.analyzed_at
    );

    if (filterResult.filtered) {
      return this.completeAnalysis(db, noticeId, {
        analysis_status: 'completed',
        analysis_result: '无影响',
        analysis_reason: filterResult.reason,
      });
    }

    db.prepare(`UPDATE notice_analysis SET analysis_status = 'analyzing' WHERE notice_id = ?`).run(noticeId);

    const deepAnalysis = this.needsDeepAnalysis(notice);
    if (!deepAnalysis) {
      return this.completeAnalysis(db, noticeId, {
        analysis_status: 'completed',
        analysis_result: '待定',
        analysis_reason: '标题无明显利好/利空关键词，建议进一步关注',
      });
    }

    try {
      const noticeContent = notice.noticeUrl ? await pdfParserService.extractNoticeContent(notice.noticeUrl) : '';
      const fundamentalData = akshareService.formatForDisplay(akshareService.getFullAnalysis(notice.securityCode));

      const result = await doubaoService.analyzeNoticeFull(
        notice.noticeTitle,
        noticeContent,
        notice.securityCode,
        notice.securityNameAbbr,
        fundamentalData
      );

      return this.completeAnalysis(db, noticeId, {
        analysis_status: 'completed',
        analysis_result: result.result,
        利好程度: result.利好程度,
        price_change_predict: result.priceChangePredict,
        content_summary: result.contentSummary,
        fundamental_analysis: result.fundamentalAnalysis,
        industry_analysis: result.industryAnalysis,
        competitive_analysis: result.competitiveAnalysis,
        analysis_reason: result.reason,
        notice_content: noticeContent.substring(0, 3000) || null,
        fundamental_data: fundamentalData || null,
      });
    } catch (error: any) {
      console.error('Analysis failed:', error);
      return this.completeAnalysis(db, noticeId, {
        analysis_status: 'failed',
        analysis_reason: `分析失败: ${error.message}`,
      });
    }
  }

  async analyzeNoticeOnly(notice: Notice): Promise<NoticeAnalysis> {
    return this.analyzeNotice(notice, true);
  }

  async getCompanyFundamental(code: string): Promise<{
    fundamental: string;
    valuation: any;
    industry: any;
  }> {
    try {
      const fullData = akshareService.getFullAnalysis(code);
      return {
        fundamental: akshareService.formatForDisplay(fullData),
        valuation: fullData.valuation,
        industry: fullData.industry,
      };
    } catch (error: any) {
      return {
        fundamental: `获取失败: ${error.message}`,
        valuation: null,
        industry: null,
      };
    }
  }

  private completeAnalysis(db: any, noticeId: string, updates: Partial<NoticeAnalysis>): NoticeAnalysis {
    const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = Object.values(updates);
    db.prepare(`UPDATE notice_analysis SET ${setClause}, analyzed_at = ? WHERE notice_id = ?`).run(...values, new Date().toISOString(), noticeId);
    return db.prepare('SELECT * FROM notice_analysis WHERE notice_id = ?').get(noticeId) as NoticeAnalysis;
  }

  async getAnalyzedNotices(
    resultFilter?: '利好' | '无影响' | '待定',
    sortBy: '利好程度' | 'notice_date' = 'notice_date',
    order: 'ASC' | 'DESC' = 'DESC',
    includeFiltered: boolean = false
  ): Promise<NoticeAnalysis[]> {
    const db = getDatabase();
    let query = 'SELECT * FROM notice_analysis WHERE analysis_status = ?';
    const params: any[] = ['completed'];

    if (!includeFiltered) {
      query += ' AND is_filtered = 0';
    }

    if (resultFilter) {
      query += ' AND analysis_result = ?';
      params.push(resultFilter);
    }

    const sortColumn = sortBy === '利好程度' ? '利好程度' : 'notice_date';
    query += ` ORDER BY ${sortColumn} ${order}`;

    return db.prepare(query).all(...params) as NoticeAnalysis[];
  }

  async getNoticeById(noticeId: string): Promise<NoticeAnalysis | null> {
    const db = getDatabase();
    return db.prepare('SELECT * FROM notice_analysis WHERE notice_id = ?').get(noticeId) as NoticeAnalysis | null;
  }

  async getPendingNotices(limit: number = 50): Promise<NoticeAnalysis[]> {
    const db = getDatabase();
    return db.prepare(`
      SELECT * FROM notice_analysis
      WHERE analysis_status IN ('pending', 'failed')
      ORDER BY notice_date DESC
      LIMIT ?
    `).all(limit) as NoticeAnalysis[];
  }
}

export const analysisService = new AnalysisService();
