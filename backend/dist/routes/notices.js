"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eastmoney_1 = require("../services/eastmoney");
const router = (0, express_1.Router)();
const VALID_MARKETS = ['ALL', 'SHA', 'SZA', 'KCB', 'CYB'];
router.get('/notices', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 20;
        const market = req.query.market || 'ALL';
        const keyword = req.query.keyword;
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
        const result = await eastmoney_1.eastMoneyService.getNotices({
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
    }
    catch (error) {
        console.error('Error fetching notices:', error);
        res.status(500).json({
            code: 500,
            message: 'Internal server error',
            data: null,
        });
    }
});
router.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
exports.default = router;
//# sourceMappingURL=notices.js.map