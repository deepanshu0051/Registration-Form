import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
    return (
        <div style={{ 
            height: '100vh', 
            overflow: 'hidden', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '100vw'
        }}>
            <Outlet />
        </div>
    );
};

export default AuthLayout;
