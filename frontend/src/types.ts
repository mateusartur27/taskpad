export interface Tab {
  id: string
  user_id: string
  name: string
  position: number
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  tab_id: string
  user_id: string
  text: string
  completed: boolean
  position: number
  created_at: string
  updated_at: string
}
