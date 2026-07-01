const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../../cookmarked.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    instagram_id TEXT UNIQUE,
    email TEXT UNIQUE,
    password_hash TEXT,
    name TEXT,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, name)
  );

  CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    emoji TEXT,
    is_favorite INTEGER DEFAULT 0,
    share_token TEXT UNIQUE,
    last_opened_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS reels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    title TEXT,
    thumbnail TEXT,
    platform TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );
`);

function ensureColumn(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all().map((info) => info.name);
  if (!columns.includes(column)) {
    db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
  }
}

ensureColumn('users', 'email', 'TEXT');
ensureColumn('users', 'password_hash', 'TEXT');
ensureColumn('users', 'avatar_url', 'TEXT');
ensureColumn('users', 'clerk_id', 'TEXT');
db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)').run();
db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id)').run();

ensureColumn('collections', 'last_opened_at', 'DATETIME');

ensureColumn('reels', 'collection_id', 'INTEGER');
ensureColumn('reels', 'category', 'TEXT');
ensureColumn('reels', 'description', 'TEXT');
ensureColumn('reels', 'note', 'TEXT');
ensureColumn('reels', 'is_favorite', 'INTEGER DEFAULT 0');
ensureColumn('reels', 'status', "TEXT DEFAULT 'saved'");

const legacyCompletionColumn = ['is', 'made'].join('_');
let currentReelsColumns = db.prepare('PRAGMA table_info(reels)').all().map((column) => column.name);
if (currentReelsColumns.includes(legacyCompletionColumn) && !currentReelsColumns.includes('is_watched')) {
  db.prepare(`ALTER TABLE reels RENAME COLUMN ${legacyCompletionColumn} TO is_watched`).run();
}
ensureColumn('reels', 'is_watched', 'INTEGER DEFAULT 0');
currentReelsColumns = db.prepare('PRAGMA table_info(reels)').all().map((column) => column.name);
if (currentReelsColumns.includes(legacyCompletionColumn)) {
  db.prepare(`UPDATE reels SET is_watched = COALESCE(is_watched, ${legacyCompletionColumn}, 0)`).run();
}

// Migrate reels table — make category_id nullable
// SQLite can't ALTER column constraints, so we do a safe table swap
const reelsCols = db.prepare('PRAGMA table_info(reels)').all()
const catIdCol = reelsCols.find(c => c.name === 'category_id')
if (catIdCol && catIdCol.notnull === 1) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS reels_new (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL,
      category_id INTEGER,
      collection_id INTEGER,
      url         TEXT NOT NULL,
      title       TEXT,
      thumbnail   TEXT,
      platform    TEXT,
      category    TEXT,
      note        TEXT,
      is_favorite INTEGER DEFAULT 0,
      status      TEXT DEFAULT 'saved',
      is_watched  INTEGER DEFAULT 0,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    INSERT INTO reels_new SELECT
      id, user_id, category_id, collection_id, url,
      title, thumbnail, platform, category, note,
      is_favorite, status, is_watched, created_at
    FROM reels;
    DROP TABLE reels;
    ALTER TABLE reels_new RENAME TO reels;
  `)
}

db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_collections_share_token ON collections(share_token)').run();

const usersWithOrphanReels = db.prepare(`
  SELECT DISTINCT user_id
  FROM reels
  WHERE collection_id IS NULL
`).all();

for (const row of usersWithOrphanReels) {
  let collection = db.prepare('SELECT id FROM collections WHERE user_id = ? AND LOWER(name) = LOWER(?)')
    .get(row.user_id, 'Other');

  if (!collection) {
    const result = db.prepare(`
      INSERT INTO collections (user_id, name, description, emoji, is_favorite, created_at)
      VALUES (?, 'Other', 'Auto-created for uncategorized reels.', ?, 0, ?)
    `).run(row.user_id, '📌', new Date().toISOString());

    collection = { id: result.lastInsertRowid };
  }

  db.prepare('UPDATE reels SET collection_id = ? WHERE user_id = ? AND collection_id IS NULL')
    .run(collection.id, row.user_id);
}

const obviousCategoryBackfills = [
  {
    category: 'Dance',
    emoji: '🕺',
    pattern: '%dance%',
  },
  {
    category: 'Dance',
    emoji: '🕺',
    pattern: '%choreograph%',
  },
];

