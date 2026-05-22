import Database from 'better-sqlite3';
import path from 'path';

// Prevent multiple instances of the database in Next.js hot-reloading
const globalForDb = global as unknown as { db: Database.Database };
const dbPath = path.resolve(process.cwd(), 'level_shield.db');

export const db = globalForDb.db || new Database(dbPath);

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
db.exec(`
  -- sessions: Tracks unique client sessions
  CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      user_agent TEXT,
      ip_address TEXT,
      fingerprint TEXT,
      is_good_bot INTEGER DEFAULT 0
  );

  -- request_events: Logs all page views and API requests
  CREATE TABLE IF NOT EXISTS request_events (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      url TEXT,
      method TEXT,
      referrer TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE
  );

  -- behavior_events: Tracks mouse, scroll, and keyboard telemetry
  CREATE TABLE IF NOT EXISTS behavior_events (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      event_type TEXT, -- 'mouse_move', 'scroll', 'keypress', 'paste', 'dwell', etc.
      details TEXT, -- JSON string of telemetry data
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE
  );

  -- risk_events: Records risk assessments and score details
  CREATE TABLE IF NOT EXISTS risk_events (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      score INTEGER,
      reasons TEXT, -- JSON string array of RiskReason
      confidence REAL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE
  );

  -- defense_actions: Tracks applied mitigations and their results
  CREATE TABLE IF NOT EXISTS defense_actions (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      action TEXT, -- DefenseAction
      resolved INTEGER DEFAULT 0, -- 1 if challenge was solved
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE
  );

  -- canary_tokens: Links session to generated canary tokens
  CREATE TABLE IF NOT EXISTS canary_tokens (
      token TEXT PRIMARY KEY,
      session_id TEXT,
      exposed INTEGER DEFAULT 0,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE
  );

  -- honey_maze_hits: Records bot trap hits
  CREATE TABLE IF NOT EXISTS honey_maze_hits (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      token TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE
  );

  -- agent_beacons: Logs visits to hidden AI agent endpoints
  CREATE TABLE IF NOT EXISTS agent_beacons (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      token TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE
  );
`);
