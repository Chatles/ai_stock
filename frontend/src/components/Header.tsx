import React, { useState } from 'react';

interface HeaderProps {
  onSearch: (keyword: string) => void;
  noticeTypes?: Array<{ type: string; count: number }>;
  currentNoticeType?: string;
  onNoticeTypeChange?: (type: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  onSearch,
  noticeTypes = [],
  currentNoticeType = '',
  onNoticeTypeChange
}) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = () => {
    onSearch(searchValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <span className="logo-icon">📈</span>
          <span className="logo-text">A股公告</span>
        </div>

        <div className="header-controls">
          {noticeTypes.length > 0 && onNoticeTypeChange && (
            <div className="notice-type-selector">
              <select
                value={currentNoticeType}
                onChange={(e) => onNoticeTypeChange(e.target.value)}
                className="notice-type-select"
              >
                <option value="">全部类型</option>
                {noticeTypes.map((item) => (
                  <option key={item.type} value={item.type}>
                    {item.type} ({item.count})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="search-box">
            <input
              type="text"
              placeholder="搜索公司名称、股票代码或首字母..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="search-input"
            />
            <button onClick={handleSearch} className="search-btn">
              搜索
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
