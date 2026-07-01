<p align="center">
  <img src="docs/images/cpflow-logo.png" alt="CPFlow" width="80" />
</p>

<h1 align="center">CPFlow</h1>

<p align="center">
  <strong>The AI-Powered Operating System for Competitive Programming</strong>
</p>

<p align="center">
  Solve problems. Track progress. Learn faster.<br/>
  All in one intelligent workspace.
</p>

<p align="center">
  <a href="https://cp-flow-frontend.vercel.app">Live Demo</a> ·
  <a href="#features">Features</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#getting-started">Getting Started</a> ·
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/LangGraph-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white" alt="LangGraph" />
  <img src="https://img.shields.io/badge/Groq-F55036?style=for-the-badge&logo=groq&logoColor=white" alt="Groq" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonwebservices&logoColor=white" alt="AWS" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
</p>

<br/>

<p align="center">
  <img src="docs/images/hero.png" alt="CPFlow Hero Screenshot" width="100%" />
</p>

---

## What is CPFlow?

CPFlow is a full-stack, AI-powered workspace that eliminates the friction of competitive programming. Instead of juggling between Codeforces tabs, local IDEs, and scattered editorial blogs, CPFlow gives you a **professional-grade coding environment**, a **multi-agent AI Learning Hub** for post-attempt conceptual learning, **cross-platform analytics**, and **sandboxed code execution** — all accessible through a single browser extension click.

> [!IMPORTANT]
> CPFlow is **not** an AI cheating tool. The Learning Hub is designed for **post-attempt learning** — helping you understand concepts, alternative approaches, and related problems *after* you've attempted a solution. It does not solve contests for you.

---

## Why CPFlow?

| Problem | How CPFlow Solves It |
|---|---|
| Context-switching between browser, IDE, and terminal | One-click extension opens a full workspace with the problem statement, editor, and test runner side-by-side |
| Manually copying sample test cases | Extension automatically scrapes statement, constraints, and sample I/O |
| No structured way to learn from a problem after solving it | Multi-agent AI Learning Hub generates editorials, alternative approaches, similar problems, and curated resources |
| Progress scattered across platforms | Unified dashboard with cross-platform analytics for Codeforces, CodeChef, CSES, and LeetCode |
| Lost code drafts and workspace state | Automatic autosave to IndexedDB with cross-device sync via PostgreSQL |
| Unsafe local code execution setups | Docker-sandboxed execution engine with Linux cgroups isolation on AWS |

---

## Demo

<p align="center">
  <img src="docs/images/demo.gif" alt="CPFlow Demo" width="100%" />
</p>

