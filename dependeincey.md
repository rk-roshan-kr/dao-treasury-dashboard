# Dependencies – dao-treasury-dashboard

This document lists all direct dependencies, development tooling, runtime prerequisites, and notable peer/engine requirements for this project. It is derived from the repository manifests (package.json, package-lock.json, tsconfig.json, vite.config.ts, tailwind.config.js, postcss.config.js).

Note: The complete transitive dependency tree (all nested packages) is captured by package-lock.json. If you want, we can generate an appendix enumerating every locked package and version.


## Runtime prerequisites
- Node.js: >= 18 (required by Vite 5)
- npm: comes with Node.js (this project uses npm as indicated by package-lock.json)
- OS: Windows, macOS, or Linux (no native build prerequisites appear necessary beyond Node)

Optional developer tooling:
- A modern package manager alternative (pnpm or yarn) can be used, but lockfile is npm’s.
- Editor with TypeScript/ESLint plugins recommended.


## Package manager and lockfile
- Package manager: npm
- Lockfile: package-lock.json (lockfileVersion: 3)


## Scripts
- dev: vite
- build: tsc -b && vite build
- preview: vite preview

Implications:
- TypeScript project build references a composite/tsbuild scenario (tsc -b). No separate tsconfig.build.json is present; the root tsconfig.json is used.


## Direct dependencies (runtime)
- @emotion/react: ^11.13.3
- @emotion/styled: ^11.13.0
- @mui/icons-material: ^6.0.0
- @mui/material: ^6.0.0
- framer-motion: ^12.23.12
- lucide-react: ^0.540.0
- react: ^18.3.1
- react-dom: ^18.3.1
- react-router-dom: 6.30.1
- recharts: ^2.12.7

What they’re used for:
- React + React DOM: Application UI framework
- React Router DOM: Client-side routing
- MUI (@mui/material, @mui/icons-material): UI component library
- Emotion (@emotion/react, @emotion/styled): CSS-in-JS styling (MUI’s default styling engine)
- Framer Motion: Animations and transitions
- Recharts: Charting library
- lucide-react: Icon set for React


## Development dependencies (tooling)
- @types/react: ^18.3.3
- @types/react-dom: ^18.3.0
- @vitejs/plugin-react: ^4.3.1
- autoprefixer: ^10.4.20
- postcss: ^8.4.41
- tailwindcss: ^3.4.11
- typescript: ~5.5.4
- vite: ^5.4.1

What they’re used for:
- TypeScript: Type checking and TS build
- Vite + @vitejs/plugin-react: Dev server and build tool for React
- Tailwind CSS, PostCSS, Autoprefixer: Utility-first CSS and processing pipeline
- @types/*: Type definitions for TypeScript


## Tooling and configuration files
- vite.config.ts
  - Uses @vitejs/plugin-react.
- tsconfig.json
  - Key options: target ES2020, module ESNext, jsx react-jsx, strict true, types ["vite/client"], include ["src"].
- tailwind.config.js
  - darkMode: class
  - content globs: ./index.html, ./src/**/*.{ts,tsx}
  - custom theme extensions (colors, shadows, borderRadius)
- postcss.config.js
  - plugins: tailwindcss, autoprefixer


## Peer dependencies and compatibility notes
- MUI (@mui/material 6.x and @mui/icons-material 6.x):
  - Peer deps include React (>=17), React DOM (>=17), and optionally @emotion/react & @emotion/styled (present here).
  - Engines typically require Node >= 14 for MUI packages themselves; however, the build tool (Vite 5) drives the Node >= 18 requirement overall.
- @emotion/* packages:
  - Peer deps include React >=16.8.
- @vitejs/plugin-react:
  - Peer dep: vite ^4 || ^5 || ^6 || ^7 (we use Vite 5.x).
- Tailwind & PostCSS:
  - autoprefixer peers: postcss ^8.1.0 (satisfied).


## Engine requirements and recommended versions
- Vite 5 requires Node >= 18.0.0 (or >= 20). Use Node 18 LTS or newer for best results.
- Many transitive packages declare lower minimum Node versions; the strictest requirement wins (Vite).

Suggested versions:
- Node: 18.x (LTS) or 20.x
- npm: latest bundled with your Node version


## Transitive build/runtime stack (high-level)
These are not directly listed in package.json but are pulled in by tooling:
- rollup (bundler used by Vite)
- esbuild (used for transforms and optimizations)
- Babel (via @vitejs/plugin-react for JSX dev transforms)
- chokidar (file watching during dev)
- Browserslist data (via autoprefixer/postcss ecosystem)

You don’t need to install these manually; npm resolves them via package-lock.json.


## Browsers support
- Determined by your Tailwind/PostCSS/Autoprefixer and any project-specific Browserslist configuration. No explicit browserslist entry is present, so defaults apply to the tooling.


## How to set up (summary)
1) Install Node >= 18
2) Install dependencies:
   - npm ci (for clean install using lockfile) or npm install
3) Start development server:
   - npm run dev
4) Build for production:
   - npm run build
5) Preview production build locally:
   - npm run preview


## Notes
- This document captures direct dependencies and the key tooling involved. The exhaustive nested dependency tree is large and already locked by package-lock.json. We can export it to this file (or a separate appendix) if needed.
