import React from 'react';
import { MarketType, AnalysisFilter } from '../types';

interface FilterPanelProps {
  currentMarket: MarketType;
  currentAnalysisFilter: AnalysisFilter;
  onMarketChange: (market: MarketType) => void;
  onAnalysisFilterChange: (filter: AnalysisFilter) => void;
  onSortChange: (sortBy: '利好程度' | 'notice_date', order: 'ASC' | 'DESC') => void;
}

const markets: { value: MarketType; label: string }[] = [
  { value: 'ALL', label: '全部' },
  { value: 'SHA', label: '沪市' },
  { value: 'KCB', label: '科创' },
  { value: 'SZA', label: '深市' },
  { value: 'CYB', label: '创业板' },
];

const analysisFilters: { value: AnalysisFilter; label: string; color: string }[] = [
  { value: 'ALL', label: '全部', color: '#666' },
  { value: '利好', label: '利好', color: '#52c41a' },
  { value: '待定', label: '待定', color: '#faad14' },
  { value: '无影响', label: '无影响', color: '#999' },
];

const FilterPanel: React.FC<FilterPanelProps> = ({
  currentMarket,
  currentAnalysisFilter,
  onMarketChange,
  onAnalysisFilterChange,
  onSortChange,
}) => {
  return (
    <aside className="filter-panel">
      <div className="filter-section">
        <div className="filter-header">
          <span className="filter-icon">📊</span>
          <span>市场</span>
        </div>
        <div className="filter-list">
          {markets.map((item) => (
            <button
              key={item.value}
              className={`filter-item ${currentMarket === item.value ? 'active' : ''}`}
              onClick={() => onMarketChange(item.value)}
            >
              <span className="filter-label">{item.label}</span>
              {currentMarket === item.value && <span className="active-indicator">✓</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-header">
          <span className="filter-icon">🎯</span>
          <span>分析结果</span>
        </div>
        <div className="filter-list">
          {analysisFilters.map((item) => (
            <button
              key={item.value}
              className={`filter-item ${currentAnalysisFilter === item.value ? 'active' : ''}`}
              onClick={() => onAnalysisFilterChange(item.value)}
            >
              <span className="filter-label">{item.label}</span>
              {currentAnalysisFilter === item.value && <span className="active-indicator">✓</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-header">
          <span className="filter-icon">📅</span>
          <span>排序方式</span>
        </div>
        <div className="filter-list">
          <button
            className="filter-item"
            onClick={() => onSortChange('notice_date', 'DESC')}
          >
            <span className="filter-label">最新优先</span>
          </button>
          <button
            className="filter-item"
            onClick={() => onSortChange('利好程度', 'DESC')}
          >
            <span className="filter-label">利好程度</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default FilterPanel;
