import React from 'react';

const StudentPreviewModal = ({ data, onConfirm, onEdit, loading }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ position: 'relative' }}>
                <button 
                    onClick={onEdit} 
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}
                >
                    &times;
                </button>
                <h3 style={{ textAlign: "center", color: '#1e3a8a', marginTop: 0 }}>Preview Student Details</h3>
                <div style={{ lineHeight: '1.6', fontSize: '14px', marginBottom: '15px' }}>
                    <p><b>Name:</b> {data.name}</p>
                    <p><b>Phone:</b> {data.phone}</p>
                    <p><b>Email:</b> {data.email}</p>
                    <p><b>City:</b> {data.city}</p>
                    <p><b>Course:</b> {data.course}</p>
                    <p><b>Year:</b> {data.year}</p>
                </div>

                <div className="btn-row">
                    <button type="button" className="btn-primary" onClick={onConfirm} disabled={loading}>
                        {loading ? 'Confirming...' : 'Confirm'}
                    </button>
                    <button type="button" className="btn-secondary" onClick={onEdit} disabled={loading}>
                        Edit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentPreviewModal;
