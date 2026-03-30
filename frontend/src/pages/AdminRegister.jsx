import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../services/api';
import { getPasswordStrength } from '../utils/validationUtils';

const AdminRegister = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '', adminSecret: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords do not match");
        }

        const passRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
        if (!passRegex.test(formData.password)) {
            return toast.error("Password must be at least 8 chars, 1 number, and 1 special char");
        }

        setLoading(true);
        try {
            const res = await api.post('/admin/register', formData);
            if (res.data.success) {
                toast.success(res.data.message);
                navigate('/admin/login');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-box">
            <h2>Admin Registration</h2>
            <form onSubmit={handleRegister} autoComplete="off">
                <input type="text" id="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
                <input type="email" id="email" placeholder="E-mail" value={formData.email} onChange={handleChange} required />
                
                <div className="password-container">
                    <input type={showPassword ? "text" : "password"} id="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                    <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                    <div style={{ height: '3px', width: '100%', backgroundColor: '#eee', marginTop: '5px', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: getPasswordStrength(formData.password).width, backgroundColor: getPasswordStrength(formData.password).color, transition: 'width 0.3s ease, background-color 0.3s ease' }}></div>
                    </div>
                </div>

                <div className="password-container">
                    <input type={showPassword ? "text" : "password"} id="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
                </div>

                <input type="password" id="adminSecret" placeholder="Admin Secret Token" value={formData.adminSecret} onChange={handleChange} required />

                <div className="btn-row">
                    <button type="button" className="btn-secondary" onClick={() => navigate('/')}>
                        Back to Roles
                    </button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </div>
                
                <p style={{ textAlign: "center", marginTop: "15px" }}>
                    Already have an account? <Link to="/admin/login" style={{ color: "#2563eb", fontWeight: "600", textDecoration: "none" }}>Login</Link>
                </p>
            </form>
        </div>
    );
};

export default AdminRegister;
