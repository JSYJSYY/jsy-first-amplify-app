'use client';

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import '../lib/amplify-client';

const client = generateClient<Schema>();

export default function Home() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [newTodo, setNewTodo] = useState('');

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

        <div className="space-y-2">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-md"
            >
              <input
                type="checkbox"
                checked={todo.done || false}
                onChange={() => toggleTodo(todo.id, todo.done || false)}
                className="w-4 h-4 text-blue-600"
              />
              <span
                className={`flex-1 ${
                  todo.done ? 'line-through text-gray-500' : ''
                }`}
              >
                {todo.content}
              </span>
            </div>
          ))}
        </div>

        {todos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No todos yet. Add one above to get started!
          </div>
        )}

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Built with AWS Amplify Gen2 + Next.js + TypeScript</p>
        </div>
      </main>
    </div>
  );
}
