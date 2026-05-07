# SYN AUTH Dashboard

  Premium hacker-style SaaS authentication & licensing dashboard.
  Deep black + dark red UI with Framer Motion animations and full CRUD.

  ## Quick Start

  ```bash
  npm install
  npm run dev
  ```

  Then open http://localhost:5173

  ## Stack

  - React 19 + Vite + TypeScript
  - Tailwind CSS v4 (no config file needed — theme in src/index.css)
  - Framer Motion animations
  - Recharts (dashboard charts)
  - Wouter (lightweight routing)
  - Radix UI / shadcn components

  ## Pages

  | Route | Description |
  |-------|-------------|
  | / | Dashboard — stats, activity chart, user status donut |
  | /applications | App CRUD + credentials panel (Owner ID, App Secret, version) |
  | /licenses | License key table with status badges |
  | /users | User & Key management — create, pause, delete |
  | /integration | SDK code generator + live key validator |
  | /tokens | API token management |
  | /settings | Profile, password, security toggles |

  ## SDK Integration

  See `sdk/synauth.js` for the standalone SDK.

  Or use the dashboard Integration page to auto-generate a version
  with your real keys pre-embedded. Copy and paste into any project.

  ### Quick SDK example

  ```html
  <script src="sdk/synauth.js"></script>
  <script>
    const result = validateKey("SYNAUTH-XXXX-XXXX-XXXX", getHwid());
    if (result.success) {
      console.log("Access Granted:", result.user);
    } else {
      console.log("Access Denied:", result.error);
      // Errors: INVALID_KEY | PAUSED | EXPIRED | HWID_MISMATCH
    }
  </script>
  ```

  ## Project Structure

  ```
  src/
    lib/
      app-store.tsx    — shared React context (apps + managed users)
      key-system.ts    — validateKey(), generateKey(), expiryFromPreset()
      mock-data.ts     — seed data & TypeScript types
      utils.ts         — cn() helper
    pages/
      Dashboard.tsx    — stats + charts
      Applications.tsx — app CRUD + credentials + SDK modal
      Integration.tsx  — SDK generator, live validator, docs
      Users.tsx        — user/key table with full CRUD
      Licenses.tsx     — license overview
      Tokens.tsx       — API token cards
      Settings.tsx     — profile & security settings
    components/
      Layout.tsx            — shell with particle background
      Sidebar.tsx           — nav sidebar
      Navbar.tsx            — top bar
      ParticleBackground.tsx — animated red canvas particles
      ui/                   — shadcn/ui components

  sdk/
    synauth.js   — standalone SDK (no dependencies, browser + Node.js)
  ```
  