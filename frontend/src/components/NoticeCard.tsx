import React, { useState } from 'react';
import { Notice, NoticeAnalysis } from '../types';
import { analyzeNotice, getFundamental } from '../services/api';

interface NoticeCardProps {
  notice: Notice;
  analysis?: NoticeAnalysis | null;
}

const NoticeCard: React.FC<NoticeCardProps> = ({ notice, analysis }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [showFundamental, setShowFundamental] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
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
    if (!result) return { bg: '#666', text: '未分析' };
    switch (result) {
      case '利好': return { bg: '#52c41a', text: `利好 ${level}分` };
      case '无影响': return { bg: '#999', text: '无影响' };
      case '待定': return { bg: '#faad14', text: '待定' };
      default: return { bg: '#666', text: '未知' };
    }
  };

  const handleAnalyze = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (analyzing) return;

    console.log('开始分析公告:', notice.noticeTitle);
    setAnalyzing(true);

    try {
      const result = await analyzeNotice(notice);
      console.log('分析成功:', result);

      if (result.code === 200) {
        window.location.reload();
      }
    } catch (error) {
      console.error('分析失败:', error);
      alert('分析失败，请重试');
      setAnalyzing(false);
    }
  };

  const handleShowFundamental = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (showFundamental) {
      setShowFundamental(false);
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

  const handleShowDetail = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDetail(!showDetail);
  };

  const badge = getResultBadge(analysis?.analysis_result || null, analysis?.利好程度 || 0);

  return (
    <div className={`notice-card compact ${analysis?.analysis_result === '利好' ? 'has-bullish' : ''}`}>
      <div className="compact-header">
        <span className="market-tag">{getMarketBadge(notice.securityCode)}</span>
        <span className="stock-name">{notice.securityNameAbbr}</span>
        <span className="stock-code">{notice.securityCode}</span>
        <span className="result-badge" style={{ backgroundColor: badge.bg }}>{badge.text}</span>
      </div>

      <div className="compact-title" onClick={handleClick}>
        {notice.noticeTitle.length > 60 ? notice.noticeTitle.substring(0, 60) + '...' : notice.noticeTitle}
      </div>

      {analysis?.content_summary && (
        <div className="compact-summary">
          <span className="summary-label">📝 摘要:</span> {analysis.content_summary}
        </div>
      )}

      {analysis?.price_change_predict && (
        <div className="price-predict">
          📈 {analysis.price_change_predict}
        </div>
      )}

      <div className="compact-footer">
        <span className="notice-type">{notice.noticeType}</span>
        <span className="notice-date">{formatDate(notice.noticeDate)}</span>
        <div className="action-buttons">
          <button className="action-btn analyze-btn" onClick={handleAnalyze} disabled={analyzing}>
            {analyzing ? '分析中...' : (analysis ? '重新分析' : 'AI分析')}
          </button>
          <button className="action-btn fundamental-btn" onClick={handleShowFundamental}>
            {showFundamental ? '收起' : '基本面'}
          </button>
          {analysis && (
            <button className="action-btn detail-btn" onClick={handleShowDetail}>
              {showDetail ? '收起详情' : '查看详情'}
            </button>
          )}
        </div>
      </div>

      {showFundamental && fundamentalData && (
        <div className="fundamental-panel">
          <div className="panel-title">📊 {notice.securityNameAbbr}({notice.securityCode}) 基本面数据</div>
          <pre className="panel-content">{fundamentalData}</pre>
        </div>
      )}

      {showDetail && analysis && (
        <div className="detail-panel">
          {analysis.fundamental_analysis && (
            <div className="detail-section">
              <div className="detail-title">💰 基本面分析</div>
              <div className="detail-content">{analysis.fundamental_analysis}</div>
            </div>
          )}
          {analysis.industry_analysis && (
            <div className="detail-section">
              <div className="detail-title">🏭 行业分析</div>
              <div className="detail-content">{analysis.industry_analysis}</div>
            </div>
          )}
          {analysis.competitive_analysis && (
            <div className="detail-section">
              <div className="detail-title">⚔️ 竞争分析</div>
              <div className="detail-content">{analysis.competitive_analysis}</div>
            </div>
          )}
          {analysis.analysis_reason && (
            <div className="detail-section">
              <div className="detail-title">💡 综合判断</div>
              <div className="detail-content">{analysis.analysis_reason}</div>
            </div>
          )}
          {analysis.fundamental_data && (
            <div className="detail-section">
              <div className="detail-title">📈 财务数据</div>
              <pre className="detail-content">{analysis.fundamental_data}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NoticeCard;
