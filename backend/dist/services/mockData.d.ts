import { Notice } from '../types';
export declare class MockDataService {
    getNotices(params: {
        page?: number;
        pageSize?: number;
        keyword?: string;
        market?: string;
    }): {
        list: Notice[];
        total: number;
        page: number;
        pageSize: number;
    };
}
export declare const mockDataService: MockDataService;
//# sourceMappingURL=mockData.d.ts.map