import React, { useState, useEffect } from 'react';
import './App.css';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    fetch('http://localhost:50019/api/todos')
      .then(response => response.json())
      .then(data => setTodos(data));
  }, []);

  const addTodo = () => {
    if (newTodo.trim()) {
      fetch('http://localhost:50019/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTodo })
      })
      .then(response => response.json())
      .then(data => setTodos([...todos, data]));
      setNewTodo('');
    }
  };

  const toggleComplete = (id: number) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      fetch(`http://localhost:50019/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed })
      })
      .then(() => setTodos(todos.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )));
    }
  };

  const deleteTodo = (id: number) => {
    fetch(`http://localhost:50019/api/todos/${id}`, {
      method: 'DELETE'
    })
    .then(() => setTodos(todos.filter(t => t.id !== id)));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Todo App</h1>
        <input
          type="text"
          value={newTodo}
          onChange={e => setNewTodo(e.target.value)}
          placeholder="Add a new todo"
        />
        <button onClick={addTodo}>Add Todo</button>
        <ul>
          {todos.map(todo => (
            <li key={todo.id}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleComplete(todo.id)}
              />
              <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
                {todo.title}
              </span>
              <button onClick={() => deleteTodo(todo.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
};

export default App;
