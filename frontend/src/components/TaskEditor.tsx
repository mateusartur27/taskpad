import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Task } from '../types'
import { Plus, Trash2, GripVertical } from 'lucide-react'

interface TaskEditorProps {
  tabId: string
  tabName: string
  tasks: Task[]
  onTasksChange: (tasks: Task[]) => void
}

export default function TaskEditor({ tabId, tabName, tasks, onTasksChange }: TaskEditorProps) {
  const { user } = useAuth()
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const inputRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map())
  const saveTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null)
  const tasksRef = useRef(tasks)
  tasksRef.current = tasks

  useEffect(() => {
    if (focusTaskId) {
      const input = inputRefs.current.get(focusTaskId)
      if (input) {
        input.focus()
        setFocusTaskId(null)
      }
    }
  }, [focusTaskId, tasks])

  const addTask = async () => {
    const current = tasksRef.current
    const newPosition = current.length
    const { data } = await supabase
      .from('tasks')
      .insert({
        tab_id: tabId,
        user_id: user!.id,
        text: '',
        completed: false,
        position: newPosition,
      })
      .select()
      .single()
    if (data) {
      onTasksChange([...current, data])
      setFocusTaskId(data.id)
    }
  }

  const updateTaskText = useCallback(
    (taskId: string, text: string) => {
      // Update local state immediately using ref for latest tasks
      const current = tasksRef.current
      onTasksChange(current.map((t) => (t.id === taskId ? { ...t, text } : t)))

      // Debounce save to DB
      const existing = saveTimeouts.current.get(taskId)
      if (existing) clearTimeout(existing)
      saveTimeouts.current.set(
        taskId,
        setTimeout(async () => {
          await supabase.from('tasks').update({ text }).eq('id', taskId)
          saveTimeouts.current.delete(taskId)
        }, 500)
      )
    },
    [onTasksChange]
  )

  const toggleTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    const newCompleted = !task.completed
    onTasksChange(tasks.map((t) => (t.id === taskId ? { ...t, completed: newCompleted } : t)))
    await supabase.from('tasks').update({ completed: newCompleted }).eq('id', taskId)
  }

  const deleteTask = async (taskId: string) => {
    onTasksChange(tasks.filter((t) => t.id !== taskId))
    await supabase.from('tasks').delete().eq('id', taskId)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, taskId: string, index: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      addTask()
    } else if (e.key === 'Backspace') {
      const task = tasks.find((t) => t.id === taskId)
      if (task && task.text === '') {
        e.preventDefault()
        deleteTask(taskId)
        // Focus previous task and place cursor at end of its text
        if (index > 0) {
          const prevTask = tasks[index - 1]
          // Use setTimeout so the DOM updates before we focus + set cursor
          setTimeout(() => {
            const prevInput = inputRefs.current.get(prevTask.id)
            if (prevInput) {
              prevInput.focus()
              const len = prevInput.value.length
              prevInput.setSelectionRange(len, len)
            }
          }, 0)
        }
      }
    } else if (e.key === 'ArrowUp' && index > 0) {
      const textarea = e.currentTarget
      const cursorPos = textarea.selectionStart
      const textBeforeCursor = textarea.value.substring(0, cursorPos)
      // Only move to previous task if cursor is on the first line
      if (!textBeforeCursor.includes('\n')) {
        e.preventDefault()
        const prevTask = tasks[index - 1]
        const prevInput = inputRefs.current.get(prevTask.id)
        if (prevInput) prevInput.focus()
      }
    } else if (e.key === 'ArrowDown' && index < tasks.length - 1) {
      const textarea = e.currentTarget
      const cursorPos = textarea.selectionStart
      const textAfterCursor = textarea.value.substring(cursorPos)
      // Only move to next task if cursor is on the last line
      if (!textAfterCursor.includes('\n')) {
        e.preventDefault()
        const nextTask = tasks[index + 1]
        const nextInput = inputRefs.current.get(nextTask.id)
        if (nextInput) nextInput.focus()
      }
    }
  }

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }

  // Drag & drop reorder
  const handleDragStart = (index: number) => {
    setDragIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDrop = async (index: number) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null)
      setDragOverIndex(null)
      return
    }

    const reordered = [...tasks]
    const [moved] = reordered.splice(dragIndex, 1)
    reordered.splice(index, 0, moved)

    // Update positions
    const updated = reordered.map((t, i) => ({ ...t, position: i }))
    onTasksChange(updated)

    // Save new positions to DB
    await Promise.all(
      updated.map((t) =>
        supabase.from('tasks').update({ position: t.position }).eq('id', t.id)
      )
    )

    setDragIndex(null)
    setDragOverIndex(null)
  }

  const completed = tasks.filter((t) => t.completed).length
  const total = tasks.length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="task-editor">
      <div className="editor-title">
        <h2>{tabName}</h2>
      </div>

      {/* Progress bar */}
      <div className="editor-header">
        <div className="editor-stats">
          <span>{completed}/{total} concluídas</span>
          <span className="editor-percent">{percentage}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${percentage}%` }} />
        </div>
      </div>

      {/* Task list - notepad style */}
      <div className="notepad">
        <div className="notepad-lines">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className={`notepad-line ${task.completed ? 'completed' : ''} ${
                dragOverIndex === index ? 'drag-over' : ''
              }`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              onDragEnd={() => {
                setDragIndex(null)
                setDragOverIndex(null)
              }}
            >
              <button className="drag-handle" title="Arrastar para reordenar">
                <GripVertical size={14} />
              </button>

              <button
                className={`checkbox ${task.completed ? 'checked' : ''}`}
                onClick={() => toggleTask(task.id)}
                title={task.completed ? 'Desmarcar' : 'Marcar como concluída'}
              >
                {task.completed && (
                  <svg viewBox="0 0 12 12" width="12" height="12">
                    <path
                      d="M2 6l3 3 5-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>

              <textarea
                ref={(el) => {
                  if (el) {
                    inputRefs.current.set(task.id, el)
                    autoResize(el)
                  } else {
                    inputRefs.current.delete(task.id)
                  }
                }}
                value={task.text}
                onChange={(e) => {
                  updateTaskText(task.id, e.target.value)
                  autoResize(e.target)
                }}
                onKeyDown={(e) => handleKeyDown(e, task.id, index)}
                className="task-input"
                placeholder="Digite sua tarefa..."
                rows={1}
              />

              <button
                className="delete-btn"
                onClick={() => deleteTask(task.id)}
                title="Excluir tarefa"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Add new task button / empty state */}
        <button className="add-task-btn" onClick={addTask}>
          <Plus size={16} />
          <span>{tasks.length === 0 ? 'Adicione sua primeira tarefa' : 'Nova tarefa'}</span>
        </button>
      </div>

      <div className="notepad-hint">
        <kbd>Enter</kbd> nova tarefa &nbsp;·&nbsp; <kbd>Shift+Enter</kbd> nova linha &nbsp;·&nbsp; <kbd>Backspace</kbd> em vazio apaga &nbsp;·&nbsp; <kbd>↑</kbd><kbd>↓</kbd> navegar
      </div>
    </div>
  )
}
