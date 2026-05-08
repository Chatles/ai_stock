import { eastMoneyService } from './eastmoney';
import { analysisService } from './analysis';

class SchedulerService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private lastRunTime: string | null = null;

  start(intervalMs: number = 60 * 60 * 1000): void {
    if (this.intervalId) {
      console.log('Scheduler already running');
      return;
    }

    console.log(`Scheduler started, will run every ${intervalMs / 1000 / 60} minutes`);

    this.runAnalysis();

    this.intervalId = setInterval(() => {
      this.runAnalysis();
    }, intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Scheduler stopped');
    }
  }

  async runAnalysis(): Promise<void> {
    if (this.isRunning) {
      console.log('Analysis already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    console.log(`[${new Date().toISOString()}] Starting announcement analysis...`);

    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const result = await eastMoneyService.getNotices({
        page: 1,
        pageSize: 100,
        startDate: yesterday,
        endDate: today,
      });

      console.log(`Found ${result.list.length} announcements to analyze`);

      let successCount = 0;
      let skipCount = 0;

      for (const notice of result.list) {
        try {
          await analysisService.analyzeNotice(notice);
          successCount++;
          await this.delay(1000);
        } catch (error) {
          console.error(`Error analyzing notice ${notice.id}:`, error);
          skipCount++;
        }
      }

      this.lastRunTime = new Date().toISOString();
      console.log(`Analysis completed: ${successCount} success, ${skipCount} skipped`);
    } catch (error) {
      console.error('Analysis job error:', error);
    } finally {
      this.isRunning = false;
    }
  }

  getStatus(): { running: boolean; lastRunTime: string | null } {
    return {
      running: this.isRunning,
      lastRunTime: this.lastRunTime,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const schedulerService = new SchedulerService();
