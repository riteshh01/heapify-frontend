# Heapify - SE Interview Prep Platform | Folder Structure

## Architecture Overview

This is an **industry-level, hybrid folder structure** optimized for:
- ✅ **Next.js 15+ (App Router)**
- ✅ **TypeScript** for type safety
- ✅ **Feature-based organization** with internal layers (Components, Hooks, Services, Types)
- ✅ **REST API** with custom hooks
- ✅ **Context API** for state management
- ✅ **Scalability** - easy to add new learning paths or features
- ✅ **Separation of Concerns** - business logic, UI, data fetching isolated

---

## Folder Structure

```
frontend/
├── src/
│   ├── app/                                    # Next.js App Router
│   │   ├── (auth)/                             # Route Group: Authentication pages (private routes)
│   │   │   ├── layout.tsx                      # Auth layout wrapper
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   ├── email-verify/
│   │   │   │   └── page.tsx
│   │   │   └── forgot-password/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/                        # Route Group: Private dashboard routes
│   │   │   ├── layout.tsx                      # Dashboard layout (Navbar + Sidebar)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx                    # Main dashboard/home
│   │   │   │
│   │   │   ├── learning/                       # Learning paths group
│   │   │   │   ├── dsa/                        # DSA Learning Path
│   │   │   │   │   ├── page.tsx                # DSA overview/list topics
│   │   │   │   │   ├── [topicId]/
│   │   │   │   │   │   └── page.tsx            # DSA topic detail + problems
│   │   │   │   │   └── [topicId]/[problemId]/
│   │   │   │   │       └── page.tsx            # Problem solving page
│   │   │   │   │
│   │   │   │   ├── system-design/             # System Design Learning Path
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── [designId]/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── [designId]/[caseStudyId]/
│   │   │   │   │       └── page.tsx
│   │   │   │   │
│   │   │   │   ├── dbms/                      # Database Management Systems
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── [conceptId]/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── [conceptId]/[quizId]/
│   │   │   │   │       └── page.tsx
│   │   │   │   │
│   │   │   │   ├── os/                        # Operating Systems
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [topicId]/
│   │   │   │   │       └── page.tsx
│   │   │   │   │
│   │   │   │   ├── networks/                  # Computer Networks
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [topicId]/
│   │   │   │   │       └── page.tsx
│   │   │   │   │
│   │   │   │   └── oops/                      # OOPS/DSA Advanced
│   │   │   │       ├── page.tsx
│   │   │   │       └── [conceptId]/
│   │   │   │           └── page.tsx
│   │   │   │
│   │   │   ├── assessments/
│   │   │   │   ├── page.tsx                    # Available quizzes/tests
│   │   │   │   ├── [assessmentId]/
│   │   │   │   │   └── page.tsx                # Take quiz/assessment
│   │   │   │   └── [assessmentId]/results/
│   │   │   │       └── page.tsx                # Quiz results
│   │   │   │
│   │   │   ├── progress/
│   │   │   │   └── page.tsx                    # Progress dashboard
│   │   │   │
│   │   │   ├── bookmarks/
│   │   │   │   └── page.tsx                    # Saved problems/resources
│   │   │   │
│   │   │   └── settings/
│   │   │       └── page.tsx                    # User settings/preferences
│   │   │
│   │   ├── globals.css                         # Global styles
│   │   ├── layout.tsx                          # Root layout
│   │   └── page.tsx                            # Landing page (public)
│   │
│   ├── features/                               # 🎯 Feature modules (hybrid: feature + internal layers)
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── SignupForm.tsx
│   │   │   │   └── PasswordInput.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useLogin.ts
│   │   │   │   ├── useSignup.ts
│   │   │   │   └── useAuthContext.ts
│   │   │   ├── services/
│   │   │   │   └── authService.ts             # API calls: login, signup, verify, etc.
│   │   │   ├── types/
│   │   │   │   └── index.ts                    # Auth-related types (User, Session, etc.)
│   │   │   └── index.ts                        # Barrel export
│   │   │
│   │   ├── learning/
│   │   │   ├── components/
│   │   │   │   ├── TopicCard.tsx
│   │   │   │   ├── ProblemList.tsx
│   │   │   │   ├── CodeEditor.tsx             # For problem solving
│   │   │   │   ├── ProblemDetail.tsx
│   │   │   │   ├── LearningPathCard.tsx
│   │   │   │   └── ProgressBar.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useFetchTopics.ts
│   │   │   │   ├── useFetchProblem.ts
│   │   │   │   ├── useSubmitSolution.ts
│   │   │   │   └── useLearningProgress.ts
│   │   │   ├── services/
│   │   │   │   └── learningService.ts         # Fetch topics, problems, submit solutions
│   │   │   ├── types/
│   │   │   │   └── index.ts                    # Topic, Problem, Solution types
│   │   │   └── index.ts
│   │   │
│   │   ├── assessments/
│   │   │   ├── components/
│   │   │   │   ├── QuizContainer.tsx
│   │   │   │   ├── QuestionCard.tsx
│   │   │   │   ├── AnswerOptions.tsx
│   │   │   │   └── ResultsDisplay.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useFetchQuiz.ts
│   │   │   │   ├── useQuizState.ts            # Manage quiz progress/answers
│   │   │   │   └── useSubmitAssessment.ts
│   │   │   ├── services/
│   │   │   │   └── assessmentService.ts
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── progress/
│   │   │   ├── components/
│   │   │   │   ├── ProgressChart.tsx
│   │   │   │   ├── SkillBadges.tsx
│   │   │   │   ├── MilestoneTracker.tsx
│   │   │   │   └── StatsCard.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useFetchProgress.ts
│   │   │   │   └── useUserStats.ts
│   │   │   ├── services/
│   │   │   │   └── progressService.ts
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── user/
│   │   │   ├── components/
│   │   │   │   ├── UserProfile.tsx
│   │   │   │   ├── UserSettings.tsx
│   │   │   │   └── PreferencesForm.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useUserProfile.ts
│   │   │   │   └── useUpdatePreferences.ts
│   │   │   ├── services/
│   │   │   │   └── userService.ts
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   └── admin/
│   │       ├── components/
│   │       │   ├── CourseEditor.tsx
│   │       │   ├── ContentManager.tsx
│   │       │   └── Analytics.tsx
│   │       ├── hooks/
│   │       │   ├── useFetchContent.ts
│   │       │   └── useCreateCourse.ts
│   │       ├── services/
│   │       │   └── adminService.ts
│   │       ├── types/
│   │       │   └── index.ts
│   │       └── index.ts
│   │
│   ├── components/                            # 🔧 Shared/Reusable components (NOT specific to features)
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── LayoutWrapper.tsx
│   │   ├── ui/                                # UI primitives (buttons, cards, modals, etc.)
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   └── Tabs.tsx
│   │   ├── forms/
│   │   │   ├── FormField.tsx
│   │   │   ├── FormError.tsx
│   │   │   └── FormSubmitButton.tsx
│   │   ├── loading/
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── LoadingOverlay.tsx
│   │   └── common/
│   │       ├── ErrorBoundary.tsx
│   │       ├── EmptyState.tsx
│   │       └── PageHeader.tsx
│   │
│   ├── context/                               # Context API for global state
│   │   ├── AuthContext.tsx                    # User auth state
│   │   ├── ThemeContext.tsx                   # Dark/Light theme
│   │   ├── UserPreferencesContext.tsx         # User settings
│   │   └── NotificationContext.tsx            # Toast/notification management
│   │
│   ├── hooks/                                 # 🪝 Global reusable hooks
│   │   ├── useAuth.ts
│   │   ├── useTheme.ts
│   │   ├── useApiCall.ts                      # Generic API hook for data fetching
│   │   ├── useLocalStorage.ts
│   │   └── useDebounce.ts
│   │
│   ├── services/                              # 🌐 API layer (centralized HTTP client)
│   │   ├── api.ts                             # Axios/Fetch setup with interceptors
│   │   ├── apiClient.ts                       # Base API methods
│   │   └── endpoints.ts                       # API endpoint constants
│   │
│   ├── utils/                                 # 🛠️ Utility functions
│   │   ├── formatters.ts                      # Date, time, number formatting
│   │   ├── validators.ts                      # Input validation
│   │   ├── constants.ts                       # App-wide constants
│   │   ├── logger.ts                          # Logging utility
│   │   └── helpers.ts                         # General helper functions
│   │
│   ├── types/                                 # 📝 Global TypeScript types
│   │   ├── index.ts
│   │   ├── common.ts                          # Common types (API responses, errors, etc.)
│   │   └── models.ts                          # Domain models (User, Course, Problem, etc.)
│   │
│   └── styles/                                # 🎨 Global stylesheets (if needed)
│       ├── variables.css
│       └── animations.css
│
├── public/                                    # Static assets
│   ├── images/
│   │   ├── logos/
│   │   └── illustrations/
│   ├── icons/
│   └── favicon.ico
│
├── .env.local                                 # Environment variables (local)
├── .env.example                               # Example env file
├── .gitignore
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── package.json
└── README.md
```

