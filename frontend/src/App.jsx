import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getToken } from "./utils/tokenUtils";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";

const PrivateRoute = ({ children }) => {
    const hasAccess = getToken();
    return hasAccess ? children : <Navigate to="/register" replace />;
};

const PublicRoute = ({ children }) => {
    const hasAccess = getToken();
    return hasAccess ? <Navigate to="/admin" replace /> : children;
};

const App = () => {
    return (
        <Router>
            <ToastContainer position="top-right" autoClose={3000} />
            <Routes>
                <Route path="/" element={<Navigate to="/register" replace />} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
                <Route path="*" element={<Navigate to="/register" replace />} />
            </Routes>
        </Router>
    );
};

export default App;
