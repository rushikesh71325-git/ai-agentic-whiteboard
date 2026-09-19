# ScribeBoard — AI Agentic Whiteboard

ScribeBoard is a next-generation collaborative visual whiteboard and architecture ideation studio powered by high-speed AI inference and an infinite interactive canvas.

---

## ✨ Features

- **Infinite Interactive Whiteboard**: Full-featured drawing canvas powered by Excalidraw with support for freehand drawing, geometric shapes, sticky notes, arrows, text, and rich color palettes.
- **Domain-Adaptive AI Generation**: Convert natural language prompts into structured visual diagrams across multiple domains:
  - **System Architecture**: Multi-tier cloud topologies, API gateways, microservices, messaging queues, and databases.
  - **Process Workflows & Flowcharts**: Step-by-step logic flows with diamond decision branches and labeled condition paths.
  - **Geography & Mindmaps**: Categorical region breakdowns and multi-level conceptual networks.
  - **Wireframe Mockups**: Instant responsive desktop and mobile interface blueprints.
- **Automated Mathematical Layout Engine**: Directed graph compiler that places nodes in clean hierarchical columns with straight-edge arrow routing and zero overlapping shapes.
- **Output Depth Modes**:
  - **Standard**: Clean, high-level structural overviews.
  - **Deep / Detailed**: Comprehensive multi-node topologies accompanied by markdown architectural specifications.
- **Contextual Whiteboard Intelligence**:
  - **Explain Current Board**: Scans canvas elements and provides an architectural breakdown, data flow analysis, and potential bottlenecks.
  - **Brainstorm Ideas**: Proposes architectural extensions and feature implementations directly based on your active board.
  - **Specification Export**: One-click copy of generated markdown technical documentation.
- **Cloud Persistence & Project Management**:
  - Automatic canvas autosave to Neon Serverless PostgreSQL via Drizzle ORM.
  - Dashboard with project search, filtering, thumbnail previews, creation dialog, and deletion.
- **Enterprise Authentication**: User management and session security powered by Clerk.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Frontend UI**: React 19, Tailwind CSS v4, Base UI, Lucide Icons
- **Canvas Engine**: `@excalidraw/excalidraw`
- **AI Inference**: Groq API (`openai/gpt-oss-120b`, `groq/compound-mini`, `qwen/qwen3.8-27b`)
- **Database & ORM**: Neon Serverless PostgreSQL & Drizzle ORM
- **Authentication**: Clerk (`@clerk/nextjs`)
- **Language**: TypeScript

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.18+ or later
- npm or pnpm
- A Neon PostgreSQL account (or compatible PostgreSQL database)
- A Clerk account for authentication
- A Groq Cloud API key

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd ai-agentic-whiteboard
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory and copy the contents from `.env.example`:

```bash
cp .env.example .env
```

Fill in your configuration keys:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Neon Serverless Postgres Database (Drizzle ORM)
DATABASE_URL=postgresql://neondb_owner:your_password@ep-placeholder-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

# Groq Cloud API Key
GROQ_API_KEY=gsk_...
```

### 3. Initialize Database Schema

Push the Drizzle ORM schema to your Neon PostgreSQL database:

```bash
npm run db:push
```

You can inspect your database anytime using Drizzle Studio:

```bash
npm run db:studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start using ScribeBoard.

---

## 📁 Project Structure

```text
├── app/
│   ├── api/
│   │   ├── ai/               # AI inference route with graph compiler and fallback
│   │   └── whiteboard/       # Canvas persistence and project API
│   ├── dashboard/            # Project manager and recent boards
│   ├── workspace/[projectid] # Interactive whiteboard workspace
│   ├── sign-in/              # Clerk sign-in page
│   ├── sign-up/              # Clerk sign-up page
│   ├── layout.tsx            # Root layout with Clerk and Theme providers
│   └── page.tsx              # Landing page
├── components/
│   ├── custom/
│   │   ├── dashboard/        # ProjectList, CreateNewBoardDialog
│   │   └── workspace/        # Whiteboard, AIFloatingSidebar, WorkspaceHeader
│   └── ui/                   # Reusable UI primitives (dialog, button, toast, etc.)
├── db/
│   ├── index.ts              # Neon database client
│   └── schema.ts             # Drizzle ORM schema (projects table)
├── proxy.ts                  # Next.js development proxy configuration
└── package.json
```

---

## 📜 Available Scripts

- `npm run dev`: Launch development server with Turbopack.
- `npm run build`: Build production application bundle.
- `npm run start`: Start production server.
- `npm run lint`: Run ESLint check.
- `npm run db:push`: Synchronize schema changes directly to Neon PostgreSQL.
- `npm run db:studio`: Launch local web GUI to browse database tables.

---

## 🔒 License

MIT
