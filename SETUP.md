# Getting Reppy running on your machine

Everything so far lives on GitHub. To run any of it you need a copy on your own
computer — the commands in the checklist all run from inside that folder.

## 1. Install the prerequisites

You need two things, both one-time installs.

| | macOS | Windows |
|---|---|---|
| **Git** | Pre-installed. Check with `git --version` | [git-scm.com/download/win](https://git-scm.com/download/win) |
| **Node.js 20+** | [nodejs.org](https://nodejs.org) — take the LTS build | Same |

Verify both, in a terminal — Terminal on macOS, PowerShell on Windows:

```bash
git --version
node --version    # must be v20 or higher
```

A code editor helps too. [VS Code](https://code.visualstudio.com) is the usual choice.

## 2. Clone the repository

Pick where you keep projects, then:

```bash
cd ~/Projects                      # or wherever you like
git clone https://github.com/styang719/Reppy.git
cd Reppy
git checkout claude/cloud-env-repo-setup-5sdlsc
```

That last line matters — the work is on a branch, not on `main`.

## 3. Install the dependencies

```bash
npm install
```

This pulls down the app packages **and the Supabase CLI**, which ships as a project
dependency. There is nothing to install globally: Supabase no longer supports
`npm install -g supabase`, and a project-local CLI keeps everyone on the same version.

## 4. Check it worked

```bash
npm run typecheck
npx supabase --version
```

Both should succeed. If they do, you are ready for the checklist.

---

## Where every command runs

**Inside the `Reppy` folder, in a terminal.** If a command errors with "command not
found" or "no such file", you are almost certainly in the wrong directory — `pwd` on
macOS or `cd` on Windows will tell you where you are.

## The commands you will use

| Command | What it does |
|---|---|
| `npm run db:link` | Connect the CLI to your Supabase project |
| `npm run db:push` | Apply all migrations — tables, RLS, storage, seed data |
| `npm run db:types` | Regenerate TypeScript types from the live schema |
| `npm run fn:deploy` | Deploy the identify-equipment function |
| `npm run ingest` | Load exercise content |
| `npm run curate` | Load your curated walkthrough videos |
| `npm run eval` | Measure vision accuracy on a folder of photos |
| `npm start` | Run the app |
| `npm run typecheck` | Check types across the app and scripts |
| `npm run lint` | Check code style |

## Passing secrets to a command

Some scripts need credentials. Put them in front of the command rather than in a file:

```bash
# macOS / Linux
SUPABASE_URL=https://opuukgfcqbrtissdawyq.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=eyJ... \
npm run ingest -- --source=free-exercise-db
```

```powershell
# Windows PowerShell
$env:SUPABASE_URL="https://opuukgfcqbrtissdawyq.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."
npm run ingest -- --source=free-exercise-db
```

The service role key bypasses Row Level Security, so it belongs only in your terminal
and in Edge Function secrets — never in the app, and never committed.
