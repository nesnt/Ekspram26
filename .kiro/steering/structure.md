# Project Structure

```
sipra/
├── src/
│   ├── main.tsx              # App entry point, mounts React root
│   ├── App.tsx               # Root component — owns all state, routing, and data persistence
│   ├── types.ts              # All shared TypeScript interfaces and types
│   ├── data.ts               # Static seed data (default students, activities, preset materials)
│   ├── index.css             # Global styles, Tailwind imports, custom CSS classes
│   └── components/
│       ├── LoginScreen.tsx   # Auth screen
│       ├── DashboardScreen.tsx  # Home with stats and recent activity list
│       ├── FormKegiatanStep1.tsx # Step 1: activity details (date, time, material, photo)
│       ├── FormAbsensiSiswa.tsx  # Step 2 & 3: attendance form (reused for siswa and siswi)
│       ├── ReviewScreen.tsx      # Activity history with edit/delete
│       ├── GenerateScreen.tsx    # Monthly report preview, print, and share
│       ├── AdminPanelScreen.tsx  # Student roster management
│       ├── Header.tsx            # Top bar with dark mode toggle and logout
│       ├── BottomNav.tsx         # Bottom tab navigation
│       └── Icons.tsx             # Custom SVG icons (TunasKelapa, Tenda, BintangTiga)
├── .kiro/steering/           # AI steering documents
├── index.html                # Vite HTML entry
├── vite.config.ts
├── tsconfig.json
├── package.json
└── .env.example
```

## Architecture Patterns

### State Management
- All application state lives in `App.tsx` — there is no external state manager (no Redux, Zustand, etc.)
- State is passed down as props; callbacks are passed up for mutations
- Persistence is handled directly in `App.tsx` via `localStorage`

### Screen Routing
- Navigation uses a `ScreenType` union (`"LOGIN" | "DASHBOARD" | "INPUT_STEP1" | ...`) controlled by `useState`
- `currentScreen` in `App.tsx` determines which component to render — no React Router
- Screen transitions are handled by conditional rendering in the JSX

### localStorage Keys
| Key | Contents |
|---|---|
| `silapor_students` | `Student[]` — full roster |
| `silapor_activities` | `Activity[]` — all recorded sessions |
| `silapor_logged_in_user` | `string` — logged-in username |
| `silapor_dark_mode` | `"true"` or `"false"` |

### Component Conventions
- Components are named exports (not default exports), except `App`
- Props interfaces are defined inline above each component
- `React.FC<Props>` is used for component typing
- `useMemo` is used for derived stats/filtered lists; avoid recomputing in render
- Indonesian field names match domain language (e.g., `tanggal`, `materi`, `keterangan`)

### Styling
- Tailwind utility classes only — no CSS modules, no styled-components
- Custom Tailwind tokens used throughout: `pramuka-green`, `pramuka-gold`, `pramuka-dark-bg`, `pramuka-green-dark`, `pramuka-green-light`
- Dark mode via `dark:` variant (class-based, toggled on `<html>`)
- Mobile-first layout: max-width `420px` centered, simulating a smartphone frame on desktop
- Animations: `animate-fade-in`, `animate-pulse`, `animate-spin` (Tailwind built-ins + custom)

### Types (`src/types.ts`)
- `Student` — `{ id, name, regu, type: "SISWA" | "SISWI" }`
- `Activity` — `{ id, tanggal, waktuMulai, waktuSelesai, materi, keterangan, foto?, absensiSiswa, absensiSiswi }`
- `ScreenType` — union of all valid screen names
- `DashboardStats` — computed stats shape (used internally in DashboardScreen)

### Adding a New Screen
1. Add the new screen name to the `ScreenType` union in `types.ts`
2. Create the component in `src/components/`
3. Add a conditional render block in `App.tsx`
4. Wire navigation via `setCurrentScreen` callbacks passed as props
