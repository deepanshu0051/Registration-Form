import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../services/api';
import { getPasswordStrength } from '../utils/validationUtils';

const AdminForgotPasswordModal = ({ onClose }) => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/admin/verify-email', { email });
            if (res.data.success) {
                toast.success("Email verified. Proceed to reset password.");
                setToken(res.data.token); // In a real app this is sent via email, but here we capture it directly for demo purposes
                setStep(2);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error verifying email');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        const passRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
        if (!passRegex.test(password)) {
            toast.error("Password must be at least 8 chars, 1 number, and 1 special char");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/admin/reset-password', { email, token, newPassword: password });
            if (res.data.success) {
                toast.success(res.data.message);
                onClose();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error resetting password');
        } finally {
            setLoading(false);
        }
    };

    const strength = getPasswordStrength(password);
    const confirmStrength = getPasswordStrength(confirmPassword);

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ position: 'relative', maxWidth: '400px' }}>
                <button 
                    onClick={onClose} 
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}
                >
                    &times;
                </button>
                <h3 style={{ textAlign: 'center', color: '#1e3a8a', marginTop: 0 }}>Reset Admin Password</h3>
                
                {step === 1 ? (
                    <form onSubmit={handleVerifyEmail}>
                        <div style={{ marginBottom: '15px' }}>
                            <input 
                                type="email" 
                                placeholder="Enter Admin Email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div className="btn-row" style={{ marginTop: '20px' }}>
                            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify Email'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleReset}>
                        <div className="password-container" style={{ position: 'relative' }}>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="New Password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                            />
                            <span 
                                className="password-toggle" 
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '10px', top: '10px', cursor: 'pointer', color: '#6b7280' }}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                            <div style={{ height: '3px', width: '100%', backgroundColor: '#eee', marginTop: '5px', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: strength.width, backgroundColor: strength.color, transition: 'width 0.3s ease, background-color 0.3s ease' }}></div>
                            </div>
                            <span style={{ fontSize: '12px', color: strength.color, marginTop: '2px', display: 'block' }}>
                                {password.length > 0 && strength.width === '33%' && "Weak (Need 8 chars, 1 num, 1 special)"}
                                {password.length > 0 && strength.width === '66%' && "Medium"}
                                {password.length > 0 && strength.width === '100%' && "Strong"}
                            </span>
                        </div>

                        <div className="password-container" style={{ marginTop: '15px', position: 'relative' }}>
                            <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                placeholder="Confirm New Password" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                required 
                                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                            />
                            <span 
                                className="password-toggle" 
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{ position: 'absolute', right: '10px', top: '10px', cursor: 'pointer', color: '#6b7280' }}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>

                        <div className="btn-row" style={{ marginTop: '20px' }}>
                            <button type="button" className="btn-secondary" onClick={() => setStep(1)} disabled={loading}>Back</button>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Resetting...' : 'Reset'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AdminForgotPasswordModal;
