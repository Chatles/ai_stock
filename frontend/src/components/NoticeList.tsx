import React from 'react';
import { Notice } from '../types';
import NoticeCard from './NoticeCard';

interface NoticeListProps {
  notices: Notice[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

const NoticeList: React.FC<NoticeListProps> = ({
  notices,
  loading,
  currentPage,
  pageSize,
  total,
  onPageChange,
}) => {
  if (loading) {
    return (
      <div className="notice-list">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="notice-card skeleton">
            <div className="skeleton-line title"></div>
            <div className="skeleton-line company"></div>
            <div className="skeleton-line meta"></div>
          </div>
        ))}
      </div>
    );
  }

  if (notices.length === 0) {
    return (
      <div className="notice-list empty">
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p className="empty-text">暂无公告数据</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="notice-list-container">
      <div className="notice-list">
        {notices.map((notice, index) => (
          <NoticeCard
            key={notice.id || `${notice.securityCode}_${notice.noticeDate}_${index}`}
            notice={notice}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn prev"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            上一页
          </button>
          <div className="page-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  className={`page-num ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            className="page-btn next"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
};

export default NoticeList;
