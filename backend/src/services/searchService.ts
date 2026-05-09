import { Notice, QueryParams } from '../types';
import { SearchHelper } from './searchHelper';

export interface SearchResult {
  list: Notice[];
  total: number;
  page: number;
  pageSize: number;
}

export class SearchService {
  static filterNotices(
    notices: Notice[],
    keyword?: string
  ): Notice[] {
    if (!keyword) {
      return notices;
    }

    return notices.filter(notice =>
      SearchHelper.matchesSearchV2(
        notice.securityNameAbbr,
        notice.securityCode,
        keyword
      )
    );
  }

  static applyFilters(
    notices: Notice[],
    params: QueryParams
  ): SearchResult {
    let filtered = [...notices];

    if (params.keyword) {
      filtered = this.filterNotices(filtered, params.keyword);
    }

    const total = filtered.length;
    const page = params.page || 1;
    const pageSize = Math.min(params.pageSize || 20, 50);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      list: filtered.slice(start, end),
      total,
      page,
      pageSize,
    };
  }
}
