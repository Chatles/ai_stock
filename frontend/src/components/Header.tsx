import React, { useState } from 'react';

interface HeaderProps {
  onSearch: (keyword: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
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
        <div className="search-box">
          <input
            type="text"
            placeholder="搜索公司名称或股票代码..."
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
    </header>
  );
};

export default Header;
