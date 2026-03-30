import React from 'react';
import { Outlet } from 'react-router-dom';

const FormLayout = () => {
    return (
        <div style={{ 
            minHeight: '100vh', 
            overflowY: 'auto',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px 0'
        }}>
            <Outlet />
        </div>
    );
};

export default FormLayout;
