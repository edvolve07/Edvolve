<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white" alt="React Router"/>
  <img src="https://img.shields.io/badge/Recharts-FF6B6B?style=for-the-badge&logo=recharts&logoColor=white" alt="Recharts"/>
  <img src="https://img.shields.io/badge/Lucide_Icons-F56565?style=for-the-badge&logo=lucide&logoColor=white" alt="Lucide"/>
</p>

<h1 align="center">PrepUp Frontend</h1>
<p align="center">
  <strong>React + Vite frontend for the PrepUp AI-driven placement readiness platform</strong>
  <br/>
  Mock interviews · Aptitude tests · Dashboards · Analytics · Reports
</p>

---

## Architecture Overview

```mermaid
graph TB
    subgraph Browser["Browser Layer"]
        A[BrowserRouter]
        B[AuthProvider]
        C[ToastProvider]
    end

    subgraph Routing["Route Layer"]
        D[Public Routes]
        E[RequireSession Guard]
        F[RequireRole Guard]
        G[RoleGuard]
    end

    subgraph Layout["Layout Layer"]
        H[AppShell]
        I[Sidebar]
        J[Header / Logout]
    end

    subgraph Pages["Page Components"]
        K[Student Pages]
        L[Admin Pages]
        M[Master Admin Pages]
        N[Auth Pages]
    end

    subgraph State["State Layer"]
        O[AuthContext]
        P[ToastContext]
    end

    subgraph API["API Layer"]
        Q[lib/api.js fetch wrapper]
    end

    A --> B --> C
    C --> Routing
    D --> N
    E --> Routing --> Layout
    F --> E
    G --> F
    H --> I
    H --> J
    Layout --> Pages
    Pages --> State
    Pages --> API
    State --> API
```

---

## Route Hierarchy

```mermaid
graph LR
    subgraph Public["Public Routes"]
        direction LR
        A1["/login"]
        A2["/signup"]
        A3["/forgot-password"]
        A4["/reset-password"]
        A5["/access-revoked"]
    end

    subgraph Student["Student Routes"]
        direction LR
        S1["/dashboard"]
        S2["/interview"]
        S3["/aptitude/*"]
        S4["/reports/*"]
        S5["/student/*"]
    end

    subgraph Admin["Admin Routes"]
        direction LR
        AD1["/admin-dashboard"]
        AD2["/admin/assessments"]
        AD3["/admin/analytics/*"]
    end

    subgraph Master["Master Admin Routes"]
        direction LR
        M1["/master-admin-dashboard"]
        M2["/master-admin/students"]
        M3["/master-admin/admins"]
        M4["/master-admin/create-admin"]
        M5["/master-admin/create-user"]
        M6["/master-admin/ai-usage"]
    end

    Public -->|Login| Student
    Public -->|Login| Admin
    Public -->|Login| Master
```

---

## Authentication Flow

```mermaid
sequenceDiagram
    actor User
    participant Browser as Browser (LocalStorage)
    participant Auth as AuthContext
    participant API as Backend API

    User->>Auth: Login(email, password)
    Auth->>API: POST /auth/login
    API-->>Auth: { token, user }
    Auth->>Browser: Store token in localStorage
    Auth-->>User: Set user state, redirect

    Note over Auth,API: On app mount / refresh

    Auth->>Browser: Read token from localStorage
    Auth->>API: GET /auth/me
    API-->>Auth: { user }
    Auth-->>User: Set user state

    Note over Auth,API: If token expired / invalid

    API-->>Auth: 401 Unauthorized
    Auth->>Browser: Clear localStorage tokens
    Auth-->>User: Redirect to /login

    Note over Auth,API: If account revoked

    API-->>Auth: 423 Locked
    Auth-->>User: Redirect to /access-revoked
```

---

## Role-Based Access Control

```mermaid
graph TD
    subgraph Roles["Three Role Tiers"]
        SA[Super Admin]
        AD[Admin]
        ST[Student]
    end

    subgraph MasterPerms["Super Admin Permissions"]
        M1[Create / Revoke Admins]
        M2[Create / Revoke Users]
        M3[View All Students]
        M4[View All Admins]
        M5[Manage API Keys]
        M6[AI Usage Dashboard]
    end

    subgraph AdminPerms["Admin Permissions"]
        A1[Create Assessments]
        A2[View Analytics]
        A3[Manage Questions]
        A4[View Student Results]
        A5[Extend Attempt Timers]
    end

    subgraph StudentPerms["Student Permissions"]
        S1[Take Interviews]
        S2[Take Aptitude Tests]
        S3[View Reports]
        S4[Download PDFs]
    end

    SA --> MasterPerms
    AD --> AdminPerms
    ST --> StudentPerms
```

