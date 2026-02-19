import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Tab, Task } from '../types'
import Dashboard from '../components/Dashboard'
import TaskEditor from '../components/TaskEditor'
import {
  LayoutDashboard,
  Plus,
  X,
  LogOut,
  Pencil,
  Check,
  MessageCircle,
  ClipboardList,
} from 'lucide-react'

export default function AppPage() {
  const { user, signOut } = useAuth()
  const [tabs, setTabs] = useState<Tab[]>([])
  const [tasks, setTasks] = useState<Record<string, Task[]>>({})
  const [activeTab, setActiveTab] = useState<string>('dashboard')
  const [editingTabId, setEditingTabId] = useState<string | null>(null)
  const [editingTabName, setEditingTabName] = useState('')
  const [loading, setLoading] = useState(true)
  const [noteContent, setNoteContent] = useState('')
  const noteSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchTabs = useCallback(async () => {
    const { data } = await supabase
      .from('tabs')
      .select('*')
      .order('position', { ascending: true })
    if (data) setTabs(data)
  }, [])

  const fetchTasks = useCallback(async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('position', { ascending: true })
    if (data) {
      const grouped: Record<string, Task[]> = {}
      data.forEach((task) => {
        if (!grouped[task.tab_id]) grouped[task.tab_id] = []
        grouped[task.tab_id].push(task)
      })
      setTasks(grouped)
    }
  }, [])

  const fetchNote = useCallback(async () => {
    const { data } = await supabase
      .from('user_notes')
      .select('content')
      .single()
    if (data) {
      setNoteContent(data.content)
    } else {
      // Create note entry if not exists
      await supabase
        .from('user_notes')
        .insert({ user_id: user!.id, content: '' })
    }
  }, [user])

  const saveNote = useCallback((content: string) => {
    setNoteContent(content)
    if (noteSaveTimeout.current) clearTimeout(noteSaveTimeout.current)
    noteSaveTimeout.current = setTimeout(async () => {
      await supabase.from('user_notes').update({ content }).eq('user_id', user!.id)
    }, 500)
  }, [user])

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchTabs(), fetchTasks(), fetchNote()])
      setLoading(false)
    }
    load()
  }, [fetchTabs, fetchTasks, fetchNote])

  // Real-time subscriptions
  useEffect(() => {
    const tabsSub = supabase
      .channel('tabs-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tabs' }, () => {
        fetchTabs()
      })
      .subscribe()

    const tasksSub = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasks()
      })
      .subscribe()

    return () => {
      tabsSub.unsubscribe()
      tasksSub.unsubscribe()
    }
  }, [fetchTabs, fetchTasks])

  const addTab = async () => {
    const newPosition = tabs.length
    const { data } = await supabase
      .from('tabs')
      .insert({ user_id: user!.id, name: 'Nova Guia', position: newPosition })
      .select()
      .single()
    if (data) {
      setTabs([...tabs, data])
      setActiveTab(data.id)
    }
  }

  const deleteTab = async (tabId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta guia e todas as suas tarefas?')) return
    await supabase.from('tabs').delete().eq('id', tabId)
    setTabs(tabs.filter((t) => t.id !== tabId))
    const newTasks = { ...tasks }
    delete newTasks[tabId]
    setTasks(newTasks)
    if (activeTab === tabId) setActiveTab('dashboard')
  }

  const renameTab = async (tabId: string) => {
    if (!editingTabName.trim()) return
    await supabase.from('tabs').update({ name: editingTabName.trim() }).eq('id', tabId)
    setTabs(tabs.map((t) => (t.id === tabId ? { ...t, name: editingTabName.trim() } : t)))
    setEditingTabId(null)
  }

  const startEditingTab = (tab: Tab) => {
    setEditingTabId(tab.id)
    setEditingTabName(tab.name)
  }

  const getTabCompletion = (tabId: string) => {
    const tabTasks = tasks[tabId] || []
    if (tabTasks.length === 0) return 0
    const completed = tabTasks.filter((t) => t.completed).length
    return Math.round((completed / tabTasks.length) * 100)
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <ClipboardList size={48} strokeWidth={1.5} className="spin" />
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <ClipboardList size={24} strokeWidth={1.5} />
          <h1>TaskPad</h1>
        </div>
        <div className="header-right">
          <span className="user-email">{user?.email}</span>
          <button onClick={signOut} className="btn btn-ghost btn-sm" title="Sair">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Tabs Bar */}
      <nav className="tabs-bar">
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </button>

        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {editingTabId === tab.id ? (
              <form
                className="tab-edit-form"
                onSubmit={(e) => {
                  e.preventDefault()
                  renameTab(tab.id)
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="text"
                  value={editingTabName}
                  onChange={(e) => setEditingTabName(e.target.value)}
                  autoFocus
                  onBlur={() => renameTab(tab.id)}
                  className="tab-edit-input"
                />
                <button type="submit" className="tab-action-btn">
                  <Check size={12} />
                </button>
              </form>
            ) : (
              <>
                <span className="tab-name">{tab.name}</span>
                <span className="tab-completion">{getTabCompletion(tab.id)}%</span>
                <div className="tab-actions">
                  <button
                    className="tab-action-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      startEditingTab(tab)
                    }}
                    title="Renomear"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    className="tab-action-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteTab(tab.id)
                    }}
                    title="Excluir"
                  >
                    <X size={12} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        <button className="tab-btn tab-add" onClick={addTab} title="Nova Guia">
          <Plus size={16} />
        </button>
      </nav>

      {/* Content */}
      <main className="content">
        {activeTab === 'dashboard' ? (
          <Dashboard
            tabs={tabs}
            tasks={tasks}
            getCompletion={getTabCompletion}
            onTabClick={setActiveTab}
            noteContent={noteContent}
            onNoteChange={saveNote}
          />
        ) : (
          <TaskEditor
            tabId={activeTab}
            tabName={tabs.find((t) => t.id === activeTab)?.name || ''}
            tasks={tasks[activeTab] || []}
            onTasksChange={(newTasks) =>
              setTasks({ ...tasks, [activeTab]: newTasks })
            }
          />
        )}
      </main>

      {/* WhatsApp Suggestion Button */}
      <a
        href="https://wa.me/5537991389822?text=Ol%C3%A1!%20Tenho%20uma%20sugest%C3%A3o%20para%20o%20TaskPad%3A%20"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-fab"
        title="Enviar sugestão via WhatsApp"
      >
        <MessageCircle size={24} />
      </a>
    </div>
  )
}
