import { eastMoneyService } from './eastmoney';
import { analysisService } from './analysis';
import { getDatabase } from '../database';

export interface BackfillResult {
  total: number;
  analyzed: number;
  skipped: number;
  errors: number;
}

export class BackfillService {
  async backfillByDateRange(
    startDate: string,
    endDate: string,
    onProgress?: (current: number, total: number) => void
  ): Promise<BackfillResult> {
    const result: BackfillResult = {
      total: 0,
      analyzed: 0,
      skipped: 0,
      errors: 0,
    };

    console.log(`[Backfill] Starting backfill from ${startDate} to ${endDate}`);

    let page = 1;
    const pageSize = 100;
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await eastMoneyService.getNotices({
          page,
          pageSize,
          startDate,
          endDate,
        });

        const notices = response.list;
        result.total += notices.length;

        if (notices.length === 0) {
          hasMore = false;
          break;
        }

        console.log(`[Backfill] Page ${page}: ${notices.length} notices`);

        for (let i = 0; i < notices.length; i++) {
          const notice = notices[i];
          try {
            await analysisService.analyzeNotice(notice);
            result.analyzed++;
          } catch (error) {
            console.error(`[Backfill] Error analyzing ${notice.id}:`, error);
            result.errors++;
          }

          if (onProgress) {
            onProgress(result.analyzed + result.errors, result.total);
          }

          await this.delay(500);
        }

        if (notices.length < pageSize) {
          hasMore = false;
        } else {
          page++;
        }
      } catch (error) {
        console.error(`[Backfill] Page ${page} error:`, error);
        result.errors++;
        hasMore = false;
      }
    }

    console.log(`[Backfill] Complete: ${result.analyzed} analyzed, ${result.skipped} skipped, ${result.errors} errors`);
    return result;
  }

  async backfillLastNDays(days: number): Promise<BackfillResult> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return this.backfillByDateRange(startDate, endDate);
  }

  async getBackfillStatus(): Promise<{
    totalAnalyzed: number;
    pendingCount: number;
    failedCount: number;
    dateRange: { start: string; end: string } | null;
  }> {
    const db = getDatabase();

    const totalAnalyzed = db.prepare(
      "SELECT COUNT(*) as count FROM notice_analysis WHERE analysis_status = 'completed'"
    ).get() as { count: number };

    const pendingCount = db.prepare(
      "SELECT COUNT(*) as count FROM notice_analysis WHERE analysis_status IN ('pending', 'analyzing')"
    ).get() as { count: number };

    const failedCount = db.prepare(
      "SELECT COUNT(*) as count FROM notice_analysis WHERE analysis_status = 'failed'"
    ).get() as { count: number };

    const dateRange = db.prepare(
      "SELECT MIN(notice_date) as start, MAX(notice_date) as end FROM notice_analysis"
    ).get() as { start: string; end: string } | undefined;

    return {
      totalAnalyzed: totalAnalyzed.count,
      pendingCount: pendingCount.count,
      failedCount: failedCount.count,
      dateRange: dateRange?.start ? { start: dateRange.start, end: dateRange.end } : null,
    };
  }

  async retryFailed(): Promise<number> {
    const db = getDatabase();
    const failedNotices = db.prepare(
      "SELECT notice_id FROM notice_analysis WHERE analysis_status = 'failed'"
    ).all() as { notice_id: string }[];

    console.log(`[Backfill] Retrying ${failedNotices.length} failed notices`);

    let successCount = 0;
    for (const { notice_id } of failedNotices) {
      try {
        const notice = db.prepare('SELECT * FROM notice_analysis WHERE notice_id = ?').get(notice_id);
        if (notice) {
          await analysisService.analyzeNotice({
            id: notice_id,
            noticeDate: (notice as any).notice_date,
            securityCode: (notice as any).security_code,
            securityNameAbbr: (notice as any).security_name,
            noticeTitle: (notice as any).notice_title,
            noticeUrl: (notice as any).notice_url || '',
            noticeType: (notice as any).notice_type || '',
          } as any);
          successCount++;
        }
      } catch (error) {
        console.error(`[Backfill] Retry failed for ${notice_id}:`, error);
      }
      await this.delay(1000);
    }

    return successCount;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const backfillService = new BackfillService();
