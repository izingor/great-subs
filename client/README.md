# Great Subs Client

This is the frontend application for managing insurance submissions. It is a modern single-page application built with **React 19**, styled with **Material UI**, and powered by **Vite**.

## Core Technologies

- **[React](https://react.dev/) (v19)**: The library for web and native user interfaces.
- **[Vite](https://vitejs.dev/)**: Next Generation Frontend Tooling for extremely fast hot module replacement and building.
- **[TypeScript](https://www.typescriptlang.org/)**: Strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.
- **[Material UI](https://mui.com/) (v7)**: A comprehensive suite of UI tools to help you ship new features faster. Used for all core styling, layouts, and components (leveraging `@emotion/styled`).
- **[Redux Toolkit](https://redux-toolkit.js.org/) & [RTK Query](https://redux-toolkit.js.org/rtk-query/overview)**: The official, opinionated, batteries-included toolset for efficient Redux development. RTK Query is exclusively used for data fetching and caching API responses.
- **[React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)**: Performant, flexible and extensible forms with easy-to-use validation (Zod used for schema-based validation).
- **[React Toastify](https://fkhadra.github.io/react-toastify/)**: Used in conjunction with Redux middleware to display global application notifications (success/error states).

## Setup and Running

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```

The application will be accessible at `http://localhost:5173` (or the port specified by Vite). It expects the backend API to be running on `http://localhost:8000`.

Alternatively, you can run all services together from the root of the project using the provided `run.sh` script.

## Project Structure

- `src/components/`: Reusable UI components (buttons, inputs, layout elements).
- `src/features/` or `src/pages/`: Page-level components and their specific sub-components (e.g., `Submissions/`).
- `src/store/`: Redux store configuration, API slices (RTK Query), and global middlewares (error/success handling).
- `src/types/`: Shared TypeScript interfaces and types.
- `src/theme.ts`: Custom MUI theme configuration to apply consistent aesthetics.
