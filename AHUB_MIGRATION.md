# Guia: Migrar projeto para o AHUB

Siga este checklist para integrar qualquer novo projeto (ou migrar um existente) ao ecossistema AHUB.

---

## 1. Verificar slots disponíveis

```powershell
supabase.exe projects list
```
O free plan permite **2 projetos ativos** por organização. Se ambos estiverem ocupados, pause/delete um antes de criar o novo.

---

## 2. Criar o projeto no AHUB (se for novo backend)

> ⚠️ Se o projeto vai **compartilhar o Supabase AHUB existente** (`ayvbtydubxcpevcxcoul`), pule para o passo 4.

```powershell
supabase.exe projects create <nome-projeto> `
  --org-id qkrmmmoauwwcqrbzdutw `
  --db-password "<SenhaForte@2026!>" `
  --region sa-east-1
```

Anote o `REFERENCE ID` retornado.

---

## 3. Obter as API Keys do projeto AHUB

```powershell
supabase.exe projects api-keys --project-ref ayvbtydubxcpevcxcoul
```

Copie o valor de `anon`.

---

## 4. Configurar o `.env` do frontend

```env
VITE_SUPABASE_URL=https://ayvbtydubxcpevcxcoul.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key acima>
```

---

## 5. Criar schema dedicado para o app (no projeto AHUB compartilhado)

Crie um arquivo de migration em `supabase/migrations/`:

```sql
-- Exemplo para app "detetive"
CREATE SCHEMA IF NOT EXISTS detetive;

CREATE TABLE detetive.games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  -- ... colunas do app
  created_at timestamptz DEFAULT now()
);

ALTER TABLE detetive.games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own games"
  ON detetive.games FOR ALL
  USING (auth.uid() = user_id);
```

Depois aplique:
```powershell
supabase.exe link --project-ref ayvbtydubxcpevcxcoul
echo "Y" | supabase.exe db push
```

---

## 6. Configurar Auth (site URL do novo app)

```powershell
# Adicionar a nova URL ao allow list via Management API
$token = "<token do Credential Manager>"
Invoke-RestMethod -Method PATCH `
  -Uri "https://api.supabase.com/v1/projects/ayvbtydubxcpevcxcoul/config/auth" `
  -Headers @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" } `
  -Body '{"uri_allow_list":"https://taskpad-pf2.pages.dev,https://<novo-app>.pages.dev,https://<novo-app>.pages.dev/**"}'
```

---

## 7. Branding AHUB na página de login

O AuthPage deve ter:

```tsx
// Botão submit
{isLogin ? 'Entrar com conta AHUB' : 'Criar conta AHUB'}

// Link toggle
{isLogin ? 'Não tem conta AHUB? Criar uma' : 'Já tem conta AHUB? Entrar'}
```

---

## 8. Rodapé com Instagram

```tsx
<footer className="app-footer">
  <span>Feito por </span>
  <a href="https://instagram.com/mateusartur__" target="_blank" rel="noopener noreferrer" className="footer-instagram">
    @mateusartur__
  </a>
</footer>
```

CSS:
```css
.app-footer { text-align: center; padding: 12px 16px; font-size: 12px; color: var(--text-muted); border-top: 1px solid var(--border); background: var(--bg-secondary); }
.footer-instagram { color: var(--accent); text-decoration: none; font-weight: 500; }
.footer-instagram:hover { text-decoration: underline; }
```

---

## 9. Criar repositório GitHub público

```powershell
cd <pasta-do-projeto>
git init
git add -A
git commit -m "feat: initial commit"
gh repo create mateusartur27/<nome-projeto> --public --source=. --push
```

---

## 10. Deploy Cloudflare Pages

```powershell
cd frontend
npm run build
npx wrangler pages deploy dist --project-name <nome-projeto> --commit-dirty=true
```

---

## Referência rápida AHUB

| Dado | Valor |
|---|---|
| Supabase org ID | `qkrmmmoauwwcqrbzdutw` |
| Supabase project ref | `ayvbtydubxcpevcxcoul` |
| Supabase URL | `https://ayvbtydubxcpevcxcoul.supabase.co` |
| Instagram | `@mateusartur__` |
