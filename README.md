# MaxEdu — CRM for Education Centers

A full-featured CRM system built for education centers to manage teachers, students, groups, lessons, and homework — all in one platform.

🔗 **Live Demo:** *(add after deployment)*
📁 **GitHub:** [github.com/Mohirjon013/MaxEdu](https://github.com/Mohirjon013/MaxEdu)

---

## ✨ Features

### 🔐 Authentication
- JWT-based login with token stored in `localStorage`
- Protected routes — unauthenticated users redirected to `/login`
- Public routes — authenticated users bypassed back to `/dashboard`

### 📊 Dashboard
- Stats overview: active students, groups, payments, debtors, archived
- Accordion sections: monthly payments, annual profit, lesson schedule

### 👨‍🏫 Teacher Management
- View, add, edit, delete teachers
- Full CRUD via REST API

### 👥 Group Management
- List all groups with status, schedule, and teacher info
- Create, edit, archive, and delete groups
- Filter and search groups (with debounced input)
- Per-group detail page with tabs: students, lessons, homework

### 📚 Lesson & Homework Flow
- View lessons by date inside a group
- Create homework for a group
- View homework details and student submissions
- Check and grade individual student homework results

### 👨‍🎓 Student Management
- List all students
- View per-student data

### 🏫 Management Section
- Course management (add / edit / delete)
- Room management (add / edit / delete)

### 🎨 Theme
- Light / dark mode toggle via MUI `ThemeProvider`
- Persistent toggle in the top navigation bar

### 🎁 Gifts Page
- Dedicated gifts/rewards section for students

---

## 🛠️ Tech Stack

| Technology | Usage |
|---|---|
| React 19 | UI framework |
| React Router v7 | Client-side routing, nested routes |
| Material UI (MUI) v9 | Component library + theming |
| Axios | HTTP client with request interceptors |
| Context API | Modal state (`UserContext`) and theme (`ThemeContext`) |
| Vite 8 | Build tool |
| Tailwind CSS v4 | Utility styling |
| Vercel | Deployment |

---

## 💡 Technical Highlights

- **JWT Auth** with Axios interceptors — token automatically attached to every outbound request
- **Protected & Public Routes** — token-based navigation guards (`ProtectRoute`, `PublicRoute`)
- **Dark / Light mode** — `ThemeContext` wraps the app with MUI's `createTheme`, togglable from the navbar
- **Lazy loading** — `Dashboard`, `ManagementCourse`, and `ManagementRoom` loaded on demand via `React.lazy + Suspense`
- **Custom `useDebounce` hook** — prevents excessive API calls on search input
- **Nested routing** — deep URL structure, e.g. `/dashboard/groups/:id/homework/:hwId/result/:studentId`
- **REST API integration** — full CRUD across all entities
- **Reusable modals** — `DeleteConfirmModal` and `ErrorModal` shared across the app
- **URL-based tab state** — active tab stored in search params for shareable links

---

## 🚀 Getting Started

```bash
git clone https://github.com/Mohirjon013/MaxEdu.git
cd MaxEdu
npm install
npm run dev
```

> **Backend API:** `https://najot-edu.softwareengineer.uz/api/v1`
> **Auth:** Bearer token via the login endpoint

---

## 📁 Project Structure

```
MaxEdu/
├── src/
│   ├── api/
│   │   └── axios.js              # Axios instance + request interceptors
│   ├── components/
│   │   ├── ProtectRoute.jsx      # Auth guard (token check)
│   │   ├── PublicRoute.jsx       # Public-only guard
│   │   ├── HomeworkCreate.jsx
│   │   ├── HomeworkCheck.jsx
│   │   ├── HomeworkDetail.jsx
│   │   ├── LessonDetail.jsx
│   │   ├── GroupLessons.jsx
│   │   ├── SingleGroups.jsx
│   │   ├── ManagementCourse.jsx
│   │   ├── ManagementRoom.jsx
│   │   ├── DeleteConfirmModal.jsx
│   │   ├── ErrorModal.jsx
│   │   └── Loader.jsx
│   ├── context/
│   │   ├── UserContext.jsx       # Modal open/close state
│   │   └── ThemeContext.jsx      # MUI dark/light theme
│   ├── hook/
│   │   └── useDebounce.jsx       # Debounce utility for search
│   ├── layouts/
│   │   └── MainLayout.jsx        # Sidebar + topbar shell
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Groups.jsx
│   │   ├── Teacher.jsx
│   │   ├── Student.jsx
│   │   ├── Login.jsx
│   │   └── Gifs.jsx
│   └── router.jsx
```

---

## 👤 Author

**Mohirjon To'ychiboyev**
- GitHub: [@Mohirjon013](https://github.com/Mohirjon013)
- LinkedIn: [linkedin.com/in/mohirjon-to-ychiboyev-ba05353a2](https://www.linkedin.com/in/mohirjon-to-ychiboyev-ba05353a2)
- Telegram: [t.me/mohirjonProjects](https://t.me/mohirjonProjects)
