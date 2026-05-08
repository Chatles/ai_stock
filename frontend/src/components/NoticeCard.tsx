import React from 'react';
import { Notice } from '../types';

interface NoticeCardProps {
  notice: Notice;
  index: number;
}

const NoticeCard: React.FC<NoticeCardProps> = ({ notice, index }) => {
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const handleClick = () => {
    if (notice.noticeUrl) {
      window.open(notice.noticeUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getMarketBadge = (code: string): string => {
    if (code.startsWith('6')) return '沪市';
    if (code.startsWith('0') && !code.startsWith('00')) return '深市';
    if (code.startsWith('00')) return '深市';
    if (code.startsWith('3')) return '创业板';
    if (code.startsWith('688')) return '科创板';
    return '其他';
  };

  return (
    <div
      className="notice-card"
      onClick={handleClick}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="notice-header">
        <span className="company-badge">{getMarketBadge(notice.securityCode)}</span>
        <span className="stock-code">{notice.securityCode}</span>
        <span className="company-name">{notice.securityNameAbbr}</span>
      </div>
      <h3 className="notice-title">{notice.noticeTitle}</h3>
      <div className="notice-footer">
        <span className="notice-type">{notice.noticeType}</span>
        <span className="notice-date">{formatDate(notice.noticeDate)}</span>
      </div>
      {notice.noticeUrl && (
        <div className="notice-link-indicator">
          <span>查看PDF</span>
          <span className="link-arrow">→</span>
        </div>
      )}
    </div>
  );
};

export default NoticeCard;
