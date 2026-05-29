export const CREATE_TABLES = `
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#6366f1',
    icon TEXT NOT NULL DEFAULT 'tag',
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    amount REAL NOT NULL CHECK(amount > 0),
    date TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT,
    payment_method TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS recurrents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    amount REAL NOT NULL CHECK(amount > 0),
    frequency TEXT NOT NULL CHECK(frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    start_date TEXT NOT NULL,
    last_applied TEXT,
    active INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS saving_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    target_amount REAL NOT NULL,
    target_type TEXT NOT NULL CHECK(target_type IN ('fixed', 'percent')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`;

export const DEFAULT_CATEGORIES = [
  { name: 'Alimentación', color: '#f97316', icon: 'utensils', type: 'expense' },
  { name: 'Transporte', color: '#3b82f6', icon: 'car', type: 'expense' },
  { name: 'Ocio', color: '#a855f7', icon: 'gamepad', type: 'expense' },
  { name: 'Salud', color: '#22c55e', icon: 'heart', type: 'expense' },
  { name: 'Hogar', color: '#eab308', icon: 'home', type: 'expense' },
  { name: 'Salario', color: '#06b6d4', icon: 'briefcase', type: 'income' },
  { name: 'Freelance', color: '#ec4899', icon: 'laptop', type: 'income' },
];