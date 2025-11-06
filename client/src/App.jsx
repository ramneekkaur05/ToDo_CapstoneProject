import React, { useEffect, useMemo, useState } from 'react';

function useTodosApi() {
  const API_URL = import.meta.env.VITE_API_URL || '';
  const base = `${API_URL}/api/todos`;
  return useMemo(
    () => ({
      list: async () => {
        const res = await fetch(base);
        if (!res.ok) throw new Error('Failed to fetch todos');
        return res.json();
      },
      create: async (title) => {
        const res = await fetch(base, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        });
        if (!res.ok) throw new Error('Failed to create todo');
        return res.json();
      },
      update: async (id, data) => {
        const res = await fetch(`${base}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update todo');
        return res.json();
      },
      remove: async (id) => {
        const res = await fetch(`${base}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete todo');
      },
      markAllCompleted: async () => {
        const res = await fetch(`${base}/mark-all-completed`, { method: 'PUT' });
        if (!res.ok) throw new Error('Failed to mark all as completed');
        return res.json();
      },
      deleteAll: async () => {
        const res = await fetch(`${base}?action=all`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete all todos');
      },
      deleteCompleted: async () => {
        const res = await fetch(`${base}?action=completed`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete completed todos');
      },
    }),
    []
  );
}

export default function App() {
  const api = useTodosApi();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | completed

  useEffect(() => {
    let mounted = true;
    api
      .list()
      .then((data) => {
        if (mounted) setTodos(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [api]);

  async function handleAdd(e) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setNewTitle('');
    try {
      const created = await api.create(title);
      setTodos((t) => [created, ...t]);
    } catch (e) {
      setError(e.message);
    }
  }

  async function toggleCompleted(todo) {
    try {
      const updated = await api.update(todo.id, { completed: !todo.completed });
      setTodos((t) => t.map((x) => (x.id === todo.id ? updated : x)));
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleRename(todo, title) {
    const next = title.trim();
    if (!next || next === todo.title) return;
    try {
      const updated = await api.update(todo.id, { title: next });
      setTodos((t) => t.map((x) => (x.id === todo.id ? updated : x)));
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(id) {
    try {
      await api.remove(id);
      setTodos((t) => t.filter((x) => x.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleMarkAllCompleted() {
    try {
      const updated = await api.markAllCompleted();
      setTodos(updated);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDeleteAll() {
    if (!window.confirm('Are you sure you want to delete ALL tasks? This cannot be undone.')) {
      return;
    }
    try {
      await api.deleteAll();
      setTodos([]);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDeleteCompleted() {
    try {
      await api.deleteCompleted();
      setTodos((t) => t.filter((x) => !x.completed));
    } catch (e) {
      setError(e.message);
    }
  }

  const filteredTodos = todos.filter((t) =>
    filter === 'active' ? !t.completed : filter === 'completed' ? t.completed : true
  );

  const numActive = todos.filter((t) => !t.completed).length;
  const numCompleted = todos.length - numActive;

  return (
    <div className="page">
      <div className="container">
        <header className="header">
          <div className="brand">
            <div className="logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
            <h1>TaskFlow</h1>
          </div>
          <nav className="filters">
            <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
              All
            </button>
            <button className={`tab ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>
              Active
            </button>
            <button className={`tab ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>
              Completed
            </button>
          </nav>
        </header>

        <form className="add-form" onSubmit={handleAdd}>
          <input
            className="input input-large"
            placeholder="Add a new task and press Enter..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button className="btn btn-accent" type="submit">Add</button>
        </form>

        {error && <div className="error">{error}</div>}
        {loading ? (
          <div className="loading">Loading...</div>
        ) : filteredTodos.length === 0 ? (
          <div className="empty">
            <div className="empty-art" aria-hidden>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" fill="currentColor" opacity="0.3"/>
                <path d="M7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z" fill="currentColor" opacity="0.5"/>
              </svg>
            </div>
            <div>No {filter !== 'all' ? filter : ''} tasks. Add one above.</div>
          </div>
        ) : (
          <ul className="list">
            {filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={() => toggleCompleted(todo)}
                onRename={(title) => handleRename(todo, title)}
                onDelete={() => handleDelete(todo.id)}
              />
            ))}
          </ul>
        )}

        <footer className="footer">
          <div className="counts">
            <span>{numActive} active</span>
            <span>•</span>
            <span>{numCompleted} completed</span>
          </div>
          <div className="footer-actions">
            {todos.length > 0 && numActive > 0 && (
              <button className="btn btn-ghost" onClick={handleMarkAllCompleted}>
                Mark all completed
              </button>
            )}
            {numCompleted > 0 && (
              <button className="btn btn-ghost" onClick={handleDeleteCompleted}>
                Clear completed
              </button>
            )}
            {todos.length > 0 && (
              <button className="btn btn-ghost btn-danger" onClick={handleDeleteAll}>
                Delete all
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

function TodoItem({ todo, onToggle, onRename, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);

  function submitEdit(e) {
    e.preventDefault();
    setEditing(false);
    onRename(title);
  }

  return (
    <li className="item">
      <label className="checkbox">
        <input type="checkbox" checked={todo.completed} onChange={onToggle} />
        <span className={todo.completed ? 'done' : ''}></span>
      </label>
      {editing ? (
        <form className="edit" onSubmit={submitEdit}>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={submitEdit}
            autoFocus
          />
        </form>
      ) : (
        <span className={`title ${todo.completed ? 'completed' : ''}`} onDoubleClick={() => setEditing(true)}>
          {todo.title}
        </span>
      )}
      <div className="spacer" />
      <button className="icon danger" onClick={onDelete} aria-label="Delete">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor"/>
        </svg>
      </button>
    </li>
  );
}