---

## Tech Stack

| Category | Technology |
|---|---|
| **Framework** | React 18 |
| **Build Tool** | Vite 5 |
| **Styling** | Tailwind CSS 3 |
| **Routing** | React Router 7 |
| **Charts** | Recharts 2 |
| **Icons** | Lucide React |
| **State Management** | React Context (Auth + Toast) |
| **HTTP Client** | Native fetch |

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- Backend server running

### Installation

```bash
git clone <repo-url>
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

The app starts at **http://localhost:5173**.

### Production Build

```bash
npm run build
npm run preview
```

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | Yes | `http://localhost:8000` | Backend API base URL |
| `VITE_API_KEY` | No | — | Optional API secret key |

The Vite dev server proxies `/api` requests to the configured backend URL.

---

## Pages by Role

### Authentication

| Route | Purpose |
|---|---|
| `/` | Role-based redirect or login |
| `/login` | Email + password sign in |
| `/signup` | Registration with auto role assignment |
| `/forgot-password` | Request reset email |
| `/reset-password` | Reset with token |
| `/access-revoked` | Account on hold notice |

### Student

| Route | Purpose |
|---|---|
| `/dashboard` | Overview with stats and topic performance |
| `/interview` | Full AI mock interview flow |
| `/aptitude` | Browse and take assessments |
| `/aptitude/:id/start` | Timed MCQ test interface |
| `/aptitude/results` | Assessment results list |
| `/aptitude/results/:id` | Per-question result detail |
| `/report` | Interview report viewer with charts |
| `/reports` | Combined reports and results |

### Admin

| Route | Purpose |
|---|---|
| `/admin-dashboard` | Overview with stats and quick actions |
| `/admin/assessments` | List and manage assessments |
| `/admin/assessments/create` | AI-powered question generation |
| `/admin/assessments/:id/questions` | Review and edit questions |
| `/admin/assessments/:id/results` | Student attempt monitoring |
| `/admin/analytics/aptitude` | Per-student aptitude analytics |
| `/admin/analytics/interviews` | Interview report analytics |

### Master Admin

| Route | Purpose |
|---|---|
| `/master-admin-dashboard` | Platform overview and usage stats |
| `/master-admin/students` | View all students with admin filter |
| `/master-admin/admins` | View all admin accounts |
| `/master-admin/master-admins` | View super admin accounts |
| `/master-admin/create-admin` | Create admins with module access |
| `/master-admin/create-user` | Create users with admin assignment |
| `/master-admin/ai-usage` | AI usage stats + API key management |

---

## Feature Deep Dive

### Mock AI Interview

```mermaid
sequenceDiagram
    actor Student
    participant Frontend
    participant Backend
    participant Groq as Groq AI

    Student->>Frontend: Select Domain & Role
    Student->>Frontend: Upload Resume (PDF)
    Frontend->>Backend: POST /api/start
    Backend->>Groq: Analyze Resume (ATS)
    Groq-->>Backend: ATS Score + Skills
    Backend->>Groq: Generate First Question
    Groq-->>Backend: Question
    Backend-->>Frontend: ATS Score + Q1
    Frontend-->>Student: Display Question

    Student->>Frontend: Record Answer (Mic + Camera)
    Frontend->>Backend: POST /api/answer_video
    Backend->>Groq: Transcribe (Whisper)
    Groq-->>Backend: Transcript
    Backend->>Groq: Evaluate Answer
    Groq-->>Backend: 5 Metrics + Feedback
    Backend->>Groq: Generate Next Question
    Groq-->>Backend: Next Question
    Backend-->>Frontend: Evaluation + Q2
    Frontend-->>Student: Feedback + Next Question

    Note over Student,Frontend: Repeat for 10 questions

    Student->>Frontend: End Interview
    Frontend->>Backend: POST /api/end
    Backend->>Groq: Generate Overall Report
    Groq-->>Backend: Report
    Backend-->>Frontend: Full Report
    Frontend-->>Student: Charts + PDF Download
```

### Aptitude Assessments

