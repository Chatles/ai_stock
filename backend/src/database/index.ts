import Database from 'better-sqlite3';
import path from 'path';
import { initSchema } from './schema';
import fs from 'fs';

const DB_PATH = path.join(__dirname, '../../data/notices.db');

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initSchema(db);
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
