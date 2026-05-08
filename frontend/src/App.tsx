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
  const [, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [market, setMarket] = useState<MarketType>('ALL');
  const [, setKeyword] = useState<string>('');
  const [analysisFilter, setAnalysisFilter] = useState<AnalysisFilter>('ALL');
  const [sortBy, setSortBy] = useState<'利好程度' | 'notice_date'>('利好程度');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);

  const fetchAnalysisData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getAnalysisNotices(analysisFilter, sortBy, order);
      setAnalysisMap(
        result.notices.reduce((acc, item) => {
          acc[item.notice_id] = item;
          return acc;
        }, {} as Record<string, NoticeAnalysis>)
      );
      setNotices(result.notices.map(n => ({
        noticeDate: n.notice_date,
        securityCode: n.security_code,
        securityNameAbbr: n.security_name,
        noticeType: n.notice_type,
        noticeTitle: n.notice_title,
        noticeUrl: n.notice_url,
        id: n.notice_id,
      })));
      setTotal(result.total);
    } catch (err) {
      setError('获取分析数据失败');
      console.error('Fetch analysis error:', err);
    } finally {
      setLoading(false);
    }
  }, [analysisFilter, sortBy, order]);

  useEffect(() => {
    if (showAnalysis) {
      fetchAnalysisData();
    }
  }, [showAnalysis, fetchAnalysisData]);

  const handleMarketChange = (newMarket: MarketType) => {
    setMarket(newMarket);
    setPage(1);
  };

  const handleAnalysisFilterChange = (filter: AnalysisFilter) => {
    setAnalysisFilter(filter);
  };

  const handleSortChange = (newSortBy: '利好程度' | 'notice_date', newOrder: 'ASC' | 'DESC') => {
    setSortBy(newSortBy);
    setOrder(newOrder);
  };

  const handleToggleView = () => {
    setShowAnalysis(!showAnalysis);
  };

  const handleSearch = (searchKeyword: string) => {
    setKeyword(searchKeyword);
    setPage(1);
  };

  return (
    <div className="app">
      <Header onSearch={handleSearch} />
      <div className="main-container">
        <FilterPanel
          currentMarket={market}
          currentAnalysisFilter={analysisFilter}
          onMarketChange={handleMarketChange}
          onAnalysisFilterChange={handleAnalysisFilterChange}
          onSortChange={handleSortChange}
        />
        <div className="content-area">
          <div className="stats-bar">
            <button className="view-toggle" onClick={handleToggleView}>
              {showAnalysis ? '查看全部公告' : '查看分析结果'}
            </button>
            <span className="total-count">共 {total.toLocaleString()} 条</span>
          </div>
          {error ? (
            <div className="error-message">
              <span className="error-icon">!</span>
              <span>{error}</span>
            </div>
          ) : (
            <div className="notice-list">
              {loading ? (
                [...Array(5)].map((_, index) => (
                  <div key={index} className="notice-card skeleton">
                    <div className="skeleton-line title"></div>
                    <div className="skeleton-line company"></div>
                    <div className="skeleton-line meta"></div>
                  </div>
                ))
              ) : notices.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📭</span>
                  <p className="empty-text">
                    {showAnalysis ? '暂无分析数据，请稍后刷新' : '暂无公告数据'}
                  </p>
                </div>
              ) : (
                notices.map((notice, index) => (
                  <NoticeCard
                    key={notice.id || index}
                    notice={notice}
                    analysis={showAnalysis ? analysisMap[notice.id || ''] : undefined}
                    index={index}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