```mermaid
sequenceDiagram
    actor Student
    participant Frontend
    participant Backend

    Student->>Frontend: Browse Assessments
    Frontend->>Backend: GET /api/student/assessments
    Backend-->>Frontend: Published Assessments
    Frontend-->>Student: Assessment List

    Student->>Frontend: Start Assessment
    Frontend->>Backend: POST /api/student/assessments/:id/start
    Backend-->>Frontend: Questions + Timer
    Frontend-->>Student: MCQ Interface

    Student->>Frontend: Answer Questions
    Frontend->>Backend: PUT /api/student/attempts/:id/answers
    Backend-->>Frontend: Saved

    Student->>Frontend: Submit
    Frontend->>Backend: POST /api/student/attempts/:id/submit
    Backend-->>Frontend: Score + Results
    Frontend-->>Student: Result Summary
```

### Admin Assessment Creation

```mermaid
sequenceDiagram
    actor Admin
    participant Frontend
    participant Backend
    participant AI as AI Provider

    Admin->>Frontend: Configure Assessment
    Admin->>Frontend: Upload Source File (optional)
    Frontend->>Backend: POST /api/admin/assessments/generate
    Backend->>AI: Generate Questions (batch)
    AI-->>Backend: Questions
    Backend-->>Frontend: Assessment + Questions
    Frontend-->>Admin: Review Questions

    Admin->>Frontend: Edit / Approve Questions
    Frontend->>Backend: PUT /api/admin/assessments/:id/questions
    Backend-->>Frontend: Updated

    Admin->>Frontend: Publish
    Frontend->>Backend: PATCH /api/admin/assessments/:id/status
    Backend-->>Frontend: Published
```

### User & Access Management

```mermaid
flowchart LR
    subgraph Creation["User Creation"]
        direction LR
        CA[Create Admin Form] --> BA[POST /api/master/admins]
        CU[Create User Form] --> BU[POST /api/master/users/create-with-details]
        CI[CSV/Excel Import] --> BI[POST /api/master/admins/import]
    end

    subgraph DB[(MongoDB Users)]
        direction LR
        MA[Master Admin]
        AD[Admin]
        ST[Student]
    end

    subgraph Actions["Management Actions"]
        direction LR
        RV[Revoke Access]
        RS[Restore Access]
        DL[Delete User]
        RO[Change Role]
    end

    Creation --> DB
    DB --> Actions
    Actions --> DB
```

---

## Components

### Shared Components

| Component | Purpose |
|---|---|
| `Sidebar` | Role-filtered navigation sidebar |
| `VoiceRecorder` | Mic/video recording with waveform |

### Portal Components

| Component | Purpose |
|---|---|
| `Sidebar` | Portal-styled student/admin sidebar |
| `RoleGuard` | Role-based route protection |
| `Timer` | Countdown with expiry callback |
| `StatCard` | Color-coded statistics card |
| `AssessmentCard` | Assessment display card |
| `QuestionList` | Editable question list |
| `QuestionEditorCard` | Individual question editor |
| `ResultSummary` | Score and pass/fail summary |
| `ManualGenerationForm` | AI assessment generation form |
| `LoadingSkeleton` | Animated loading placeholder |

---

## Project Structure

```
frontend/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── components/
│   ├── Sidebar.jsx
│   └── VoiceRecorder.jsx
├── lib/
│   └── api.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── constants.js
    ├── globals.css
    ├── navigation.jsx
    ├── portal/
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── ToastContext.jsx
    │   ├── utils/
    │   │   └── api.js
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   ├── RoleGuard.jsx
    │   │   ├── Timer.jsx
    │   │   ├── AssessmentCard.jsx
    │   │   ├── StatCard.jsx
    │   │   ├── QuestionList.jsx
    │   │   ├── QuestionEditorCard.jsx
    │   │   ├── ManualGenerationForm.jsx
    │   │   ├── ResultSummary.jsx
    │   │   └── LoadingSkeleton.jsx
    │   └── pages/
    │       ├── Login.jsx
    │       ├── Signup.jsx
    │       ├── ForgotPassword.jsx
    │       ├── ResetPassword.jsx
    │       ├── student/
    │       └── admin/
    └── pages/
        ├── DashboardPage.jsx
        ├── InterviewPage.jsx
        ├── AptitudePage.jsx
        ├── ReportPage.jsx
        ├── ReportsResultsPage.jsx
        ├── AccessRevoked.jsx
        ├── aptitude/
        └── admin/
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |

---

## License

MIT
