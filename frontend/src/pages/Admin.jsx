import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPen, FaTrash, FaEye, FaSave, FaTimes } from 'react-icons/fa';
import api from '../services/api';
import { removeToken, removeUser } from '../utils/tokenUtils';
import StudentPreviewModal from '../modals/StudentPreviewModal';
import './Admin.css';

const allowedCities = [
"Noida",
"Delhi",
"New Delhi",
"Ghaziabad",
"Gautam Buddha Nagar",
"South Delhi",
"North West Delhi",
"Mumbai",
"Jaipur",
"Lucknow",
"Indore",
"Amritsar",
"Varanasi",
"Surat",
"Bangalore",
"Bengaluru",
"Srinagar",
"Hyderabad",
"Bhopal",
"Agra"
];

const Admin = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [viewStudent, setViewStudent] = useState(null);

    const fetchStudents = async () => {
        try {
            const res = await api.get('/students');
            if (res.data.success) {
                setStudents(res.data.students);
            }
        } catch (error) {
            toast.error("Failed to load students");
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleLogout = () => {
        removeToken();
        removeUser();
        toast.success("Logged out successfully");
        navigate('/register');
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this student?")) return;
        try {
            const res = await api.delete(`/students/${id}`);
            if (res.data.success) {
                toast.success(res.data.message);
                fetchStudents();
            }
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const handleEditClick = (student) => {
        setEditingId(student.id);
        setEditData({
            name: student.name,
            email: student.email,
            city: student.city,
            username: student.username
        });
    };

    const handleSave = async (id) => {
        const { name, email, city, username } = editData;
        
        if (!/^[A-Za-z ]{4,}$/.test(name)) return toast.error("Name must contain only letters & min 4 chars");
        if (!/^[a-z0-9._%+-]+@gmail\.com$/.test(email)) return toast.error("Only valid Gmail address allowed");
        if (!city) return toast.error("Please select a city");
        if (!/^[A-Za-z0-9]{4,}$/.test(username) || username.includes("@")) return toast.error("Username must be letters & numbers only (no @)");

        try {
            const res = await api.put(`/students/${id}`, { name, email, city, username });
            if (res.data.success) {
                toast.success(res.data.message);
                setEditingId(null);
                fetchStudents();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Update failed");
        }
    };

    const filteredStudents = students.filter(s => {
        const q = searchQuery.toLowerCase();
        return (s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.username?.toLowerCase().includes(q));
    });

    return (
        <div className="admin-body">
            <div className="top-bar">
                <button className="btn-primary" style={{ marginRight: '10px', padding: '8px 16px', borderRadius: '6px' }} onClick={() => navigate('/register')}>+ Add Student</button>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
            
            <h1 className="admin-h1">Student Admin Panel</h1>
            
            <div className="search-box">
                <input 
                    type="text" 
                    placeholder="Search by name, email or username..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            
            <table className="admin-table">
                <thead className="admin-thead">
                    <tr>
                        <th className="admin-th">S.No</th>
                        <th className="admin-th">Name</th>
                        <th className="admin-th">Email</th>
                        <th className="admin-th">City</th>
                        <th className="admin-th">Username</th>
                        <th className="admin-th">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredStudents.map((stu, index) => (
                        <tr key={stu.id} className="admin-tbody-tr">
                            <td className="admin-td">{index + 1}</td>
                            {editingId === stu.id ? (
                                <>
                                    <td className="admin-td"><input className="admin-input" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} /></td>
                                    <td className="admin-td"><input className="admin-input" type="email" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} /></td>
                                    <td className="admin-td">
                                        <select
                                             className="admin-select"
                                             value={editData.city || ""}
                                             onChange={e => setEditData({...editData, city: e.target.value})} >
                                             <option value="">Select City</option>  { }
                                             {editData.city && !allowedCities.includes(editData.city) && (
                                               <option value={editData.city}>{editData.city}</option>
                                             )}

                                             {allowedCities.map(c => (
                                               <option key={c} value={c}>{c}</option>
                                             ))}
                                        </select>
                                    </td>
                                    <td className="admin-td"><input className="admin-input" value={editData.username} onChange={e => setEditData({...editData, username: e.target.value})} /></td>
                                    <td className="admin-td">
                                        <button className="action-btn" onClick={() => handleSave(stu.id)} title="Save"><FaSave style={{color: '#2563eb'}}/></button>
                                        <button className="action-btn delete" onClick={() => setEditingId(null)} title="Cancel"><FaTimes /></button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td className="admin-td">{stu.name}</td>
                                    <td className="admin-td">{stu.email}</td>
                                    <td className="admin-td">{stu.city}</td>
                                    <td className="admin-td">{stu.username}</td>
                                    <td className="admin-td">
                                        <button className="action-btn view" onClick={() => setViewStudent(stu)} title="View"><FaEye /></button>
                                        <button className="action-btn" onClick={() => handleEditClick(stu)} title="Edit"><FaPen /></button>
                                        <button className="action-btn delete" onClick={() => handleDelete(stu.id)} title="Delete"><FaTrash /></button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            {viewStudent && (
                <StudentPreviewModal 
                    data={viewStudent}
                    onConfirm={() => setViewStudent(null)}
                    onEdit={() => {
                        setViewStudent(null);
                        handleEditClick(viewStudent);
                    }}
                    loading={false}
                />
            )}
        </div>
    );
};

export default Admin;
