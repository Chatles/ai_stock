import { Router, Request, Response } from 'express';
import { mockDataService } from '../services/mockData';
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

    const result = mockDataService.getNotices({
      page,
      pageSize: Math.min(pageSize, 50),
      market,
      keyword,
    });

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

export default router;
