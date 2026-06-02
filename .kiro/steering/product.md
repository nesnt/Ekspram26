# SiLapor Pramuka — Product Overview

**SiLapor Pramuka** (Sistem Catat & Lapor Gugus Depan) is a mobile-first web app for managing Indonesian Scout (Pramuka) troop activities at the school level (gugus depan / pangkalan).

## Core Purpose
Allow scout coaches (pembina) to digitally record weekly training sessions, track attendance for boy (Siswa/PA) and girl (Siswi/PI) scouts separately, and generate official monthly recap reports.

## Key Features
- **Login** — Simple credential-based auth for coaches (pembina) and admins
- **Catat Kegiatan** — 3-step form to log a training session: activity details → boy attendance → girl attendance
- **Review** — History table of all recorded activities with edit/delete support
- **Dashboard** — Statistics showing total sessions and attendance averages per gender
- **Generate Laporan** — Monthly report preview with print/download/share options
- **Admin Panel** — Manage student roster (add, edit, delete members per patrol/regu)

## Domain Language (Indonesian)
- **Kegiatan** — training activity/session
- **Absensi** — attendance record
- **Siswa / PA** — boy scouts
- **Siswi / PI** — girl scouts
- **Regu** — patrol/team (e.g., Regu Garuda, Regu Melati)
- **Pembina** — scout coach/trainer
- **Gugus Depan** — local scout troop unit
- **Kamabigus** — head of troop (school principal)

## Target Users
Indonesian school-level scout coaches maintaining official activity records for submission to Kwartir (district) administration.

## Data Persistence
All data is stored in `localStorage` — there is no backend database. The Gemini API key is used for AI-assisted report generation features.
