import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../services/api';
import { setToken, setUser } from '../utils/tokenUtils';
import AdminForgotPasswordModal from '../modals/AdminForgotPasswordModal';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/admin/login', { email, password });
            if (res.data.success) {
                toast.success(res.data.message);
                setToken(res.data.token);
                setUser(res.data.user);
                navigate('/admin/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-box">
            <h2>Admin Login</h2>
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

                <div style={{ textAlign: "right", marginTop: "5px", marginBottom: "15px" }}>
                    <span style={{ color: "#2563eb", cursor: "pointer", fontSize: "14px", fontWeight: "600" }} onClick={() => setShowForgotModal(true)}>Forgot Password?</span>
                </div>

                <div className="btn-row">
                    <button type="button" className="btn-secondary" onClick={() => navigate('/')}>
                        Back to Roles
                    </button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </div>
                
                <p style={{ textAlign: "center", marginTop: "15px" }}>
                    Don't have an admin account? <Link to="/admin/register" style={{ color: "#2563eb", fontWeight: "600", textDecoration: "none" }}>Register</Link>
                </p>
            </form>
            
            {showForgotModal && <AdminForgotPasswordModal onClose={() => setShowForgotModal(false)} />}
        </div>
    );
};

export default AdminLogin;
