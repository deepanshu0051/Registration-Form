import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../services/api';
import { getPasswordStrength } from '../utils/validationUtils';

const ForgotPasswordModal = ({ email, onClose }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleReset = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/auth/reset-password', { email, password, confirmPassword });
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
            <div className="modal-content" style={{ position: 'relative' }}>
                <button 
                    onClick={onClose} 
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}
                >
                    &times;
                </button>
                <h3 style={{ textAlign: 'center', color: '#1e3a8a', marginTop: 0 }}>Reset Password</h3>
                <form onSubmit={handleReset}>
                    <div className="password-container">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="New Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                        <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                        <div style={{ height: '3px', width: '100%', backgroundColor: '#eee', marginTop: '2px', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: strength.width, backgroundColor: strength.color, transition: 'width 0.3s ease, background-color 0.3s ease' }}></div>
                        </div>
                    </div>

                    <div className="password-container" style={{ marginTop: '15px' }}>
                        <input 
                            type={showConfirmPassword ? "text" : "password"} 
                            placeholder="Confirm New Password" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required 
                        />
                        <span className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                        <div style={{ height: '3px', width: '100%', backgroundColor: '#eee', marginTop: '2px', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: confirmStrength.width, backgroundColor: confirmStrength.color, transition: 'width 0.3s ease, background-color 0.3s ease' }}></div>
                        </div>
                    </div>

                    <div className="btn-row" style={{ marginTop: '20px' }}>
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
