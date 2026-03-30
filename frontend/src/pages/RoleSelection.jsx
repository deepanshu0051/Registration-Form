import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaUserShield } from 'react-icons/fa';

const RoleSelection = () => {
    const navigate = useNavigate();

    return (
        <div className="form-box" style={{ textAlign: 'center' }}>
            <h2>Select Your Role</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '50px', marginTop: '40px', marginBottom: '20px' }}>
                <div 
                    onClick={() => navigate('/student/login')}
                    style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                    <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#2563eb', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '50px', boxShadow: '0 10px 15px rgba(37, 99, 235, 0.3)', transition: 'transform 0.2s' }}
                         onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                         onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                        <FaUserGraduate />
                    </div>
                    <h3 style={{ marginTop: '20px', color: '#1e3a8a' }}>Student</h3>
                </div>

                <div 
                    onClick={() => navigate('/admin/login')}
                    style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                    <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#1e3a8a', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '50px', boxShadow: '0 10px 15px rgba(30, 58, 138, 0.3)', transition: 'transform 0.2s' }}
                         onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                         onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                        <FaUserShield />
                    </div>
                    <h3 style={{ marginTop: '20px', color: '#1e3a8a' }}>Admin</h3>
                </div>
            </div>
        </div>
    );
};

export default RoleSelection;
