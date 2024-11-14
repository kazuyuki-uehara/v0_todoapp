'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit2, CalendarIcon, Tag, X, Plus } from 'lucide-react'
import { format } from 'date-fns'

type Todo = {
  id: number;
  text: string;
  completed: boolean;
  tags: string[];
  startDate?: Date;
  endDate?: Date;
}

export function AdvancedTodoAppComponent() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [newTag, setNewTag] = useState('')
  const [filters, setFilters] = useState<string[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [isStartDateOpen, setIsStartDateOpen] = useState(false)
  const [isEndDateOpen, setIsEndDateOpen] = useState(false)

  useEffect(() => {
    const savedTodos = localStorage.getItem('todos')
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos, (key, value) => {
        if (key === 'startDate' || key === 'endDate') {
          return value ? new Date(value) : undefined
        }
        return value
      }))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTodo.trim()) {
      setTodos([...todos, { 
        id: Date.now(), 
        text: newTodo.trim(), 
        completed: false, 
        tags: newTag ? [newTag] : [],
        startDate,
        endDate
      }])
      setNewTodo('')
      setNewTag('')
      setStartDate(undefined)
      setEndDate(undefined)
    }
  }

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const editTodo = (id: number) => {
    const todoToEdit = todos.find(todo => todo.id === id)
    if (todoToEdit) {
      setEditingId(id)
      setEditText(todoToEdit.text)
      setStartDate(todoToEdit.startDate)
      setEndDate(todoToEdit.endDate)
    }
  }

  const saveTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: editText, startDate, endDate } : todo
    ))
    setEditingId(null)
  }

  const toggleFilter = (tag: string) => {
    setFilters(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const removeFilter = (tag: string) => {
    setFilters(prev => prev.filter(t => t !== tag))
  }

  const filteredTodos = todos.filter(todo => {
    if (filters.length === 0) return true;
    return todo.tags.some(tag => filters.includes(tag));
  });

  const allTags = Array.from(new Set(todos.flatMap(todo => todo.tags)))

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">TODOアプリ</h1>
          <form onSubmit={addTodo} className="space-y-4 mb-8">
            <Input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="新しいタスクを入力..."
              className="w-full"
            />
            <div className="flex flex-wrap gap-2">
              <Input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="タグを入力..."
                className="flex-grow"
              />
              <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'yyyy-MM-dd') : '開始日'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date)
                      setIsStartDateOpen(false)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'yyyy-MM-dd') : '終了日'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date)
                      setIsEndDateOpen(false)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                追加
              </Button>
            </div>
          </form>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">フィルター:</h2>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <label key={tag} className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-full">
                  <Checkbox
                    checked={filters.includes(tag)}
                    onCheckedChange={() => toggleFilter(tag)}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{tag}</span>
                </label>
              ))}
            </div>
          </div>
          {filters.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">選択中のフィルター:</h3>
              <div className="flex flex-wrap gap-2">
                {filters.map(filter => (
                  <Badge key={filter} variant="secondary" className="px-3 py-1 text-sm">
                    {filter}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2 h-4 w-4 p-0"
                      onClick={() => removeFilter(filter)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <ul className="space-y-4">
            {filteredTodos.map(todo => (
              <li key={todo.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm overflow-hidden">
                {editingId === todo.id ? (
                  <div className="p-4">
                    <Input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full"
                    />
                    <div className="flex space-x-2 mt-2">
                      <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, 'yyyy-MM-dd') : '開始日編集'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={(date) => {
                              setStartDate(date)
                              setIsStartDateOpen(false)
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, 'yyyy-MM-dd') : '終了日編集'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={(date) => {
                              setEndDate(date)
                              setIsEndDateOpen(false)
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <Button onClick={() => saveTodo(todo.id)}>保存</Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="flex items-center mb-2">
                      <Checkbox
                        id={`todo-${todo.id}`}
                        checked={todo.completed}
                        onCheckedChange={() => toggleTodo(todo.id)}
                        className="mr-3"
                      />
                      <label
                        htmlFor={`todo-${todo.id}`}
                        className={`flex-grow text-lg ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-white'}`}
                      >
                        {todo.text}
                      </label>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => editTodo(todo.id)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        aria-label={`${todo.text}を編集`}
                      >
                        <Edit2 className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTodo(todo.id)}
                        className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        aria-label={`${todo.text}を削除`}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-300">
                      {todo.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="mr-2">
                          <Tag className="mr-1 h-3 w-3" />{tag}
                        </Badge>
                      ))}
                      {(todo.startDate || todo.endDate) && (
                        <Badge variant="outline" className="ml-auto">
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {todo.startDate && format(todo.startDate, 'yyyy-MM-dd')}
                          {todo.startDate && todo.endDate && ' ~ '}
                          {todo.endDate && format(todo.endDate, 'yyyy-MM-dd')}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}