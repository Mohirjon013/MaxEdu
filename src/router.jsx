import React, { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import ProtectRoute from "./components/ProtectRoute";
import PublicRoute from "./components/PublicRoute";
import { Login, Teacher, Groups, SingleGroups, Student, Gifs } from "./pages/index";

// Lazy loading
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ManagementCourse = lazy(() => import("./components/ManagementCourse"));
const ManagementRoom = lazy(() => import("./components/ManagementRoom"));
import HomeworkCreate from "./components/HomeworkCreate";
import LessonDetail from "./components/LessonDetail";
import HomeworkDetail from "./components/HomeworkDetail";
import HomeworkCheck from "./components/HomeworkCheck";
import Loader from "./components/Loader";

const router = createBrowserRouter([
  {
    // Asosiy sahifa: agar token bo'lmasa /login, bo'lsa /dashboard
    path: "/",
    element: (
      <PublicRoute>
        <Navigate to="/login" replace />
      </PublicRoute>
    ),
  },
  {
    // Login sahifasi: token bo'lsa /dashboard ga o'tadi, bo'lmasa login ko'rsatadi
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    // Himoyalangan sahifalar: token bo'lmasa /login ga qaytaradi
    element: (
      <ProtectRoute>
        <MainLayout />
      </ProtectRoute>
    ),
    children: [
      {
        path: "dashboard",
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<Loader />}>
                <Dashboard />
              </Suspense>
            ),
          },
          {
            path: "teacher", element: <Teacher />
          },
          {
            path: "groups", element: <Groups />
          },
          {
            path: "groups/:id", element: <SingleGroups />
          },
          {
            path: "groups/:id/homework/create", element: <HomeworkCreate />
          },
          {
            path: "groups/:id/lesson/:date", element: <LessonDetail />
          },
          {
            path: "groups/:id/homework/:hwId", element: <HomeworkDetail />
          },
          {
            path: "groups/:id/homework/:hwId/result/:studentId", element: <HomeworkCheck />
          },
          {
            path: "students", element: <Student />
          },
          {
            path: "gifts", element: <Gifs />
          }
        ],
      },
      {
        path: "management",
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<Loader />}>
                <Dashboard />
              </Suspense>
            ),
          },
          {
            path: "course",
            element: (
              <Suspense fallback={<Loader />}>
                <ManagementCourse />
              </Suspense>
            ),
          },
          {
            path: "room",
            element: (
              <Suspense fallback={<Loader />}>
                <ManagementRoom />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
]);

export default router;
