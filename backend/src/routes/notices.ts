import { Router, Request, Response } from 'express';
import { eastMoneyService } from '../services/eastmoney';
import { mockDataService } from '../services/mockData';
import { analysisService } from '../services/analysis';
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
      // result = mockDataService.getNotices({
      //   page,
      //   pageSize: Math.min(pageSize, 50),
      //   market,
      //   keyword,
      // });
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
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    scheduler: 'disabled'
  });
});

router.get('/analysis/notices', async (req: Request, res: Response) => {
  try {
    const resultFilter = req.query.result as '利好' | '无影响' | '待定' | undefined;
    const sortBy = (req.query.sortBy as '利好程度' | 'notice_date') || 'notice_date';
    const order = (req.query.order as 'ASC' | 'DESC') || 'DESC';
    const includeFiltered = req.query.includeFiltered === 'true';

    const notices = await analysisService.getAnalyzedNotices(resultFilter, sortBy, order, includeFiltered);

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

router.get('/analysis/notices/:noticeId', async (req: Request, res: Response) => {
  try {
    const notice = await analysisService.getNoticeById(req.params.noticeId);
    if (!notice) {
      return res.status(404).json({
        code: 404,
        message: 'Notice not found',
      });
    }
    res.json({
      code: 200,
      data: notice,
      message: 'success',
    });
  } catch (error) {
    console.error('Error fetching notice detail:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  }
});

router.post('/analysis/analyze', async (req: Request, res: Response) => {
  try {
    const { noticeId, securityCode, securityName, noticeTitle, noticeDate, noticeUrl, noticeType } = req.body;

    if (!securityCode || !noticeTitle) {
      return res.status(400).json({
        code: 400,
        message: '缺少必需参数: securityCode, noticeTitle',
      });
    }

    const notice = {
      id: noticeId || `${securityCode}_${noticeDate || new Date().toISOString()}`,
      securityCode,
      securityNameAbbr: securityName || '未知',
      noticeTitle,
      noticeDate: noticeDate || new Date().toISOString(),
      noticeUrl: noticeUrl || '',
      noticeType: noticeType || '',
    };

    const result = await analysisService.analyzeNoticeOnly(notice);

    res.json({
      code: 200,
      data: result,
      message: 'Analysis completed',
    });
  } catch (error: any) {
    console.error('Analysis error:', error);
    res.status(500).json({
      code: 500,
      message: `Analysis failed: ${error.message}`,
    });
  }
});

router.get('/analysis/fundamental/:code', async (req: Request, res: Response) => {
  try {
    const code = req.params.code;
    if (!code) {
      return res.status(400).json({
        code: 400,
        message: '缺少股票代码',
      });
    }

    const result = await analysisService.getCompanyFundamental(code);

    res.json({
      code: 200,
      data: result,
      message: 'success',
    });
  } catch (error: any) {
    console.error('Fundamental data error:', error);
    res.status(500).json({
      code: 500,
      message: `Failed to get fundamental data: ${error.message}`,
    });
  }
});

export default router;
