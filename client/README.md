# Great Subs Client

This is the frontend application for managing application submissions. It is a modern single-page application built with **React 19**, styled with **Material UI**, and powered by **Vite**.

## Core Technologies

- **[React](https://react.dev/) (v19)**: The library for web and native user interfaces.
- **[Vite](https://vitejs.dev/)**: Next Generation Frontend Tooling for extremely fast hot module replacement and building.
- **[TypeScript](https://www.typescriptlang.org/)**: Strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.
- **[Material UI](https://mui.com/) (v7)**: A comprehensive suite of UI tools to help you ship new features faster. Used for all core styling, layouts, and components (leveraging `@emotion/styled`).
- **[Redux Toolkit](https://redux-toolkit.js.org/) & [RTK Query](https://redux-toolkit.js.org/rtk-query/overview)**: The official, opinionated, batteries-included toolset for efficient Redux development. RTK Query is exclusively used for data fetching and caching API responses.
- **[React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)**: Performant, flexible and extensible forms with easy-to-use validation (Zod used for schema-based validation).
- **[React Toastify](https://fkhadra.github.io/react-toastify/)**: Used in conjunction with Redux middleware to display global application notifications (success/error states).

## Project Structure

The project follows a modular architecture using "barrel exports" (`index.ts` files) to maintain clean import paths and encapsulation.

```text
src/
├── components/          # Reusable UI components
│   ├── Header/          # Main application header and theme controls
│   ├── inputs/          # Custom form inputs (SearchInput, SelectBox, etc.)
│   ├── layouts/         # Layout-specific components (PageContainer, PageHeader, etc.)
│   └── typography/      # Standardized typography components (H1, P, Subtitle, etc.)
├── hooks/               # Custom React hooks
├── pages/               # Page-level components
│   └── Submissions/     # Submissions management page and its sub-components
├── providers/           # Context providers (Theme, Auth, etc.)
├── store/               # Redux state management
│   ├── middlewares/     # Global middlewares (Error/Success handling)
│   └── slices/          # RTK Query API slices and Redux slices
├── types/               # Split TypeScript definitions for all domain entities
├── theme/               # Global MUI theme configuration and design tokens
├── Shell.tsx            # Root application shell (Context providers, Global styles)
└── App.tsx              # Main entry point and routing
```

### Key Import Patterns
We use absolute path aliases (defined in `tsconfig.json`) and barrel exports to keep imports concise:

- **Good**: `import { Button, H1 } from "@/components"`
- **Avoid**: `import { Button } from "../../components/inputs/Button"`

## Architectural Decisions

### 1. Modular Type Declarations
Instead of one massive `types.ts` file, types are split into domain-specific files within `src/types/` (e.g., `submission.ts`, `submission-status.ts`) and re-exported through a central `index.ts`. This improves maintainability and linting performance.

### 2. Global Notification Middleware
The application uses custom Redux middlewares (`errorMiddleware` and `successMiddleware`) located in `src/store/middlewares/`. These intercept RTK Query mutations to automatically trigger `react-toastify` notifications, ensuring consistent UX without manual error handling in every component.

### 3. Styled System
Styling is strictly enforced using MUI's `styled` API. We avoid inline styles and generic CSS files in favor of a theme-derived typed system. This ensures that spacing, colors, and typography always align with the design system.

## Setup and Running

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

The application will be accessible at `http://localhost:5173`. It expects the backend API to be running on `http://localhost:8000` (configurable via `.env`).

## Testing

The project uses **Vitest** for unit and component testing.

- **Run tests**: `npm run test`
- **Run tests with UI**: `npm run test:ui`

Tests are located in `src/tests/` and use `@testing-library/react` for component validation.
