'use client';

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import '../lib/amplify-client';

const client = generateClient<Schema>();

type ViewSection = 'today' | 'thisweek' | 'upcoming' | 'repeating' | 'archived';

export default function Home() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [categories, setCategories] = useState<Array<Schema["Category"]["type"]>>([]);
  const [currentView, setCurrentView] = useState<ViewSection>('today');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showAddTodo, setShowAddTodo] = useState(false);
  
  // New todo form state
  const [newTodo, setNewTodo] = useState('');
  const [newTodoTime, setNewTodoTime] = useState('');
  const [newTodoCategoryId, setNewTodoCategoryId] = useState('');
  const [newTodoIsRepeating, setNewTodoIsRepeating] = useState(false);
  const [newTodoRepeatPattern, setNewTodoRepeatPattern] = useState('daily');
  const [newTodoPriority, setNewTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [todosResult, categoriesResult] = await Promise.all([
        client.models.Todo.list(),
        client.models.Category.list()
      ]);
      
      setTodos(todosResult.data);
      setCategories(categoriesResult.data);
      
      // Create default categories if none exist
      if (categoriesResult.data.length === 0) {
        await createDefaultCategories();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  async function createDefaultCategories() {
    const defaultCategories = [
      { name: 'Work', color: '#3B82F6', icon: '💼' },
      { name: 'Personal', color: '#10B981', icon: '👤' },
      { name: 'Health', color: '#F59E0B', icon: '🏃' },
      { name: 'Home', color: '#8B5CF6', icon: '🏠' },
      { name: 'Shopping', color: '#EF4444', icon: '🛒' },
    ];

    try {
      const createdCategories = await Promise.all(
        defaultCategories.map(cat => client.models.Category.create(cat))
      );
      const newCategories = createdCategories.map(result => result.data).filter(Boolean);
      setCategories(newCategories);
    } catch (error) {
      console.error('Error creating default categories:', error);
    }
  }

  async function createTodo() {
    if (!newTodo.trim()) return;
    
    try {
      const scheduledTime = newTodoTime ? new Date(newTodoTime).toISOString() : null;
      
      const { data: newTodoItem } = await client.models.Todo.create({
        content: newTodo,
        done: false,
        archived: false,
        scheduledTime,
        isRepeating: newTodoIsRepeating,
        repeatPattern: newTodoIsRepeating ? newTodoRepeatPattern : null,
        categoryId: newTodoCategoryId || null,
        priority: newTodoPriority,
      });
      
      if (newTodoItem) {
        setTodos([...todos, newTodoItem]);
        resetForm();
        setShowAddTodo(false);
      }
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  }

  function resetForm() {
    setNewTodo('');
    setNewTodoTime('');
    setNewTodoCategoryId('');
    setNewTodoIsRepeating(false);
    setNewTodoRepeatPattern('daily');
    setNewTodoPriority('medium');
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

  // Helper functions for date filtering
  function isToday(date: string) {
    const today = new Date();
    const todoDate = new Date(date);
    return todoDate.toDateString() === today.toDateString();
  }

  function isThisWeek(date: string) {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    const todoDate = new Date(date);
    return todoDate >= weekStart && todoDate <= weekEnd;
  }

  function isUpcoming(date: string) {
    const now = new Date();
    const todoDate = new Date(date);
    return todoDate > now;
  }

  // Filter todos based on current view and category
  function getFilteredTodos() {
    let filtered = todos.filter(todo => {
      // Apply category filter
      if (selectedCategoryId && todo.categoryId !== selectedCategoryId) {
        return false;
      }

      // Apply view filter
      switch (currentView) {
        case 'today':
          return !todo.archived && todo.scheduledTime && isToday(todo.scheduledTime);
        case 'thisweek':
          return !todo.archived && todo.scheduledTime && isThisWeek(todo.scheduledTime);
        case 'upcoming':
          return !todo.archived && todo.scheduledTime && isUpcoming(todo.scheduledTime);
        case 'repeating':
          return !todo.archived && todo.isRepeating;
        case 'archived':
          return todo.archived;
        default:
          return !todo.archived;
      }
    });

    return filtered;
  }

  const filteredTodos = getFilteredTodos();
  
  // Count todos for each section
  const todayCounts = todos.filter(t => !t.archived && t.scheduledTime && isToday(t.scheduledTime)).length;
  const thisWeekCounts = todos.filter(t => !t.archived && t.scheduledTime && isThisWeek(t.scheduledTime)).length;
  const upcomingCounts = todos.filter(t => !t.archived && t.scheduledTime && isUpcoming(t.scheduledTime)).length;
  const repeatingCounts = todos.filter(t => !t.archived && t.isRepeating).length;
  const archivedCounts = todos.filter(t => t.archived).length;
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">📋 Task Manager</h1>
        </div>
        
        <div className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={() => {setCurrentView('today'); setSelectedCategoryId(null);}}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left ${
                currentView === 'today' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center">
                <span className="mr-2">📅</span>
                Today
              </span>
              <span className="text-sm bg-gray-200 px-2 py-1 rounded-full">{todayCounts}</span>
            </button>
            
            <button
              onClick={() => {setCurrentView('thisweek'); setSelectedCategoryId(null);}}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left ${
                currentView === 'thisweek' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center">
                <span className="mr-2">📊</span>
                This Week
              </span>
              <span className="text-sm bg-gray-200 px-2 py-1 rounded-full">{thisWeekCounts}</span>
            </button>
            
            <button
              onClick={() => {setCurrentView('upcoming'); setSelectedCategoryId(null);}}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left ${
                currentView === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center">
                <span className="mr-2">🔮</span>
                Upcoming
              </span>
              <span className="text-sm bg-gray-200 px-2 py-1 rounded-full">{upcomingCounts}</span>
            </button>
            
            <button
              onClick={() => {setCurrentView('repeating'); setSelectedCategoryId(null);}}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left ${
                currentView === 'repeating' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center">
                <span className="mr-2">🔄</span>
                Repeating
              </span>
              <span className="text-sm bg-gray-200 px-2 py-1 rounded-full">{repeatingCounts}</span>
            </button>
            
            <button
              onClick={() => {setCurrentView('archived'); setSelectedCategoryId(null);}}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left ${
                currentView === 'archived' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center">
                <span className="mr-2">📦</span>
                Archived
              </span>
              <span className="text-sm bg-gray-200 px-2 py-1 rounded-full">{archivedCounts}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 capitalize">
              {currentView === 'thisweek' ? 'This Week' : currentView}
            </h2>
            <p className="text-gray-600 mt-1">
              {filteredTodos.length} {filteredTodos.length === 1 ? 'task' : 'tasks'}
              {selectedCategoryId && (
                <span className="ml-2 text-blue-600">
                  • {categories.find(c => c.id === selectedCategoryId)?.name}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowAddTodo(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
          >
            <span className="mr-2">+</span>
            Add Task
          </button>
        </div>

        <div className="flex-1 flex">
          {/* Todo List */}
          <div className="flex-1 p-6">
            <div className="space-y-3">
              {filteredTodos.map((todo) => {
                const category = categories.find(c => c.id === todo.categoryId);
                return (
                  <div
                    key={todo.id}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      {currentView !== 'archived' && (
                        <input
                          type="checkbox"
                          checked={todo.done || false}
                          onChange={() => toggleTodo(todo.id, todo.done || false)}
                          className="w-5 h-5 text-blue-600 mt-1"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {category && (
                            <span
                              className="text-sm px-2 py-1 rounded-full text-white"
                              style={{ backgroundColor: category.color }}
                            >
                              {category.icon} {category.name}
                            </span>
                          )}
                          {todo.isRepeating && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                              🔄 {todo.repeatPattern}
                            </span>
                          )}
                          {todo.priority === 'high' && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                              🔴 High
                            </span>
                          )}
                        </div>
                        <p className={`text-gray-800 ${todo.done ? 'line-through text-gray-500' : ''}`}>
                          {todo.content}
                        </p>
                        {todo.scheduledTime && (
                          <p className="text-sm text-gray-500 mt-1">
                            ⏰ {new Date(todo.scheduledTime).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {currentView !== 'archived' ? (
                          <button
                            onClick={() => archiveTodo(todo.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            📦
                          </button>
                        ) : (
                          <button
                            onClick={() => unarchiveTodo(todo.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            ↩️
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {filteredTodos.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">No tasks found</p>
                <p className="text-sm mt-2">
                  {currentView === 'today' && 'No tasks scheduled for today'}
                  {currentView === 'thisweek' && 'No tasks scheduled for this week'}
                  {currentView === 'upcoming' && 'No upcoming tasks'}
                  {currentView === 'repeating' && 'No repeating tasks'}
                  {currentView === 'archived' && 'No archived tasks'}
                </p>
              </div>
            )}
          </div>

          {/* Categories Panel */}
          <div className="w-80 bg-white border-l border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Categories</h3>
              {selectedCategoryId && (
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear Filter
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              {categories.map((category) => {
                const categoryTodoCount = todos.filter(t => 
                  t.categoryId === category.id && !t.archived
                ).length;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategoryId(
                      selectedCategoryId === category.id ? null : category.id
                    )}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      selectedCategoryId === category.id
                        ? 'bg-gray-100 border-2 border-blue-500'
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="mr-2">{category.icon}</span>
                      <span className="text-gray-800">{category.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{categoryTodoCount}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add Todo Modal */}
      {showAddTodo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Task</h3>
            
            <div className="space-y-4">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled Time
                </label>
                <input
                  type="datetime-local"
                  value={newTodoTime}
                  onChange={(e) => setNewTodoTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newTodoCategoryId}
                  onChange={(e) => setNewTodoCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newTodoPriority}
                  onChange={(e) => setNewTodoPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="repeating"
                  checked={newTodoIsRepeating}
                  onChange={(e) => setNewTodoIsRepeating(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="repeating" className="text-sm text-gray-700">
                  Repeating task
                </label>
              </div>
              
              {newTodoIsRepeating && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Repeat Pattern
                  </label>
                  <select
                    value={newTodoRepeatPattern}
                    onChange={(e) => setNewTodoRepeatPattern(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {setShowAddTodo(false); resetForm();}}
                className="px-4 py-2 text-gray-600 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={createTodo}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
