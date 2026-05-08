import { Router, Request, Response } from 'express';
import { eastMoneyService } from '../services/eastmoney';
import { mockDataService } from '../services/mockData';
import { analysisService } from '../services/analysis';
import { schedulerService } from '../services/scheduler';
import { MarketType } from '../types';

const router = Router();

const VALID_MARKETS: MarketType[] = ['ALL', 'SHA', 'SZA', 'KCB', 'CYB'];

router.get('/notices', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const market = (req.query.market as MarketType) || 'ALL';
    const keyword = req.query.keyword as string | undefined;

    if (!VALID_MARKETS.includes(market)) {
      return res.status(400).json({
        code: 400,
        message: 'Invalid market parameter',
        data: null,
      });
    }

    if (page < 1 || pageSize < 1 || pageSize > 50) {
      return res.status(400).json({
        code: 400,
        message: 'Invalid page or pageSize parameter',
        data: null,
      });
    }

    let result;
    let useMock = false;

    try {
      result = await eastMoneyService.getNotices({
        page,
        pageSize: Math.min(pageSize, 50),
        market,
        keyword,
      });
    } catch (error) {
      console.log('Real API failed, falling back to mock data:', error);
      useMock = true;
      result = mockDataService.getNotices({
        page,
        pageSize: Math.min(pageSize, 50),
        market,
        keyword,
      });
    }

    res.json({
      code: 200,
      data: result,
      message: 'success',
    });
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
      data: null,
    });
  }
});

router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/analysis/status', (_req: Request, res: Response) => {
  res.json({
    code: 200,
    data: schedulerService.getStatus(),
    message: 'success',
  });
});

router.post('/analysis/run', async (_req: Request, res: Response) => {
  try {
    schedulerService.runAnalysis();
    res.json({
      code: 200,
      message: 'Analysis started',
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: 'Analysis failed',
    });
  }
});

router.get('/analysis/notices', async (req: Request, res: Response) => {
  try {
    const resultFilter = req.query.result as '利好' | '无影响' | '待定' | undefined;
    const sortBy = (req.query.sortBy as '利好程度' | 'notice_date') || '利好程度';
    const order = (req.query.order as 'ASC' | 'DESC') || 'DESC';

    const notices = await analysisService.getAnalyzedNotices(resultFilter, sortBy, order);

    res.json({
      code: 200,
      data: notices,
      message: 'success',
    });
  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  }
});

export default router;
