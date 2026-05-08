import React from 'react';
import { Notice, NoticeAnalysis } from '../types';

interface NoticeCardProps {
  notice: Notice;
  analysis?: NoticeAnalysis;
  index: number;
}

const NoticeCard: React.FC<NoticeCardProps> = ({ notice, analysis, index }) => {
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

  const getAnalysisBadge = (result: string, level: number): { bg: string; text: string } => {
    switch (result) {
      case '利好':
        return { bg: '#52c41a', text: `利好 ${level}分` };
      case '无影响':
        return { bg: '#d9d9d9', text: '无影响' };
      case '待定':
        return { bg: '#faad14', text: '待定' };
      default:
        return { bg: '#d9d9d9', text: '未分析' };
    }
  };

  const badge = analysis ? getAnalysisBadge(analysis.analysis_result, analysis.利好程度) : null;

  return (
    <div
      className={`notice-card ${analysis ? 'has-analysis' : ''}`}
      onClick={handleClick}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="notice-header">
        <span className="company-badge">{getMarketBadge(notice.securityCode)}</span>
        <span className="stock-code">{notice.securityCode}</span>
        <span className="company-name">{notice.securityNameAbbr}</span>
        {badge && (
          <span
            className="analysis-badge"
            style={{ backgroundColor: badge.bg }}
          >
            {badge.text}
          </span>
        )}
      </div>
      <h3 className="notice-title">{notice.noticeTitle}</h3>
      {analysis && analysis.analysis_reason && (
        <div className="analysis-reason" title={analysis.analysis_reason}>
          {analysis.analysis_reason}
        </div>
      )}
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
