# Contexto AHUB — GitHub Copilot

## O que é o AHUB
AHUB é o ecossistema de autenticação e backend compartilhado de todos os projetos do desenvolvedor **mateusartur27**.
Um único cadastro/login dá acesso a todos os apps AHUB.

## Supabase
- **Organização principal:** `mateusartur27's Org` (ID: `qkrmmmoauwwcqrbzdutw`)
- **Projeto AHUB:** ref `ayvbtydubxcpevcxcoul` | URL: `https://ayvbtydubxcpevcxcoul.supabase.co`
- **Região:** South America (São Paulo) `sa-east-1`
- **Auth:** `mailer_autoconfirm = true`
- **Limite free plan:** 2 projetos ativos simultâneos na org

## Projetos no AHUB
| App | Schema no Supabase | URL |
|---|---|---|
| TaskPad | `public` | https://taskpad-pf2.pages.dev |
| Detetive Online | `detetive` *(a criar)* | ref: `ckqmyiuemftwsigjpbqy` |

## Padrão de schemas
- Cada app usa seu próprio schema PostgreSQL (ex: `detetive`, `taskpad`)
- Auth compartilhado via schema `auth` (nativo Supabase)
- tabelas AHUB globais (perfil, preferências) ficam em schema `hub` *(futuro)*

## Branding AHUB nos apps
- Botão login: **"Entrar com conta AHUB"**
- Botão cadastro: **"Criar conta AHUB"**
- Link toggle: **"Não tem conta AHUB? Criar uma"** / **"Já tem conta AHUB? Entrar"**
- Rodapé de todos os apps: `Feito por @mateusartur__` linkando https://instagram.com/mateusartur__

## Deploy padrão
- **Frontend:** Vite + React + TypeScript
- **Hosting:** Cloudflare Pages via `wrangler pages deploy dist --project-name <nome>`
- **Repo:** GitHub em `mateusartur27/<nome-projeto>` (público)
- **Credenciais no frontend:** arquivo `frontend/.env` (gitignored)

## Comandos chave
```powershell
# Ver projetos
supabase.exe projects list

# Criar projeto novo no AHUB (liberar slot antes se necessário)
supabase.exe projects create <nome> --org-id qkrmmmoauwwcqrbzdutw --db-password "<senha>" --region sa-east-1

# Linkar projeto local
supabase.exe link --project-ref <ref>

# Push migrations
echo "Y" | supabase.exe db push

# Deploy Cloudflare
npx wrangler pages deploy dist --project-name <nome> --commit-dirty=true
```

## Token Supabase (Windows Credential Manager)
Target: `Supabase CLI:supabase` — recuperar via CredManager API se necessário para chamadas à Management API.
