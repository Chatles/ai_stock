import React, { useState } from 'react';
import { Notice } from '../types';
import { analyzeNotice, getFundamental } from '../services/api';

interface NoticeCardProps {
  notice: Notice;
  analysis?: any;
}

const NoticeCard: React.FC<NoticeCardProps> = ({ notice, analysis }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [showFundamental, setShowFundamental] = useState(false);
  const [fundamentalData, setFundamentalData] = useState<string | null>(null);

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    return dateStr.split(' ')[0].replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$2-$3');
  };

  const handleClick = () => {
    if (notice.noticeUrl) {
      window.open(notice.noticeUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getMarketBadge = (code: string): string => {
    if (code.startsWith('6')) return '沪';
    if (code.startsWith('688')) return '科';
    if (code.startsWith('3')) return '创';
    return '深';
  };

  const getResultBadge = (result: string | null, level: number): { bg: string; text: string } => {
    if (!result) return { bg: '#999', text: '未分析' };
    switch (result) {
      case '利好': return { bg: '#52c41a', text: `利好${level}分` };
      case '无影响': return { bg: '#999', text: '无影响' };
      case '待定': return { bg: '#faad14', text: '待定' };
      default: return { bg: '#999', text: '未知' };
    }
  };

  const handleAnalyze = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (analyzing) return;
    setAnalyzing(true);
    try {
      await analyzeNotice(notice);
      window.location.reload();
    } catch (error) {
      console.error('分析失败:', error);
      alert('分析失败，请重试');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleShowFundamental = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showFundamental && fundamentalData) {
      setShowFundamental(false);
      setFundamentalData(null);
      return;
    }
    setShowFundamental(true);
    setFundamentalData('加载中...');
    try {
      const result = await getFundamental(notice.securityCode);
      setFundamentalData(result.data.fundamental);
    } catch (error) {
      console.error('获取基本面失败:', error);
      setFundamentalData('获取失败，请重试');
    }
  };

  const badge = analysis ? getResultBadge(analysis.analysis_result, analysis.利好程度) : null;

  return (
    <div className={`notice-card compact ${analysis?.analysis_result === '利好' ? 'has-bullish' : ''}`}>
      <div className="compact-header">
        <span className="market-tag">{getMarketBadge(notice.securityCode)}</span>
        <span className="stock-name">{notice.securityNameAbbr}</span>
        <span className="stock-code">{notice.securityCode}</span>
        {badge ? (
          <span className="result-badge" style={{ backgroundColor: badge.bg }}>{badge.text}</span>
        ) : (
          <button
            className="action-btn analyze-btn"
            onClick={handleAnalyze}
            disabled={analyzing}
          >
            {analyzing ? '分析中...' : 'AI分析'}
          </button>
        )}
        <button className="action-btn fundamental-btn" onClick={handleShowFundamental}>
          基本面
        </button>
      </div>
      <div className="compact-title" onClick={handleClick} title={notice.noticeTitle}>
        {notice.noticeTitle.length > 60 ? notice.noticeTitle.substring(0, 60) + '...' : notice.noticeTitle}
      </div>
      {showFundamental && fundamentalData && (
        <div className="fundamental-panel">
          <div className="fundamental-title">📊 {notice.securityNameAbbr}({notice.securityCode}) 基本面</div>
          <pre className="fundamental-content">{fundamentalData}</pre>
        </div>
      )}
      {analysis && analysis.content_summary && (
        <div className="compact-summary">
          <span className="summary-label">摘要:</span> {analysis.content_summary}
        </div>
      )}
      {analysis && analysis.price_change_predict && (
        <div className="price-predict">
          📈 {analysis.price_change_predict}
        </div>
      )}
      <div className="compact-footer">
        <span className="notice-type">{notice.noticeType}</span>
        <span className="notice-date">{formatDate(notice.noticeDate)}</span>
      </div>
    </div>
  );
};

export default NoticeCard;
