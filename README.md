# TaskPad - Gerenciador de Tarefas

Gerenciador de tarefas web com a simplicidade de um bloco de notas.

## Stack
- **Frontend**: Vite + React + TypeScript
- **Backend**: Supabase (Auth + PostgreSQL)
- **Deploy**: Cloudflare Pages
- **Icons**: Lucide React

## Features
- Autenticação (login/registro)
- Guias (tabs) para organizar tarefas
- Dashboard com % de conclusão
- Edição tipo bloco de notas (Enter=nova, Backspace=apaga vazia)
- Drag & drop para reordenar
- Salvamento automático com debounce
- Realtime via Supabase
- Botão de sugestão via WhatsApp

## Desenvolvimento

```bash
cd frontend
npm install
npm run dev
```

## Variáveis de Ambiente

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
