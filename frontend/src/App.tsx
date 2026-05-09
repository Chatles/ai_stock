import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import { Notice, NoticeAnalysis, MarketType, AnalysisFilter } from './types';
import Header from './components/Header';
import FilterPanel from './components/FilterPanel';
import NoticeCard from './components/NoticeCard';
import './styles/App.css';

const App: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [analysisMap, setAnalysisMap] = useState<Record<string, NoticeAnalysis>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [pageSize] = useState<number>(50);
  const [market, setMarket] = useState<MarketType>('ALL');
  const [keyword, setKeyword] = useState<string>('');
  const [noticeType, setNoticeType] = useState<string>('');
  const [noticeTypes, setNoticeTypes] = useState<Array<{ type: string; count: number }>>([]);
  const [analysisFilter, setAnalysisFilter] = useState<AnalysisFilter>('ALL');
  const [sortBy, setSortBy] = useState<'利好程度' | 'notice_date'>('利好程度');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [viewMode, setViewMode] = useState<'all' | 'analysis'>('all');

  const fetchNoticeTypes = useCallback(async () => {
    try {
      const result = await api.getNoticeTypes();
      if (result.code === 200) {
        setNoticeTypes(result.data);
      }
    } catch (err) {
      console.error('Fetch notice types error:', err);
    }
  }, []);

  const fetchAnalysisData = useCallback(async () => {
    try {
      const result = await api.getAnalysisNotices(undefined, 'notice_date', 'DESC');
      const newMap: Record<string, NoticeAnalysis> = {};
      result.notices.forEach(item => {
        newMap[item.notice_id] = item;
      });
      setAnalysisMap(prev => ({ ...prev, ...newMap }));
    } catch (err) {
      console.error('Fetch analysis data error:', err);
    }
  }, []);

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getNotices({
        page,
        pageSize,
        market,
        keyword: keyword || undefined,
        noticeType: noticeType || undefined,
      });
      if (response.code === 200) {
        setNotices(response.data.list);
        setTotal(response.data.total);
      } else {
        setError(response.message || '获取数据失败');
      }
    } catch (err) {
      setError('网络请求失败');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, market, keyword, noticeType]);

  useEffect(() => {
    if (viewMode === 'all') {
      fetchNotices();
    }
  }, [viewMode, fetchNotices]);

  useEffect(() => {
    fetchAnalysisData();
  }, [fetchAnalysisData]);

  useEffect(() => {
    fetchNoticeTypes();
  }, [fetchNoticeTypes]);

  const handleMarketChange = (newMarket: MarketType) => {
    setMarket(newMarket);
    setPage(1);
  };

  const handleNoticeTypeChange = (newType: string) => {
    setNoticeType(newType);
    setPage(1);
  };

  const handleAnalysisFilterChange = (filter: AnalysisFilter) => {
    setAnalysisFilter(filter);
  };

  const handleSortChange = (newSortBy: '利好程度' | 'notice_date', newOrder: 'ASC' | 'DESC') => {
    setSortBy(newSortBy);
    setOrder(newOrder);
  };

  const handleSearch = (searchKeyword: string) => {
    setKeyword(searchKeyword);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleViewModeChange = (mode: 'all' | 'analysis') => {
    setViewMode(mode);
    if (mode === 'analysis') {
      fetchAnalysisData();
    }
  };

  const getFilteredNotices = () => {
    if (viewMode === 'analysis') {
      const allAnalysis = Object.values(analysisMap);
      let filtered = analysisFilter === 'ALL'
        ? allAnalysis
        : allAnalysis.filter(a => a.analysis_result === analysisFilter);

      if (sortBy === '利好程度') {
        filtered.sort((a, b) => order === 'DESC' ? b.利好程度 - a.利好程度 : a.利好程度 - b.利好程度);
      } else {
        filtered.sort((a, b) => order === 'DESC'
          ? b.notice_date.localeCompare(a.notice_date)
          : a.notice_date.localeCompare(b.notice_date));
      }

      return filtered.map(a => ({
        noticeDate: a.notice_date,
        securityCode: a.security_code,
        securityNameAbbr: a.security_name,
        noticeType: a.notice_type,
        noticeTitle: a.notice_title,
        noticeUrl: a.notice_url || '',
        id: a.notice_id,
      }));
    }

    return notices.map(notice => {
      const analysis = analysisMap[notice.id || ''];
      return { ...notice, _analysis: analysis };
    });
  };

  const displayNotices = getFilteredNotices();
  const displayTotal = viewMode === 'analysis'
    ? Object.values(analysisMap).length
    : total;

  return (
    <div className="app">
      <Header
        onSearch={handleSearch}
        noticeTypes={noticeTypes}
        currentNoticeType={noticeType}
        onNoticeTypeChange={handleNoticeTypeChange}
      />
      <div className="main-container">
        <FilterPanel
          currentMarket={market}
          currentAnalysisFilter={analysisFilter}
          currentNoticeType={noticeType}
          noticeTypes={noticeTypes}
          onMarketChange={handleMarketChange}
          onAnalysisFilterChange={handleAnalysisFilterChange}
          onNoticeTypeChange={handleNoticeTypeChange}
          onSortChange={handleSortChange}
        />
        <div className="content-area">
          <div className="stats-bar">
            <div className="view-toggles">
              <button
                className={`view-toggle ${viewMode === 'all' ? 'active' : ''}`}
                onClick={() => handleViewModeChange('all')}
              >
                全部公告
              </button>
              <button
                className={`view-toggle ${viewMode === 'analysis' ? 'active' : ''}`}
                onClick={() => handleViewModeChange('analysis')}
              >
                分析结果
              </button>
            </div>
            <span className="total-count">共 {displayTotal.toLocaleString()} 条</span>
          </div>
          {error ? (
            <div className="error-message">
              <span className="error-icon">!</span>
              <span>{error}</span>
            </div>
          ) : (
            <div className="notice-list compact">
              {loading ? (
                [...Array(10)].map((_, index) => (
                  <div key={index} className="notice-card compact skeleton">
                    <div className="skeleton-line title"></div>
                    <div className="skeleton-line company"></div>
                    <div className="skeleton-line meta"></div>
                  </div>
                ))
              ) : displayNotices.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📭</span>
                  <p className="empty-text">
                    {viewMode === 'analysis' ? '暂无分析数据，请先在"全部公告"中点击AI分析' : '暂无公告数据'}
                  </p>
                </div>
              ) : (
                displayNotices.map((notice: any, index) => (
                  <NoticeCard
                    key={(notice as any).id || index}
                    notice={notice}
                    analysis={(notice as any)._analysis || analysisMap[(notice as any).id || '']}
                  />
                ))
              )}
            </div>
          )}
          {viewMode === 'all' && total > pageSize && (
            <div className="pagination">
              <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>
                上一页
              </button>
              <span>第 {page} 页</span>
              <button onClick={() => handlePageChange(page + 1)} disabled={page >= Math.ceil(total / pageSize)}>
                下一页
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
