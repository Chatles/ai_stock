import React from 'react';
import { MarketType } from '../types';

interface FilterPanelProps {
  currentMarket: MarketType;
  onMarketChange: (market: MarketType) => void;
}

const markets: { value: MarketType; label: string; description: string }[] = [
  { value: 'ALL', label: '全部市场', description: '沪深京A股' },
  { value: 'SHA', label: '沪市主板', description: '上海证券交易所主板' },
  { value: 'KCB', label: '科创板', description: '上海证券交易所科创板' },
  { value: 'SZA', label: '深市主板', description: '深圳证券交易所主板' },
  { value: 'CYB', label: '创业板', description: '深圳证券交易所创业板' },
];

const FilterPanel: React.FC<FilterPanelProps> = ({ currentMarket, onMarketChange }) => {
  return (
    <aside className="filter-panel">
      <div className="filter-header">
        <span className="filter-icon">📊</span>
        <span>市场筛选</span>
      </div>
      <div className="filter-list">
        {markets.map((item) => (
          <button
            key={item.value}
            className={`filter-item ${currentMarket === item.value ? 'active' : ''}`}
            onClick={() => onMarketChange(item.value)}
            title={item.description}
          >
            <span className="filter-label">{item.label}</span>
            {currentMarket === item.value && <span className="active-indicator">✓</span>}
          </button>
        ))}
      </div>
      <div className="filter-footer">
        <p className="filter-hint">数据来源：东方财富</p>
      </div>
    </aside>
  );
};

export default FilterPanel;
