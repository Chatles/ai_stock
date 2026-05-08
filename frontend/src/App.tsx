import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Notice, MarketType } from '../types';
import Header from './components/Header';
import FilterPanel from './components/FilterPanel';
import NoticeList from './components/NoticeList';
import './styles/App.css';

const App: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [pageSize] = useState<number>(20);
  const [market, setMarket] = useState<MarketType>('ALL');
  const [keyword, setKeyword] = useState<string>('');

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getNotices({
        page,
        pageSize,
        market,
        keyword: keyword || undefined,
      });
      if (response.code === 200) {
        setNotices(response.data.list);
        setTotal(response.data.total);
      } else {
        setError(response.message || '获取数据失败');
      }
    } catch (err) {
      setError('网络请求失败，请稍后重试');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, market, keyword]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleMarketChange = (newMarket: MarketType) => {
    setMarket(newMarket);
    setPage(1);
  };

  const handleSearch = (searchKeyword: string) => {
    setKeyword(searchKeyword);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app">
      <Header onSearch={handleSearch} />
      <div className="main-container">
        <FilterPanel
          currentMarket={market}
          onMarketChange={handleMarketChange}
        />
        <div className="content-area">
          <div className="stats-bar">
            <span className="total-count">共 {total.toLocaleString()} 条公告</span>
            <span className="page-info">
              第 {page} 页 / 共 {Math.ceil(total / pageSize)} 页
            </span>
          </div>
          {error ? (
            <div className="error-message">
              <span className="error-icon">!</span>
              <span>{error}</span>
            </div>
          ) : (
            <NoticeList
              notices={notices}
              loading={loading}
              currentPage={page}
              pageSize={pageSize}
              total={total}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
