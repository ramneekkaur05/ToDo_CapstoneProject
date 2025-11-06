import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'todos.db');
let db;

export function initDatabase() {
  sqlite3.verbose();
  // Ensure the data directory exists before opening the database file
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  db = new sqlite3.Database(dbPath);

  const run = promisify(db.run.bind(db));
  return run(`CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
}

export function getAllTodos() {
  const all = promisify(db.all.bind(db));
  return all('SELECT id, title, completed, createdAt FROM todos ORDER BY id DESC').then((rows) =>
    rows.map((r) => ({ ...r, completed: Boolean(r.completed) }))
  );
}

export function createTodo(title) {
  const get = promisify(db.get.bind(db));
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO todos (title, completed) VALUES (?, 0)', [title], function (err) {
      if (err) return reject(err);
      const id = this.lastID;
      get('SELECT id, title, completed, createdAt FROM todos WHERE id = ?', [id])
        .then((row) => resolve({ ...row, completed: Boolean(row.completed) }))
        .catch(reject);
    });
  });
}

export function updateTodo(id, { title, completed }) {
  const get = promisify(db.get.bind(db));
  return get('SELECT * FROM todos WHERE id = ?', [id]).then((existing) => {
    if (!existing) return null;
    const nextTitle = typeof title === 'string' && title.trim() !== '' ? title.trim() : existing.title;
    const nextCompleted = typeof completed === 'boolean' ? (completed ? 1 : 0) : existing.completed;
    return new Promise((resolve, reject) => {
      db.run('UPDATE todos SET title = ?, completed = ? WHERE id = ?', [nextTitle, nextCompleted, id], function (err) {
        if (err) return reject(err);
        get('SELECT id, title, completed, createdAt FROM todos WHERE id = ?', [id])
          .then((row) => resolve({ ...row, completed: Boolean(row.completed) }))
          .catch(reject);
      });
    });
  });
}

export function deleteTodo(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM todos WHERE id = ?', [id], function (err) {
      if (err) return reject(err);
      resolve(this.changes > 0);
    });
  });
}

export function markAllAsCompleted() {
  const all = promisify(db.all.bind(db));
  return new Promise((resolve, reject) => {
    db.run('UPDATE todos SET completed = 1 WHERE completed = 0', function (err) {
      if (err) return reject(err);
      all('SELECT id, title, completed, createdAt FROM todos ORDER BY id DESC')
        .then((rows) => resolve(rows.map((r) => ({ ...r, completed: Boolean(r.completed) }))))
        .catch(reject);
    });
  });
}

export function deleteAllTodos() {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM todos', function (err) {
      if (err) return reject(err);
      resolve(this.changes);
    });
  });
}

export function deleteCompletedTodos() {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM todos WHERE completed = 1', function (err) {
      if (err) return reject(err);
      resolve(this.changes);
    });
  });
}


