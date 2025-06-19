import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/admin/home.jsx";
import KhoaVienPage from "./pages/admin/khoavien.jsx";
import ClassPage from "./pages/admin/class.jsx";
import StudentPage from "./pages/admin/student.jsx";
import SubjectPage from "./pages/admin/subject.jsx";
import TeacherPage from "./pages/admin/teacher.jsx";
import LoginPage from "./pages/login.jsx";
import { AuthWarner } from "./components/context/auth.context.jsx";
import AdminRoute from "./components/routes/AdminRoute.jsx";

// Thêm các component tạm thời nếu chưa có
const ErrorPage = () => <div>404 Not Found</div>;
const RegisterPage = () => <div>Register Page</div>;

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/khoavien",
        element: (
          <AdminRoute>
            <KhoaVienPage />
          </AdminRoute>
        ),
      },
      {
        path: "/class",
        element: (
          <AdminRoute>
            <ClassPage />
          </AdminRoute>
        ),
      },
      {
        path: "/student",
        element: (
          <AdminRoute>
            <StudentPage />
          </AdminRoute>
        ),
      },
      {
        path: "/subject",
        element: (
          <AdminRoute>
            <SubjectPage />
          </AdminRoute>
        ),
      },
      {
        path: "/teacher",
        element: (
          <AdminRoute>
            <TeacherPage />
          </AdminRoute>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <AuthWarner>
    <RouterProvider router={router} />
  </AuthWarner>
  // </React.StrictMode>
);
