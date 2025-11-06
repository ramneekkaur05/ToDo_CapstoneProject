import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { initDatabase, getAllTodos, createTodo, updateTodo, deleteTodo, markAllAsCompleted, deleteAllTodos, deleteCompletedTodos } from './sqlite.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

initDatabase();

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/todos', (_req, res, next) => {
  getAllTodos()
    .then((todos) => res.json(todos))
    .catch(next);
});

app.post('/api/todos', (req, res, next) => {
  const { title } = req.body ?? {};
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'title is required (string)' });
  }
  createTodo(title.trim())
    .then((todo) => res.status(201).json(todo))
    .catch(next);
});

// Specific routes must come before parameterized routes
app.put('/api/todos/mark-all-completed', (_req, res, next) => {
  markAllAsCompleted()
    .then((todos) => res.json(todos))
    .catch(next);
});

app.put('/api/todos/:id', (req, res, next) => {
  const id = Number(req.params.id);
  const { title, completed } = req.body ?? {};
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'invalid id' });
  }
  updateTodo(id, { title, completed })
    .then((todo) => {
      if (!todo) return res.status(404).json({ error: 'not found' });
      res.json(todo);
    })
    .catch(next);
});

app.delete('/api/todos/:id', (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'invalid id' });
  }
  deleteTodo(id)
    .then((deleted) => {
      if (!deleted) return res.status(404).json({ error: 'not found' });
      res.status(204).end();
    })
    .catch(next);
});

app.delete('/api/todos', (req, res, next) => {
  const { action } = req.query;
  if (action === 'all') {
    deleteAllTodos()
      .then(() => res.status(204).end())
      .catch(next);
  } else if (action === 'completed') {
    deleteCompletedTodos()
      .then(() => res.status(204).end())
      .catch(next);
  } else {
    res.status(400).json({ error: 'invalid action. Use ?action=all or ?action=completed' });
  }
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'internal_error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});


