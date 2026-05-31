# 🌿 KeepClean - Front-End Web Application

Welcome to the **KeepClean** Front-End repository! This directory contains the modern, responsive, and aesthetically outstanding user interface of the KeepClean Notes Application.

Designed with a warm-neutral Sage green palette and glassmorphism micro-animations, this frontend delivers a premium, distraction-free notes management experience. It is fully integrated with our Laravel 11 JWT-based RESTful API.

---

## ✨ Features & Technology Stack

- **Core Framework**: [Next.js 15+ (App Router)](https://nextjs.org/) for highly optimized, responsive routing and lightning-fast rendering.
- **Type Safety**: [TypeScript](https://www.typescriptlang.org/) for robust, type-checked frontend code and API models.
- **Styling & Aesthetics**: Premium CSS with custom KeepClean design tokens (Sage Green, Alabaster, Soft Warm Clay) for smooth animations, glassmorphic card overlays, and responsive mobile-first layouts.
- **State Management**: React Context (`NotesContext`) with automatic session synchronizations and state persistence using `localStorage`.
- **Component Documentation**: [Storybook](https://storybook.js.org/) for building, organizing, and testing UI components isolated from the backend API.
- **Unit Testing**: [Vitest](https://vitest.dev/) for robust, fast assertions and UI unit tests.

---

## 🛠️ Getting Started

Follow these instructions to run the KeepClean Frontend locally in development mode.

### 📋 Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [pnpm](https://pnpm.io/) (preferred package manager)

### 🚀 Running the Development Server

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Run the local dev server**:
   ```bash
   pnpm dev
   ```

3. **Access the application**:
   Open [http://localhost:3000](http://localhost:3000) on your browser.

---

## 🎨 Storybook Integration

All custom UI elements are documented, styled, and developed inside Storybook.

To run the Storybook documentation server:
```bash
pnpm storybook
```
This launches the Storybook dashboard locally at [http://localhost:6006](http://localhost:6006).

---

## 📂 Directory Structure

```text
Front-End/
├── .storybook/         # Storybook configuration & layouts
├── public/             # Static public assets (logos, svg icons)
├── src/
│   ├── app/            # Next.js App Router (pages & global layouts)
│   ├── components/     # Reusable, atomic UI components (NoteCard, NoteComposer, Sidebar, etc.)
│   ├── context/        # NotesContext (global state, auth handling, client API sync)
│   ├── lib/            # api.ts (Fetch wrappers, header injections, and REST mappings)
│   └── stories/        # Storybook story definitions & documentation assets
└── tsconfig.json       # TypeScript compiler settings
```

---

## 🧪 Running Client-Side Tests

To run the Vitest unit tests:
```bash
pnpm test
```
