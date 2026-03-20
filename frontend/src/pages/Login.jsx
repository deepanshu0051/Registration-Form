import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../services/api';
import { setToken, setUser } from '../utils/tokenUtils';
import ForgotPasswordModal from '../modals/ForgotPasswordModal';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleForgotPasswordClick = async () => {
        if (!email) {
            toast.error("Please enter your email first");
            return;
        }
        try {
            const res = await api.post('/auth/verify-email', { email });
            if (res.data.success) {
                setShowModal(true);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "User does not exist");
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            if (res.data.success) {
                toast.success(res.data.message);
                setToken(res.data.token);
                setUser(res.data.user);
                sessionStorage.removeItem('tempAccess');
                navigate('/admin');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-box">
            <h2>Student Login</h2>
            <form onSubmit={handleLogin} autoComplete="off">
                <input 
                    type="email" 
                    placeholder="E-mail" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                />
                <div className="password-container">
                    <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        required 
                    />
                    <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                </div>
                
                <div style={{ textAlign: "right", marginTop: "5px" }}>
                    <span 
                        style={{ color: "#2563eb", cursor: "pointer", fontSize: "12px", fontWeight: "600" }} 
                        onClick={handleForgotPasswordClick}
                    >
                        Forgot Password?
                    </span>
                </div>

                <div className="btn-row">
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </div>
                
                <p style={{ textAlign: "center", marginTop: "15px" }}>
                    Don't have an account? <Link to="/register" style={{ color: "#2563eb", fontWeight: "600", textDecoration: "none" }}>Register</Link>
                </p>
            </form>

            {showModal && <ForgotPasswordModal email={email} onClose={() => setShowModal(false)} />}
        </div>
    );
};

export default Login;