for (const backfill of obviousCategoryBackfills) {
  const users = db.prepare(`
    SELECT DISTINCT user_id
    FROM reels
    WHERE LOWER(COALESCE(category, '')) = 'other'
      AND LOWER(COALESCE(title, '')) LIKE LOWER(?)
  `).all(backfill.pattern);

  for (const row of users) {
    let collection = db.prepare('SELECT id FROM collections WHERE user_id = ? AND LOWER(name) = LOWER(?)')
      .get(row.user_id, backfill.category);

    if (!collection) {
      const result = db.prepare(`
        INSERT INTO collections (user_id, name, description, emoji, is_favorite, created_at)
        VALUES (?, ?, ?, ?, 0, ?)
      `).run(
        row.user_id,
        backfill.category,
        `Auto-created for ${backfill.category.toLowerCase()} reels.`,
        backfill.emoji,
        new Date().toISOString()
      );

      collection = { id: result.lastInsertRowid };
    }

    db.prepare(`
      UPDATE reels
      SET category = ?, collection_id = ?
      WHERE user_id = ?
        AND LOWER(COALESCE(category, '')) = 'other'
        AND LOWER(COALESCE(title, '')) LIKE LOWER(?)
    `).run(backfill.category, collection.id, row.user_id, backfill.pattern);
  }
}

// --- Users ---
function findOrCreateUser(instagramId, name) {
  let user = db.prepare('SELECT * FROM users WHERE instagram_id = ?').get(instagramId);
  if (!user) {
    db.prepare('INSERT INTO users (instagram_id, name) VALUES (?, ?)').run(instagramId, name || 'Unknown');
    user = db.prepare('SELECT * FROM users WHERE instagram_id = ?').get(instagramId);
  }
  return user;
}

// --- Categories (legacy — do not delete) ---
function findOrCreateCategory(userId, name) {
  const normalized = name.trim();
  let cat = db.prepare('SELECT * FROM categories WHERE user_id = ? AND LOWER(name) = LOWER(?)').get(userId, normalized);
  if (!cat) {
    db.prepare('INSERT INTO categories (user_id, name) VALUES (?, ?)').run(userId, normalized);
    cat = db.prepare('SELECT * FROM categories WHERE user_id = ? AND LOWER(name) = LOWER(?)').get(userId, normalized);
  }
  return cat;
}

// --- Collections (new system — all new saves use this) ---
function findOrCreateCollection(userId, name, emoji = '📌') {
  const normalized = String(name || 'Other').trim();
  let collection = db.prepare(
    'SELECT * FROM collections WHERE user_id = ? AND LOWER(name) = LOWER(?)'
  ).get(userId, normalized);

  if (!collection) {
    const result = db.prepare(`
      INSERT INTO collections (user_id, name, description, emoji, is_favorite, created_at)
      VALUES (?, ?, ?, ?, 0, ?)
    `).run(
      userId,
      normalized,
      `Auto-created for ${normalized.toLowerCase()} reels.`,
      emoji,
      new Date().toISOString()
    );
    collection = db.prepare('SELECT * FROM collections WHERE id = ?').get(result.lastInsertRowid);
  }

  return collection;
}

function getUserCategories(userId) {
  return db.prepare('SELECT * FROM categories WHERE user_id = ?').all(userId);
}

// --- Reels ---
function saveReel({ userId, collectionId, url, title, thumbnail, platform, category, note }) {
  // Always saves to collections system (collection_id), not legacy category_id
  return db.prepare(`
    INSERT INTO reels (user_id, collection_id, url, title, thumbnail, platform, category, note, is_favorite, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'saved', ?)
  `).run(userId, collectionId, url, title, thumbnail, platform, category || null, note || null, new Date().toISOString());
}

function getReelsByCategory(userId, categoryId) {
  return db.prepare('SELECT * FROM reels WHERE user_id = ? AND category_id = ?').all(userId, categoryId);
}

function getRandomReel(userId, categoryId) {
  return db.prepare('SELECT * FROM reels WHERE user_id = ? AND category_id = ? ORDER BY RANDOM() LIMIT 1').get(userId, categoryId);
}

module.exports = {
  db,
  findOrCreateUser,
  findOrCreateCategory,
  findOrCreateCollection,
  getUserCategories,
  saveReel,
  getReelsByCategory,
  getRandomReel,
};
