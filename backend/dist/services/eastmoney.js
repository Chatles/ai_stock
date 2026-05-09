"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eastMoneyService = exports.EastMoneyService = void 0;
const child_process_1 = require("child_process");
const API_URL = 'http://np-anotice-stock.eastmoney.com/api/security/ann';
class EastMoneyService {
    fetchData(params) {
        const queryParts = [];
        for (const [key, value] of Object.entries(params)) {
            queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
        }
        const queryString = queryParts.join('&');
        const url = `${API_URL}?${queryString}`;
        try {
            const data = (0, child_process_1.execSync)(`curl -s --max-time 15 '${url}'`, {
                encoding: 'utf-8',
                stdio: ['pipe', 'pipe', 'pipe'],
                timeout: 20000,
            });
            const jsonData = JSON.parse(data);
            return jsonData;
        }
        catch (error) {
            console.error('Curl fetch error:', error.message);
            throw new Error(`Failed to fetch data: ${error.message}`);
        }
    }
    mapToNotice(raw, index) {
        const stockCode = raw.codes?.[0]?.stock_code || '';
        const artCode = raw.art_code || '';
        const noticeUrl = `https://data.eastmoney.com/notices/detail/${stockCode}/${artCode}.html`;
        return {
            noticeDate: raw.notice_date || '',
            securityCode: stockCode,
            securityNameAbbr: raw.codes?.[0]?.short_name || '',
            noticeType: raw.columns?.[0]?.column_name || '',
            noticeTitle: raw.title || '',
            noticeUrl: noticeUrl,
            id: `${stockCode}_${artCode}_${index}`,
        };
    }
    async getNotices(params) {
        const page = params.page || 1;
        const pageSize = Math.min(params.pageSize || 20, 50);
        const requestParams = {
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
            const response = this.fetchData(requestParams);
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
        }
        catch (error) {
            console.error('Error in getNotices:', error);
            throw error;
        }
    }
}
exports.EastMoneyService = EastMoneyService;
exports.eastMoneyService = new EastMoneyService();
//# sourceMappingURL=eastmoney.js.map