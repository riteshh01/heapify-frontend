# Heapify - SE Interview Prep Frontend

A scalable, industry-level frontend for **Heapify**, a comprehensive learning management system for preparing software engineering interviews.

## 🎯 Project Overview

**Heapify** is an LMS platform designed to help aspiring engineers prepare for FAANG interviews across:

- **Data Structures & Algorithms (DSA)** - 190+ problems
- **System Design** - Architecture patterns and case studies
- **Database Management Systems (DBMS)** - SQL, NoSQL, indexing
- **Operating Systems (OS)** - Processes, threads, memory management
- **Computer Networks** - OSI model, TCP/IP, protocols
- **OOPS & Design Patterns** - Concepts and real-world applications

---

## 🏗️ Architecture

### **Hybrid Organization: Features + Layers**

This project uses a **hybrid folder structure** combining feature-based and layer-based patterns for maximum scalability and maintainability.

See [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md) for comprehensive architecture documentation.

---

## 📁 Folder Structure at a Glance

```
src/
├── app/                  # Next.js App Router
├── features/            # Business logic features (auth, learning, assessments, etc.)
├── components/          # Shared reusable components (UI, layout, forms)
├── context/             # React Context for global state
├── hooks/               # Custom React hooks
├── services/            # API layer
├── utils/               # Utility functions
├── types/               # TypeScript definitions
└── styles/              # Global stylesheets
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- TypeScript knowledge

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### Running Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** Context API + React Hooks
- **HTTP:** Fetch API with custom wrapper
- **Package Manager:** npm/yarn

---

## 📚 Learning Paths

The platform supports 6 major learning paths:

1. **DSA** - Data Structures & Algorithms (190+ problems)
2. **System Design** - Distributed systems architecture
3. **DBMS** - Database concepts and optimization
4. **OS** - Operating Systems fundamentals
5. **Networks** - Computer Networks protocols
6. **OOPS** - Object-Oriented Design Patterns

Each path includes:
- ✅ Structured topics with explanations
- ✅ 500+ curated problems
- ✅ Interactive code editor
- ✅ Quizzes and assessments
- ✅ Progress tracking

---

## 🔄 Data Flow

```
Component (Page/UI)
    ↓
Custom Hook (useApiCall, useFetch)
    ↓
Feature Service (authService, learningService)
    ↓
API Layer (services/api.ts)
    ↓
Backend API
    ↓
Context/State Management
    ↓
Component Re-render
```

---

## 🔐 Authentication

1. Users sign up/log in via auth pages
2. Backend returns JWT token and user data
3. `AuthContext` stores session in localStorage
4. Token included in all API requests
5. Protected routes check authentication status

---

## 📦 Key Features

### ✅ Implemented
- ✅ Folder structure and setup
- ✅ TypeScript types and models
- ✅ API client with error handling
- ✅ Context providers (Auth, Theme)
- ✅ Reusable UI components
- ✅ Layout components (Navbar, Sidebar)
- ✅ Page stubs for all routes
- ✅ Custom hooks (useApiCall, useMutation)

### 🔄 In Progress
- 🔄 Authentication flows
- 🔄 API integration
- 🔄 Learning path components
- 🔄 Assessment system
- 🔄 Progress tracking

### 📋 TODO
- 📋 Unit tests
- 📋 E2E tests
- 📋 Performance optimization
- 📋 SEO optimization
- 📋 Analytics integration
- 📋 Deployment configuration

---

## 🎨 Component Hierarchy

```
Root Layout
├── AuthProvider
├── ThemeProvider
├── Landing Page (Public)
└── App Router
    ├── (auth)
    │   ├── Login
    │   ├── Signup
    │   ├── Email Verify
    │   └── Forgot Password
    └── (dashboard)
        ├── Navbar + Sidebar Layout
        ├── Dashboard
        ├── Learning Paths
        │   ├── DSA
        │   ├── System Design
        │   ├── DBMS
        │   ├── OS
        │   ├── Networks
        │   └── OOPS
        ├── Assessments
        ├── Progress
        ├── Bookmarks
        └── Settings
```

---

## 📝 Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Features | lowercase | `auth`, `learning` |
| Components | PascalCase | `LoginForm.tsx` |
| Hooks | `use` prefix | `useLogin.ts` |
| Services | camelCase | `authService.ts` |
| Constants | UPPER_SNAKE_CASE | `AUTH_ENDPOINTS` |
| Types | PascalCase | `User.ts` |
| Pages | lowercase | `login`, `dashboard` |

---

## 🔗 Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_AUTH_TOKEN_KEY=authToken
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

---

## 📖 Usage Examples

### Fetching Data

```tsx
import { useApiCall } from '@/hooks/useApiCall'
import type { Topic } from '@/types'

export function TopicList() {
  const { data: topics, isLoading, error } = useApiCall<Topic[]>(
    '/learning/topics/dsa'
  )

  if (isLoading) return <Skeleton />
  if (error) return <ErrorMessage error={error} />

  return <div>{/* Render topics */}</div>
}
```

### Mutations

```tsx
import { usePost } from '@/hooks/useApiCall'
import { AUTH_ENDPOINTS } from '@/services/endpoints'

export function LoginForm() {
  const [login, { isLoading, error }] = usePost<LoginRequest, AuthSession>(
    AUTH_ENDPOINTS.LOGIN
  )

  const handleSubmit = async (email: string, password: string) => {
    try {
      const session = await login({ email, password })
      // Handle success
    } catch (err) {
      // Handle error
    }
  }
}
```

### Using Auth Context

```tsx
import { useAuthContext } from '@/context/AuthContext'

export function UserMenu() {
  const { user, logout } = useAuthContext()

  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

---

## 🚀 Useful Commands

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Build for production
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler

# Formatting
npm run format       # Format with Prettier
```

---

## 🤝 Contributing

1. Create a branch: `git checkout -b feature/your-feature`
2. Follow folder structure conventions
3. Use TypeScript for type safety
4. Create barrel exports for clean imports
5. Commit clearly: `git commit -m "feat: add new component"`

---

## 📚 Documentation

- **Architecture:** See [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md)
- **Next.js:** https://nextjs.org/docs
- **TypeScript:** https://www.typescriptlang.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs

---

## 🎉 Ready to Build!

Your scalable, industry-level frontend structure is ready. Next steps:

1. ✅ Implement authentication feature
2. ✅ Set up API integration with backend
3. ✅ Build learning path components
4. ✅ Create assessment/quiz system
5. ✅ Deploy to production

Happy coding! 🚀
