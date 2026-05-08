import { Notice, QueryParams } from '../types';
export declare class EastMoneyService {
    private fetchData;
    private mapToNotice;
    getNotices(params: QueryParams): Promise<{
        list: Notice[];
        total: number;
        page: number;
        pageSize: number;
    }>;
}
export declare const eastMoneyService: EastMoneyService;
//# sourceMappingURL=eastmoney.d.ts.map