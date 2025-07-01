// src/components/TodoApp.jsx

import React, { useState, useEffect } from 'react';
import api from '../api'; // Adjust the import path as necessary

const TodoApp = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [todos, setTodos] = useState([]);
  const [editId, setEditId] = useState(null);

  // Fetch todos on initial render
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await api.get('/todos');
      setTodos(res.data);
    } catch (err) {
      console.error('Error fetching todos:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { title, description };

    try {
      if (editId !== null) {
        // Update existing todo
        const res = await api.put(`/todos/${editId}`, payload);
        setTodos((prev) =>
          prev.map((todo) => (todo.id === editId ? res.data : todo))
        );
        setEditId(null);
      } else {
        // Create new todo
        const res = await api.post('/todos', payload);
        setTodos((prev) => [...prev, res.data]);
      }

      // Reset form
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error('Error submitting todo:', err);
    }
  };

  const handleEdit = (todo) => {
    setTitle(todo.title);
    setDescription(todo.description);
    setEditId(todo.id);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/todos/${id}`);
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (err) {
      console.error('Error deleting todo:', err);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Todo App</h2>

      {/* Todo Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          className="border border-gray-300 rounded px-3 py-2 w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          className="border border-gray-300 rounded px-3 py-2 w-full h-24"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
        >
          {editId ? 'Update Todo' : 'Add Todo'}
        </button>
      </form>

      {/* Todo List */}
      <div className="mt-6">
        {todos.length > 0 ? (
          todos.map((todo) => (
            <div
              key={todo.id}
              className="border border-gray-300 rounded-lg p-4 flex justify-between items-start mb-3 bg-gray-50"
            >
              <div>
                <h4 className="font-bold text-lg">{todo.title}</h4>
                <p>{todo.description}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleEdit(todo)}
                  className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(todo.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No todos found.</p>
        )}
      </div>
    </div>
  );
};

export default TodoApp;
