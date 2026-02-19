import type { Tab, Task } from '../types'
import { ClipboardList, CheckCircle2, Circle, ArrowRight, StickyNote } from 'lucide-react'

interface DashboardProps {
  tabs: Tab[]
  tasks: Record<string, Task[]>
  getCompletion: (tabId: string) => number
  onTabClick: (tabId: string) => void
  noteContent: string
  onNoteChange: (content: string) => void
}

export default function Dashboard({ tabs, tasks, getCompletion, onTabClick, noteContent, onNoteChange }: DashboardProps) {
  const totalTasks = Object.values(tasks).flat().length
  const completedTasks = Object.values(tasks).flat().filter((t) => t.completed).length
  const overallCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p className="dashboard-subtitle">Visão geral das suas tarefas</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <ClipboardList size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{tabs.length}</span>
            <span className="stat-label">Guias</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Circle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalTasks}</span>
            <span className="stat-label">Tarefas</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{completedTasks}</span>
            <span className="stat-label">Concluídas</span>
          </div>
        </div>
        <div className="stat-card accent">
          <div className="stat-info">
            <span className="stat-value">{overallCompletion}%</span>
            <span className="stat-label">Conclusão Geral</span>
          </div>
          <div className="progress-ring">
            <svg viewBox="0 0 36 36">
              <path
                className="progress-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                strokeWidth="3"
              />
              <path
                className="progress-fill"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                strokeWidth="3"
                strokeDasharray={`${overallCompletion}, 100`}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Tabs overview */}
      <div className="tabs-overview">
        <h3>Guias em Aberto</h3>
        {tabs.length === 0 ? (
          <div className="empty-state">
            <ClipboardList size={48} strokeWidth={1} />
            <p>Nenhuma guia criada ainda.</p>
            <p className="empty-hint">Clique no "+" na barra de guias para começar!</p>
          </div>
        ) : (
          <div className="tabs-list">
            {tabs.map((tab) => {
              const tabTasks = tasks[tab.id] || []
              const completed = tabTasks.filter((t) => t.completed).length
              const completion = getCompletion(tab.id)
              return (
                <div
                  key={tab.id}
                  className="tab-card"
                  onClick={() => onTabClick(tab.id)}
                >
                  <div className="tab-card-header">
                    <h4>{tab.name}</h4>
                    <ArrowRight size={16} className="tab-card-arrow" />
                  </div>
                  <div className="tab-card-stats">
                    <span>
                      {completed}/{tabTasks.length} tarefas
                    </span>
                    <span className="tab-card-percent">{completion}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Notepad */}
      <div className="dashboard-notepad">
        <div className="dashboard-notepad-header">
          <StickyNote size={18} />
          <h3>Bloco de Notas</h3>
        </div>
        <textarea
          className="dashboard-notepad-textarea"
          value={noteContent}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Anote o que quiser aqui... ideias, lembretes, rascunhos..."
        />
      </div>
    </div>
  )
}
