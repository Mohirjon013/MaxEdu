# MaxEdu — CRM for Education Centers

A full-featured CRM system built for education centers to manage teachers, students, groups, lessons, and homework — all in one platform.

🔗 **Live Demo:** [maxedu-crm.vercel.app](https://maxedu-crm.vercel.app)
📁 **GitHub:** [github.com/Mohirjon013/MaxEdu](https://github.com/Mohirjon013/MaxEdu)

---

## Tech Stack

| Technology | Version | Usage |
|---|---|---|
| React | 19 | UI framework |
| React Router | v7 | Client-side routing, nested routes |
| Material UI (MUI) | v9 | Component library + theming |
| Axios | latest | HTTP client with interceptors |
| Context API | — | Global state (auth notifications, theme) |
| Tailwind CSS | v4 | Utility-first styling |
| Vite | 8 | Build tool |
| Vercel | — | Deployment |

---

## Features

### Authentication
- JWT-based login — `accessToken` and `refreshToken` stored in `localStorage`
- Axios **request interceptor** — auto-attaches Bearer token to every outgoing request
- Axios **response interceptor** — on 401, silently attempts token refresh, retries the original request, falls back to logout if refresh fails
- `ProtectRoute` — redirects unauthenticated users to `/login`
- `PublicRoute` — redirects already-authenticated users away from `/login`
- Forgot password flow — 3 steps: send OTP → verify OTP → reset password, with 60s resend countdown

### Role-Based Access
Three roles: `SUPERADMIN`, `TEACHER`, `STUDENT`. Each role gets:
- A different sidebar menu
- Different API endpoints
- Different redirects after login

### Group Management
- List all groups with status, schedule, teacher, and student count
- Create, edit, archive, and delete groups via Drawer form
- Multi-select teachers and students with in-dialog search
- Debounced search input to avoid excessive API calls

### Lesson & Homework Flow
- View lessons by date inside a group
- Create homework assignments for a group
- View homework details and per-student submissions
- Grade individual student homework results

### Teacher & Student Management
- Full CRUD for teachers and students
- Debounced search with `useTransition` for non-blocking UI updates during data fetch

### Management Section
- Course management (add / edit / delete)
- Room management (add / edit / delete)
- Lazy-loaded routes for faster initial bundle

### Theme
- Light / dark mode toggle via MUI `ThemeProvider` + `createTheme`
- Custom color palette: purple primary, adaptive backgrounds and text per mode
- `useMemo` used to avoid recreating the theme object on every render

---

## Technical Highlights

- **Token refresh with retry** — Axios response interceptor catches 401, calls `/auth/refresh-token`, updates `localStorage`, and replays the original failed request. An `isRefreshing` flag prevents duplicate refresh calls.
- **`useTransition`** — used in `Teacher.jsx` and `Student.jsx` to wrap state updates after data fetch, keeping the UI responsive during transitions
- **`startTransition`** — used in `Groups.jsx` for non-urgent search state updates
- **URL-based tab state** — active tab stored in `useSearchParams`, making tabs bookmarkable and refresh-safe
- **`location.state` for data passing** — group data passed through navigation state to skip an extra API call on detail pages
- **`React.lazy + Suspense`** — `Dashboard`, `ManagementCourse`, and `ManagementRoom` are code-split and loaded on demand
- **Custom `useDebounce` hook** — generic debounce with `useEffect` cleanup, used across search inputs
- **Reusable modals** — `DeleteConfirmModal` and `ErrorModal` shared across pages
- **Nested routing** — deep URL structure: `/dashboard/groups/:id/homework/:hwId/result/:studentId`

---

## Project Structure

```
MaxEdu/
├── src/
│   ├── api/
│   │   └── axios.js              # Axios instance, request + response interceptors
│   ├── components/
│   │   ├── ProtectRoute.jsx      # Redirects unauthenticated users
│   │   ├── PublicRoute.jsx       # Redirects authenticated users
│   │   ├── SingleGroups.jsx      # Group detail page (tabs: students, lessons, homework)
│   │   ├── GroupLessons.jsx      # Lesson list inside a group
│   │   ├── LessonDetail.jsx      # Single lesson view
│   │   ├── HomeworkCreate.jsx    # Create homework for a group
│   │   ├── HomeworkDetail.jsx    # Homework + student submissions
│   │   ├── HomeworkCheck.jsx     # Grade individual student result
│   │   ├── StudentLessonAll.jsx  # Student's lessons in a group
│   │   ├── StudentLessonDetail.jsx
│   │   ├── ManagementCourse.jsx  # Course CRUD (lazy loaded)
│   │   ├── ManagementRoom.jsx    # Room CRUD (lazy loaded)
│   │   ├── DeleteConfirmModal.jsx
│   │   ├── ErrorModal.jsx
│   │   └── Loader.jsx
│   ├── context/
│   │   ├── UserContext.jsx       # Global notification state (login success/error)
│   │   └── ThemeContext.jsx      # MUI dark/light theme with useMemo
│   ├── hook/
│   │   └── useDebounce.jsx       # Debounce hook for search inputs
│   ├── layouts/
│   │   └── MainLayout.jsx        # Collapsible sidebar + topbar shell
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx         # Stats overview (SUPERADMIN)
│   │   ├── Groups.jsx            # Group list with full CRUD
│   │   ├── Teacher.jsx           # Teacher list with full CRUD
│   │   ├── Student.jsx           # Student list with full CRUD
│   │   ├── MyGroups.jsx          # Student's enrolled groups
│   │   ├── TeacherMyGroups.jsx   # Teacher's assigned groups
│   │   ├── TeacherProfile.jsx
│   │   └── StudentMain.jsx       # Student dashboard
│   └── router.jsx                # createBrowserRouter, lazy imports, role-based wrappers
```

---

## Getting Started

```bash
git clone https://github.com/Mohirjon013/MaxEdu.git
cd MaxEdu
npm install
npm run dev
```

> **Backend API:** `https://najot-edu.softwareengineer.uz/api/v1`
> **Auth:** Phone number + password → returns `accessToken`, `refreshToken`, `role`

---

## Author

**Mohirjon To'ychiboyev**

- GitHub: [@Mohirjon013](https://github.com/Mohirjon013)
- LinkedIn: [linkedin.com/in/mohirjon-to-ychiboyev-ba05353a2](https://www.linkedin.com/in/mohirjon-to-ychiboyev-ba05353a2)
- Telegram: [t.me/mohirjonProjects](https://t.me/mohirjonProjects)
