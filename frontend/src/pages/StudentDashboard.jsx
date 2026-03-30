import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { getUser } from '../utils/tokenUtils';

const StudentDashboard = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Check if we are in admin mode via route state (from Admin Panel)
    const isAdminMode = location.state?.isAdmin || false;
    
    // Priority order logically explicitly requested
    const idFromURL = id;
    const idFromStorage = localStorage.getItem("student_id");
    
    // If no ID in URL, we assume logged-in student is viewing their own profile
    const currentUser = getUser();
    const studentId = idFromURL || idFromStorage || currentUser?.id;

    const [studentData, setStudentData] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!studentId) {
            navigate('/');
            return;
        }

        const fetchStudent = async () => {
            try {
                const res = await api.get(`/students/${studentId}`);
                if (res.data.success) {
                    setStudentData(res.data.student);
                    setEditForm(res.data.student);
                }
            } catch (error) {
                toast.error("Failed to load student data");
            } finally {
                setLoading(false);
            }
        };
        fetchStudent();
    }, [studentId, navigate]);

    const handleEditToggle = () => {
        if (!isAdminMode) return;
        setEditMode(!editMode);
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        if (type === 'number') {
            const parsed = parseInt(value, 10);
            setEditForm({ ...editForm, [name]: isNaN(parsed) ? 0 : parsed });
        } else {
            setEditForm({ ...editForm, [name]: value });
        }
    };

    const handleSave = async () => {
        if (!isAdminMode) return;
        
        try {
            // we only allow updating specific fields in admin mode
            const res = await api.put(`/students/${studentId}`, {
                ...studentData, // keep uneditable fields intact to pass validation
                attendance: editForm.attendance,
                total_fees: editForm.total_fees,
                fees_paid: editForm.fees_paid,
                bus_charge: editForm.bus_charge,
                fine: editForm.fine,
            });

            if (res.data.success) {
                toast.success("Student records updated successfully!");
                const newRemaining = Math.max(parseInt(editForm.total_fees || 0, 10) - parseInt(editForm.fees_paid || 0, 10), 0);
                setStudentData({ ...studentData, ...editForm, remaining_fees: newRemaining });
                setEditMode(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update");
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
    if (!studentData) return <div style={{ textAlign: 'center', marginTop: '50px' }}>No Data Found</div>;

    const renderField = (label, name, type = "text", editable = false) => {
        const isEditable = editable && editMode && isAdminMode;
        return (
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '5px' }}>{label}</label>
                {isEditable ? (
                    <input 
                        type={type} 
                        name={name} 
                        value={editForm[name] || ''} 
                        onChange={handleChange} 
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                ) : (
                    <div style={{ padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '5px', border: '1px solid #e5e7eb', minHeight: '20px' }}>
                        {name === 'remaining_fees' && editMode 
                            ? Math.max(parseInt(editForm.total_fees || 0, 10) - parseInt(editForm.fees_paid || 0, 10), 0)
                            : studentData[name] !== null && studentData[name] !== undefined ? studentData[name] : (type === 'number' ? '0' : 'N/A')}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px', fontFamily: '"Inter", sans-serif' }}>
            {/* Header Card */}
            <div style={{ background: 'white', padding: '20px 30px', borderRadius: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '10px' }}>
                <h2 style={{ margin: 0, color: '#1e3a8a', fontSize: '24px', fontWeight: 'bold' }}>{isAdminMode ? "Student Records" : "My Dashboard"}</h2>
                {isAdminMode && !editMode && (
                    <button className="btn-primary" style={{ margin: 0, padding: '10px 20px', borderRadius: '8px' }} onClick={handleEditToggle}>
                        Edit Financials & Academic
                    </button>
                )}
                {isAdminMode && editMode && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn-secondary" style={{ margin: 0, padding: '10px 20px', borderRadius: '8px' }} onClick={handleEditToggle}>Cancel</button>
                        <button className="btn-primary" style={{ margin: 0, padding: '10px 20px', borderRadius: '8px' }} onClick={handleSave}>Save Changes</button>
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
                {/* Profile Card */}
                <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ color: '#2563eb', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginTop: 0, marginBottom: '20px', fontSize: '18px' }}>Profile Information</h3>
                    {renderField("Full Name", "name")}
                    {renderField("Email Address", "email")}
                    {renderField("Phone Number", "phone")}
                    {renderField("City", "city")}
                    {renderField("Course", "course")}
                    {renderField("Year", "year")}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    {/* Academic Card */}
                    <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ color: '#2563eb', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginTop: 0, marginBottom: '20px', fontSize: '18px' }}>Academic Overview</h3>
                        {renderField("Attendance (%)", "attendance", "number", true)}
                    </div>

                    {/* Fees Card */}
                    <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ color: '#2563eb', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginTop: 0, marginBottom: '20px', fontSize: '18px' }}>Financial Details</h3>
                        {renderField("Total Fees", "total_fees", "number", true)}
                        {renderField("Fees Paid", "fees_paid", "number", true)}
                        {renderField("Remaining Fees", "remaining_fees", "number", false)}
                        {renderField("Bus Charge", "bus_charge", "number", true)}
                        {renderField("Fine", "fine", "number", true)}
                    </div>
                </div>
            </div>

            {!isAdminMode && (
                <div style={{ textAlign: "center", marginTop: "40px" }}>
                    <button type="button" className="btn-outline" style={{ width: '200px', borderRadius: '20px', padding: '10px' }}
                            onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('user');
                                navigate('/');
                            }}>
                        Logout
                    </button>
                </div>
            )}
            
            {isAdminMode && (
                <div style={{ textAlign: "center", marginTop: "40px" }}>
                    <button type="button" className="btn-secondary" style={{ width: '250px', borderRadius: '20px', padding: '10px' }}
                            onClick={() => navigate('/admin/dashboard')}>
                        Back to Admin Panel
                    </button>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