---

## Key Principles

### 1. **Hybrid Organization**
- **Features** are organized by business domain (auth, learning, assessments, progress, user, admin)
- **Each feature** contains its own: Components, Hooks, Services, Types
- **Shared components** (UI, layout) go in the main `components/` folder
- **Shared utilities** go in `utils/`, `hooks/`, `services/`, `types/`

### 2. **Folder Naming Conventions**
- **Features**: lowercase, e.g., `auth`, `learning`, `assessments`
- **Components**: PascalCase, e.g., `LoginForm.tsx`, `QuizContainer.tsx`
- **Hooks**: camelCase with `use` prefix, e.g., `useLogin.ts`, `useFetchTopics.ts`
- **Services**: camelCase, e.g., `authService.ts`, `learningService.ts`
- **Types**: PascalCase or lowercase, e.g., `index.ts`, `common.ts`
- **Pages** (in app router): lowercase, e.g., `dashboard`, `dsa`, `[topicId]`

### 3. **Data Flow Pattern**
```
Page (app/) 
  ↓
Feature Components + Hooks
  ↓
Services (API calls)
  ↓
Context (global state)
  ↓
Utils (helpers)
```

### 4. **Feature Structure Example (Auth)**
```
features/auth/
├── components/        # UI Components (LoginForm, SignupForm)
├── hooks/             # Custom hooks (useLogin, useSignup)
├── services/          # API calls (authService.ts)
├── types/             # TypeScript interfaces (User, Session)
└── index.ts           # Barrel export for clean imports
```

Import: `import { LoginForm, useLogin } from '@/features/auth'`

### 5. **Scalability Strategy**
- **New Learning Path?** → Create `learning/[pathName]` in app router + add feature folder
- **New Quiz Feature?** → Create `features/quizzes/` with full internal structure
- **New Admin Panel?** → Extend `features/admin/`
- **New Shared Component?** → Add to `components/` folder

---

## Benefits of This Structure

✅ **Scalability** - Easy to add new learning paths, features, or modules  
✅ **Maintainability** - Related code is colocated (components, hooks, services together)  
✅ **Type Safety** - TypeScript throughout with centralized type definitions  
✅ **Code Reusability** - Shared components and utilities prevent duplication  
✅ **Testing** - Services can be easily mocked, components tested independently  
✅ **Performance** - Code splitting by feature, lazy loading routes  
✅ **Developer Experience** - Clear folder structure, easy onboarding for new developers  

---

## Next Steps

1. Create all folders as per this structure
2. Set up the API client (`services/api.ts`)
3. Create authentication context and guards
4. Set up base layout components (Navbar, Sidebar)
5. Create reusable UI components
6. Build auth flow first, then core features
