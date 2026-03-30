import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getToken } from "./utils/tokenUtils";

import RoleSelection from "./pages/RoleSelection";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import AdminRegister from "./pages/AdminRegister";
import AdminLogin from "./pages/AdminLogin";
import StudentDashboard from "./pages/StudentDashboard";

import AuthLayout from "./layouts/AuthLayout";
import FormLayout from "./layouts/FormLayout";
import DashboardLayout from "./layouts/DashboardLayout";

const PrivateRoute = ({ children }) => {
    const hasAccess = getToken();
    return hasAccess ? children : <Navigate to="/" replace />;
};

const App = () => {
    return (
        <Router>
            <ToastContainer position="top-right" autoClose={3000} />
            <Routes>
                {/* Auth Layout for fixed centered pages */}
                <Route element={<AuthLayout />}>
                    <Route path="/" element={<RoleSelection />} />
                    <Route path="/student/login" element={<Login />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                </Route>

                {/* Form Layout for scrollable registration pages */}
                <Route element={<FormLayout />}>
                    <Route path="/student/register" element={<Register />} />
                    <Route path="/admin/register" element={<AdminRegister />} />
                </Route>

                {/* Dashboard Layout for scrollable dashboards */}
                <Route element={<DashboardLayout />}>
                    <Route path="/student/dashboard" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
                    <Route path="/student/dashboard/:id" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
                    <Route path="/admin/dashboard" element={<PrivateRoute><Admin /></PrivateRoute>} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

export default App;
