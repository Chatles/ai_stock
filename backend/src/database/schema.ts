import Database from 'better-sqlite3';

export function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS notice_analysis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      notice_id TEXT UNIQUE NOT NULL,
      security_code TEXT NOT NULL,
      security_name TEXT NOT NULL,
      notice_title TEXT NOT NULL,
      notice_date TEXT NOT NULL,
      notice_url TEXT,
      notice_type TEXT,
      is_filtered INTEGER DEFAULT 0,
      filter_reason TEXT,
      analysis_status TEXT DEFAULT 'pending' CHECK(analysis_status IN ('pending', 'analyzing', 'completed', 'failed')),
      analysis_result TEXT CHECK(analysis_result IN ('利好', '无影响', '待定')),
      利好程度 INTEGER CHECK(利好程度 >= 0 AND 利好程度 <= 5),
      price_change_predict TEXT,
      content_summary TEXT,
      fundamental_analysis TEXT,
      industry_analysis TEXT,
      competitive_analysis TEXT,
      analysis_reason TEXT,
      notice_content TEXT,
      fundamental_data TEXT,
      analyzed_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_notice_date ON notice_analysis(notice_date);
    CREATE INDEX IF NOT EXISTS idx_analysis_result ON notice_analysis(analysis_result);
    CREATE INDEX IF NOT EXISTS idx_security_code ON notice_analysis(security_code);
    CREATE INDEX IF NOT EXISTS idx_analysis_status ON notice_analysis(analysis_status);
    CREATE INDEX IF NOT EXISTS idx_is_filtered ON notice_analysis(is_filtered);
  `);
}
