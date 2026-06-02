# Tech Stack

## Core
- **React 19** with TypeScript (`react-jsx` transform, strict mode)
- **Vite 6** — build tool and dev server
- **Tailwind CSS v4** — via `@tailwindcss/vite` plugin (no `tailwind.config.js` needed)
- **TypeScript ~5.8** — `moduleResolution: bundler`, `ESNext` modules, no emit

## Key Libraries
- **lucide-react** — icon set (prefer these over custom SVGs)
- **motion** (Framer Motion v12) — animations
- **@google/genai** — Gemini AI SDK for report generation features
- **express + dotenv** — minimal server layer (for API key proxying if needed)

## Path Aliases
`@/` maps to the project root (e.g., `@/src/types` resolves to `./src/types`)

## Environment Variables
- `GEMINI_API_KEY` — required for AI features, set in `.env.local`
- `APP_URL` — hosting URL, injected by AI Studio at runtime

## Common Commands

```bash
npm run dev       # Start dev server on port 3000 (0.0.0.0)
npm run build     # Production build → dist/
npm run preview   # Preview production build
npm run lint      # Type-check only (tsc --noEmit), no ESLint configured
npm run clean     # Remove dist/ and server.js
```

> **Note:** Dev server runs on port 3000. HMR is disabled when `DISABLE_HMR=true` (used in AI Studio).

## No Test Framework
There is currently no test runner configured in this project.