> 🎬 **Video Walkthrough**: [Watch on YouTube](https://youtube.com/watch?v=YOUR_VIDEO_ID)

---

## Features

### 🧩 Browser Extension

The Chrome extension is the entry point to CPFlow. Built with the **Plasmo Framework**, it injects a "Solve in CPFlow" button directly onto supported problem pages.

| Capability | Description |
|---|---|
| One-click import | Scrapes problem statement, constraints, time/memory limits, tags, and sample test cases |
| Direct submission | Submit solutions to Codeforces directly from the CPFlow workspace |
| Live verdict polling | Real-time verdict tracking after submission (AC, WA, TLE, etc.) |
| Platform support | Codeforces and CSES with dedicated scrapers |
| Extension bridge | Secure message passing between content scripts and the CPFlow web app |

---

### ⌨️ Workspace

A professional Monaco-based IDE inspired by VSCode, designed specifically for competitive programming.

<p align="center">
  <img src="docs/images/workspace.png" alt="CPFlow Workspace" width="100%" />
</p>

| Feature | Detail |
|---|---|
| Monaco Editor | Syntax highlighting, IntelliSense, and minimap for C++, Python, and Java |
| Resizable test drawer | Bottom panel with tabbed test cases, drag-to-resize |
| Run & Submit | Execute code against sample cases or submit directly to Codeforces |
| Live verdicts | Real-time submission status with color-coded results |
| Keyboard shortcuts | Contest-speed keybindings for run, submit, and navigation |
| Code templates | Per-language starter templates (configurable in settings) |
| Autosave | Continuous draft saving to IndexedDB — never lose code |
| Cross-device sync | Drafts and layouts sync to PostgreSQL for workspace recovery on any device |
| Stopwatch | Built-in problem timer for practice sessions |

---

### 🧠 Learning Hub

The Learning Hub is a **multi-agent AI system** built on **LangGraph** that generates comprehensive learning material for any problem. It is designed for **post-attempt conceptual learning**, not contest assistance.

<p align="center">
  <img src="docs/images/learning-hub.png" alt="CPFlow Learning Hub" width="100%" />
</p>

Six specialized agents run in parallel and are validated before delivery:

| Agent | Purpose |
|---|---|
| **Overview** | Core concepts, difficulty analysis, and prerequisite topics |
| **Editorial** | Step-by-step solution walkthrough with complexity analysis |
| **Alternative Approaches** | Multiple solution strategies with trade-off comparisons |
| **Similar Problems** | Related problems for deliberate practice |
| **Resources** | Curated tutorials, blog posts, and reference materials |
| **Validator** | Cross-checks all generated content for hallucinations and accuracy |

**Additional capabilities:**

- ⚡ **Parallel execution** — All content agents run simultaneously via LangGraph fan-out
- 📡 **Server-Sent Events** — Content streams to the frontend in real-time as each agent completes
- 💡 **Explain Simply** — Highlight any text in the Learning Hub and get an ELI5 explanation
- 🔄 **Automatic revision** — If the Validator detects issues, affected agents re-run automatically
- 🗄️ **Redis caching** — Generated content is cached for 30 days to avoid redundant API calls

---

### 📊 Dashboard

<p align="center">
  <img src="docs/images/dashboard.png" alt="CPFlow Dashboard" width="100%" />
</p>

| Feature | Description |
|---|---|
| Continue Solving | Resume recent workspaces with one click |
| Connected Handles | Link Codeforces, CodeChef, CSES, and LeetCode accounts (with live validation) |
| Cross-platform Analytics | Rating graphs, problem distribution, difficulty breakdown, and verdict statistics |
| Contribution Heatmap | GitHub-style submission heatmap aggregated across all platforms |
| Contest Calendar | Upcoming contests from Codeforces and CodeChef with countdown timers |
| AI Recommendations | Personalized problem suggestions based on your solving history |
| Past Contests | Browse and analyze historical contest performance |

---

### 🗂️ Persistence Layer

| Layer | Technology | Purpose |
|---|---|---|
| Client-side | IndexedDB | Instant autosave of drafts, layouts, test cases, and metadata |
| Server-side | PostgreSQL (Neon) | Cross-device synchronization of workspace state |
| Cache | Redis | Problem data caching (30-day TTL), Learning Hub content, rate limiting |
| Recovery | Automatic sync | On workspace open, merges local and server state using timestamp-based conflict resolution |

---

## Architecture

```mermaid
graph TB
    subgraph Client ["Client Layer"]
        EXT["🧩 Chrome Extension<br/><i>Plasmo Framework</i>"]
        FE["⚛️ Next.js Frontend<br/><i>Vercel</i>"]
        IDB[("💾 IndexedDB<br/><i>Browser Storage</i>")]
    end

    subgraph Backend ["Backend Layer"]
        API["⚡ FastAPI<br/><i>Render</i>"]
        LG["🧠 LangGraph<br/><i>Multi-Agent AI</i>"]
    end

    subgraph Data ["Data Layer"]
        PG[("🐘 PostgreSQL<br/><i>Neon</i>")]
        RD[("🔴 Redis<br/><i>Cache & Rate Limit</i>")]
    end

    subgraph Infra ["Infrastructure"]
        PISTON["🐳 Piston Engine<br/><i>AWS EC2</i>"]
        GROQ["🤖 Groq API<br/><i>LLM Inference</i>"]
    end

    EXT -->|"Problem Import"| API
    EXT -->|"Solve in CPFlow"| FE
    FE <-->|"REST API"| API
    FE <-->|"Autosave"| IDB
    API <-->|"ORM"| PG
    API <-->|"Cache"| RD
    API -->|"Code Exec"| PISTON
    API -->|"SSE Stream"| FE
    LG -->|"LLM Calls"| GROQ
    API -->|"Invoke Graph"| LG
    IDB -.->|"Sync"| API

    style Client fill:#0d1117,stroke:#30363d,color:#c9d1d9
    style Backend fill:#0d1117,stroke:#30363d,color:#c9d1d9
    style Data fill:#0d1117,stroke:#30363d,color:#c9d1d9
    style Infra fill:#0d1117,stroke:#30363d,color:#c9d1d9
```

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| [Next.js](https://nextjs.org) (App Router) | React framework with SSR and file-based routing |
| [TypeScript](https://typescriptlang.org) | Type-safe development |
| [Tailwind CSS](https://tailwindcss.com) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://radix-ui.com) | Accessible, composable component primitives |
| [Monaco Editor](https://microsoft.github.io/monaco-editor/) | VSCode's editor engine for the workspace |
| [Framer Motion](https://motion.dev) | Animations and transitions |
| [NextAuth.js](https://authjs.dev) | OAuth authentication (GitHub) |
| [TanStack Query](https://tanstack.com/query) | Server state management and caching |
| [idb](https://github.com/jakearchibald/idb) | IndexedDB wrapper for client-side persistence |

### Backend

| Technology | Purpose |
|---|---|
| [FastAPI](https://fastapi.tiangolo.com) | Async Python API framework |
| [SQLAlchemy](https://sqlalchemy.org) + [AsyncPG](https://github.com/MagicStack/asyncpg) | Async ORM with PostgreSQL driver |
| [Pydantic](https://docs.pydantic.dev) | Request/response validation and serialization |
| [Redis](https://redis.io) | Caching, rate limiting, and session storage |
| [Uvicorn](https://www.uvicorn.org) | ASGI server |
| [httpx](https://www.python-httpx.org) | Async HTTP client for handle validation and API calls |

### AI Stack

| Technology | Purpose |
|---|---|
| [LangGraph](https://langchain-ai.github.io/langgraph/) | Multi-agent orchestration with parallel fan-out/fan-in |
| [Groq API](https://groq.com) | Ultra-fast LLM inference |
| Llama 4 Scout 17B | Primary model for content generation and validation |
| Server-Sent Events (SSE) | Real-time streaming of AI-generated content to the frontend |

### Infrastructure

| Service | Provider | Purpose |
|---|---|---|
| Frontend hosting | Vercel | Edge deployment with automatic CI/CD from GitHub |
| Backend hosting | Render | Managed Python hosting with auto-deploy |
| Database | Neon | Serverless PostgreSQL |
| Cache | Redis Cloud | Managed Redis for caching and rate limiting |
| Code execution | AWS EC2 (`t3.micro`) | Dockerized Piston engine with cgroup isolation |

### Browser Extension

| Technology | Purpose |
|---|---|
| [Plasmo](https://plasmo.com) | Chrome extension framework with HMR |
| Chrome Extension APIs | Content scripts, message passing, storage |
| Content scripts | DOM scraping for Codeforces and CSES problem pages |

---

## Screenshots

<details>
<summary><strong>🏠 Landing Page</strong></summary>
<br/>
<img src="docs/images/landing.png" alt="Landing Page" width="100%" />
</details>

<details>
<summary><strong>📊 Dashboard</strong></summary>
<br/>
<img src="docs/images/dashboard-full.png" alt="Dashboard" width="100%" />
</details>

<details>
<summary><strong>⌨️ Workspace</strong></summary>
<br/>
<img src="docs/images/workspace-full.png" alt="Workspace" width="100%" />
</details>

<details>
<summary><strong>🧠 Learning Hub</strong></summary>
<br/>
<img src="docs/images/learning-hub-full.png" alt="Learning Hub" width="100%" />
</details>

<details>
<summary><strong>📈 Analytics</strong></summary>
<br/>
<img src="docs/images/analytics.png" alt="Analytics" width="100%" />
</details>

<details>
<summary><strong>🧩 Browser Extension</strong></summary>
<br/>
<img src="docs/images/extension.png" alt="Browser Extension" width="100%" />
</details>

---

## Learning Hub Architecture

The Learning Hub uses a **LangGraph StateGraph** with parallel fan-out execution. All content agents run simultaneously, and their outputs converge into a Validator agent that checks for hallucinations before streaming to the frontend.

```mermaid
graph TD
    START((Start)) --> OV["📋 Overview Agent"]
    START --> ED["📝 Editorial Agent"]
    START --> ALT["🔀 Alternatives Agent"]
    START --> SIM["🔗 Similar Problems Agent"]
    START --> RES["📚 Resources Agent"]

    OV --> VAL{"🛡️ Validator Agent"}
    ED --> VAL
    ALT --> VAL
    SIM --> VAL
    RES --> VAL

    VAL -->|"Valid ✅"| SSE["📡 SSE Stream"]
    VAL -->|"Invalid ❌<br/>revision_count < 1"| OV

    SSE --> FE["⚛️ Frontend<br/>Real-time Rendering"]

    style START fill:#10b981,stroke:#059669,color:#fff
    style VAL fill:#f59e0b,stroke:#d97706,color:#000
    style SSE fill:#3b82f6,stroke:#2563eb,color:#fff
    style FE fill:#8b5cf6,stroke:#7c3aed,color:#fff
```

---

## Browser Extension Flow

```mermaid
sequenceDiagram
    actor User
    participant CF as Codeforces / CSES
    participant EXT as Chrome Extension
    participant FE as CPFlow Frontend
    participant API as FastAPI Backend
    participant PS as Piston (AWS EC2)

    User->>CF: Opens problem page
    EXT->>CF: Scrapes statement, samples, constraints
    User->>EXT: Clicks "Solve in CPFlow"
    EXT->>API: POST /api/problems/import
    API-->>EXT: Returns problem_id
    EXT->>FE: Opens /workspace?platform=...&pid=...
    FE->>API: GET /api/problems/{id}
    API-->>FE: Returns cached problem data

    Note over FE: User writes solution in Monaco Editor

    User->>FE: Clicks "Run"
    FE->>API: POST /api/run
    API->>PS: Execute code in Docker sandbox
    PS-->>API: stdout, stderr, exit code
    API-->>FE: Verdict (Accepted / WA / TLE / RE / CE)

    User->>FE: Clicks "Submit"
    FE->>API: POST /api/submit
    API->>CF: Submits via Codeforces API
    API-->>FE: Polls verdict until final
```

---

## Persistence Architecture

```mermaid
graph LR
    subgraph Browser
        ED["Monaco Editor"] -->|"onChange"| AS["Autosave Hook"]
        AS -->|"Immediate"| IDB[("IndexedDB")]
        AS -->|"Debounced"| SYNC["Sync Service"]
    end

    subgraph Server
        SYNC -->|"POST /api/workspace/sync"| API["FastAPI"]
        API -->|"Last-write-wins"| PG[("PostgreSQL")]
    end

    subgraph Recovery ["Workspace Recovery"]
        OPEN["Open Workspace"] -->|"1. Check IndexedDB"| IDB
        OPEN -->|"2. Fetch from server"| API
        API -->|"3. Compare timestamps"| MERGE["Merge Strategy"]
        MERGE -->|"Newest wins"| ED
    end

    style Browser fill:#0d1117,stroke:#30363d,color:#c9d1d9
    style Server fill:#0d1117,stroke:#30363d,color:#c9d1d9
    style Recovery fill:#0d1117,stroke:#30363d,color:#c9d1d9
```

---

## Folder Structure

```
cpflow/
├── frontend/                   # Next.js application
│   └── src/
│       ├── app/                # App Router pages
│       │   ├── dashboard/      # Dashboard with analytics
│       │   ├── workspace/      # Monaco IDE workspace
│       │   ├── contests/       # Contest calendar & past contests
│       │   ├── login/          # OAuth login page
│       │   └── onboarding/     # Handle linking form
│       ├── components/         # Shared UI components
│       │   ├── landing/        # Landing page sections
│       │   ├── analytics/      # Chart components
│       │   ├── dashboard/      # Dashboard-specific components
│       │   └── ui/             # shadcn/ui primitives
│       ├── features/           # Feature modules
│       │   ├── workspace/      # Editor, drawer, autosave, sync
│       │   └── learning-hub/   # Learning Hub UI & SSE client
│       └── shared/             # Shared types and utilities
├── backend/                    # FastAPI application
│   ├── agents/                 # LangGraph multi-agent system
│   │   ├── learning_hub_graph.py  # StateGraph definition
│   │   └── prompts.py         # Agent system prompts & Pydantic schemas
│   ├── auth/                   # JWT authentication & rate limiting
│   ├── routers/                # API route handlers
│   │   ├── analytics.py        # Platform statistics aggregation
│   │   ├── contests.py         # Contest calendar API
│   │   ├── execute.py          # Piston code execution proxy
│   │   ├── learning_hub.py     # SSE streaming endpoint
│   │   ├── recommendations.py  # AI problem recommendations
│   │   ├── users.py            # User management & handle validation
│   │   └── workspace.py        # Draft & layout sync
│   ├── utils/                  # Handle validators
│   ├── models.py               # SQLAlchemy ORM models
│   ├── database.py             # Async database engine
│   ├── cache.py                # Redis caching helpers
│   └── main.py                 # FastAPI app entrypoint
├── extension/                  # Chrome extension (Plasmo)
│   ├── scrapers/               # Platform-specific DOM scrapers
│   │   ├── codeforces.ts       # Codeforces problem scraper
│   │   └── cses.ts             # CSES problem scraper
│   ├── content.tsx             # Content script injected into problem pages
│   ├── content-bridge.tsx      # Extension ↔ webapp message bridge
│   ├── background.ts           # Service worker
│   └── popup.tsx               # Extension popup UI
└── docker-compose.yml          # Local Piston development setup
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.12+
- Docker (for Piston code execution engine)
- PostgreSQL database ([Neon](https://neon.tech) recommended)
- Redis instance
- [Groq API key](https://console.groq.com) (free tier available)

### 1. Clone the Repository

```bash
git clone https://github.com/Manik178/CPFlow.git
cd CPFlow
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# GitHub OAuth
GITHUB_ID=your-github-oauth-id
GITHUB_SECRET=your-github-oauth-secret

# Backend API (proxied through Next.js)
BACKEND_URL=http://localhost:8000
```

```bash
npm run dev
```

### 3. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@host/dbname

# Redis
REDIS_URL=redis://default:password@host:port

# Groq AI
GROQ_API_KEY=gsk_your_groq_api_key

# Piston execution engine
PISTON_URL=http://localhost:2000

# Auth
JWT_SECRET=your-jwt-secret

# Sentry (optional)
SENTRY_DSN=your-sentry-dsn
```

```bash
uvicorn main:app --reload --port 8000
```

### 4. Extension Setup

```bash
cd extension
npm install
npm run dev    # Starts Plasmo dev server with HMR
```

Load the unpacked extension from `extension/build/chrome-mv3-dev` in `chrome://extensions`.

### 5. Piston (Code Execution Engine)

```bash
docker-compose up -d
```

Or deploy to an EC2 instance for production. See the [Piston documentation](https://github.com/engineer-man/piston) for available language runtimes.

---

## Deployment

| Component | Platform | Method |
|---|---|---|
| **Frontend** | [Vercel](https://vercel.com) | Connect GitHub repo → auto-deploy on push |
| **Backend** | [Render](https://render.com) | Connect GitHub repo → auto-deploy on push |
| **Database** | [Neon](https://neon.tech) | Serverless PostgreSQL (free tier available) |
| **Cache** | [Redis Cloud](https://redis.com/cloud) | Managed Redis (free tier available) |
| **Execution Engine** | [AWS EC2](https://aws.amazon.com/ec2/) | Ubuntu `t3.micro` with Docker + Piston |

---

## Performance Optimizations

| Optimization | Impact |
|---|---|
| HTML stripping with BeautifulSoup | Reduces LLM token usage by ~60% by stripping raw HTML from problem statements before sending to agents |
| Redis caching (30-day TTL) | Eliminates redundant AI generation for previously analyzed problems |
| Pydantic structured output | Ensures type-safe, validated JSON responses from all LLM agents |
| Async database queries | Non-blocking I/O with SQLAlchemy + AsyncPG for all database operations |
| Server-Sent Events | Streams Learning Hub content as each agent completes, rather than waiting for all agents |
| Skeleton loading states | Instant perceived performance with animated loading placeholders |
| Incremental sync | Only syncs workspace changes newer than the server's last-known timestamp |
| LangGraph parallel fan-out | All 5 content agents execute simultaneously, reducing total latency to a single LLM call |

---

## Security

| Measure | Implementation |
|---|---|
| **Authentication** | NextAuth.js with GitHub OAuth → JWT tokens verified on every backend request |
| **Code sandboxing** | Piston executes all user code inside ephemeral Docker containers with no network access |
| **Resource isolation** | Linux cgroups v2 enforce CPU, memory, and time limits on code execution |
| **Input validation** | Pydantic models validate every API request body; SQLAlchemy ORM prevents SQL injection |
| **Rate limiting** | Redis-backed rate limiter on all API endpoints (configurable per-route) |
| **Handle validation** | Async verification of Codeforces, LeetCode, CodeChef, and CSES handles against official APIs before saving |
| **CORS** | Configurable origin allowlist for frontend and extension domains |

---

## Roadmap

- [ ] 🦊 Firefox extension support
- [ ] 💻 VSCode extension for local development workflows
- [ ] 🏗️ Additional platforms (LeetCode workspace, AtCoder)
- [ ] 👥 Team workspaces for competitive programming groups
- [ ] 📱 Mobile-responsive dashboard
- [ ] 🔌 Public REST API for third-party integrations
- [ ] 📓 Integrated problem notebook with markdown support
- [ ] 🏆 Virtual contest mode with simulated standings

---

## Contributing

Contributions are welcome! Whether it's a bug fix, new feature, documentation improvement, or platform scraper — we'd love your help.

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feat/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feat/amazing-feature`)
5. **Open** a Pull Request

> [!TIP]
> Check out the [`good first issue`](https://github.com/Manik178/CPFlow/labels/good%20first%20issue) label for beginner-friendly contributions.

### Development Guidelines

- Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages
- Ensure all TypeScript code passes type checking (`npm run build`)
- Test your changes locally before submitting a PR
- Update documentation if you add or change features

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## Acknowledgements

CPFlow is built on the shoulders of incredible open-source projects and platforms:

| | |
|---|---|
| [Codeforces](https://codeforces.com) | Competitive programming platform and API |
| [CSES](https://cses.fi) | Problem set and competitive programming resources |
| [Next.js](https://nextjs.org) | React framework by Vercel |
| [FastAPI](https://fastapi.tiangolo.com) | Modern Python web framework |
| [LangGraph](https://langchain-ai.github.io/langgraph/) | Multi-agent orchestration framework |
| [Groq](https://groq.com) | Ultra-fast LLM inference API |
| [Piston](https://github.com/engineer-man/piston) | Sandboxed code execution engine |
| [Monaco Editor](https://microsoft.github.io/monaco-editor/) | VSCode's editor component |
| [shadcn/ui](https://ui.shadcn.com) | Beautiful, accessible UI components |
| [Plasmo](https://plasmo.com) | Browser extension framework |

---

<p align="center">
  <strong>Built with ❤️ for the competitive programming community</strong>
</p>

<p align="center">
  <a href="https://github.com/Manik178/CPFlow/stargazers">⭐ Star this repo</a> if CPFlow helps your competitive programming journey!
</p>
