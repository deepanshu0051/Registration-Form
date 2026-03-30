import React from 'react';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
    return (
        <div style={{ 
            minHeight: '100vh', 
            overflowY: 'auto',
            width: '100vw'
        }}>
            <Outlet />
        </div>
    );
};

export default DashboardLayout;
