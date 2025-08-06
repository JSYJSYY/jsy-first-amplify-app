'use client';

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import '../lib/amplify-client';

const client = generateClient<Schema>();

export default function Home() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [newTodo, setNewTodo] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    listTodos();
  }, []);

  async function listTodos() {
    try {
      const { data: items } = await client.models.Todo.list();
      setTodos(items);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  }

  async function createTodo() {
    if (!newTodo.trim()) return;
    
    try {
      const { data: newTodoItem } = await client.models.Todo.create({
        content: newTodo,
        done: false,
        archived: false,
      });
      if (newTodoItem) {
        setTodos([...todos, newTodoItem]);
        setNewTodo('');
      }
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  }

  async function toggleTodo(id: string, done: boolean) {
    try {
      const { data: updatedTodo } = await client.models.Todo.update({
        id,
        done: !done,
      });
      if (updatedTodo) {
        setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo));
      }
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  }

  async function archiveTodo(id: string) {
    try {
      const { data: updatedTodo } = await client.models.Todo.update({
        id,
        archived: true,
      });
      if (updatedTodo) {
        setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo));
      }
    } catch (error) {
      console.error('Error archiving todo:', error);
    }
  }

  async function unarchiveTodo(id: string) {
    try {
      const { data: updatedTodo } = await client.models.Todo.update({
        id,
        archived: false,
      });
      if (updatedTodo) {
        setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo));
      }
    } catch (error) {
      console.error('Error unarchiving todo:', error);
    }
  }

  // Filter todos based on archived status
  const activeTodos = todos.filter(todo => !todo.archived);
  const archivedTodos = todos.filter(todo => todo.archived);
  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          🚀 My First AWS Amplify App
        </h1>
        <p className="text-center mb-8 text-gray-600">
          Welcome to your Todo app powered by AWS Amplify Gen2!
        </p>
        
        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createTodo()}
              placeholder="Enter a new todo..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={createTodo}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Todo
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setShowArchived(false)}
              className={`px-4 py-2 rounded-md ${
                !showArchived
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Active ({activeTodos.length})
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={`px-4 py-2 rounded-md ${
                showArchived
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Archived ({archivedTodos.length})
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {(showArchived ? archivedTodos : activeTodos).map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-md"
            >
              {!showArchived && (
                <input
                  type="checkbox"
                  checked={todo.done || false}
                  onChange={() => toggleTodo(todo.id, todo.done || false)}
                  className="w-4 h-4 text-blue-600"
                />
              )}
              <span
                className={`flex-1 ${
                  todo.done ? 'line-through text-gray-500' : ''
                } ${showArchived ? 'text-gray-600' : ''}`}
              >
                {todo.content}
              </span>
              {!showArchived ? (
                <button
                  onClick={() => archiveTodo(todo.id)}
                  className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Archive
                </button>
              ) : (
                <button
                  onClick={() => unarchiveTodo(todo.id)}
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Restore
                </button>
              )}
            </div>
          ))}
        </div>

        {!showArchived && activeTodos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No active todos yet. Add one above to get started!
          </div>
        )}

        {showArchived && archivedTodos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No archived todos yet. Complete some tasks and archive them!
          </div>
        )}

        
      </main>
    </div>
  );
}
