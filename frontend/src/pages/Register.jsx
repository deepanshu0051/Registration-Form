import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../services/api';
import StudentPreviewModal from '../modals/StudentPreviewModal';
import { getPasswordStrength } from '../utils/validationUtils';


const courseDurationMap = {
    BCA: 3, MCA: 2, BSc: 3, MSc: 2, BCom: 3, MCom: 2, BA: 3, MA: 2,
    BBA: 3, MBA: 2, BTech: 4, MTech: 2, BPharma: 4, MPharma: 2,
    LLB: 3, LLM: 2, BEd: 2, MEd: 2, MBBS: 5, BDS: 5, BHM: 3,
    'B.Arch': 5, BPT: 4, BFA: 4, BJMC: 3, BMS: 3, BMM: 3
};

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', phone: '', email: '',
        city: '', course: '', year: '',
        password: '', confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [showPreview, setShowPreview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const validateField = (name, value) => {
        let error = "";
        switch (name) {
            case 'name':
                if (!/^[A-Za-z ]+$/.test(value) || value.length < 4) error = "Only alphabets allowed & minimum 4 letters required";
                break;
            case 'email':
                if (!/^[a-z0-9._%+-]+@gmail\.com$/.test(value)) error = "Enter valid E-mail Address";
                break;
            case 'city':
                if (!/^[A-Za-z ]+$/.test(value)) error = "Only alphabets allowed";
                break;
            case 'confirmPassword':
                if (value !== formData.password) error = "Password doesn't match";
                break;
            default:
                break;
        }
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        let newValue = value;

        if (id === 'phone') {
            // Only allow + and digits
            let cleanValue = value.replace(/[^+0-9]/g, '');

            // Auto-add + at start
            if (cleanValue.length > 0 && !cleanValue.startsWith('+')) {
                cleanValue = '+' + cleanValue;
            }

            // Keep + only at position 0
            const plusCount = (cleanValue.match(/\+/g) || []).length;
            if (plusCount > 1) {
                cleanValue = '+' + cleanValue.replace(/\+/g, '');
            }

            // Max 13 chars
            cleanValue = cleanValue.slice(0, 13);
            newValue = cleanValue;

            // Validate format
            const isValid = /^\+[0-9]{1,12}$/.test(cleanValue);
            setErrors(prev => ({
                ...prev,
                phone: cleanValue.length > 1 && !isValid
                    ? 'Phone number must start with + ISD code'
                    : ''
            }));
        } else if (id === 'course') {
            setFormData(prev => ({ ...prev, [id]: newValue, year: '' }));
            return;
        } else {
            validateField(id, newValue);
        }

        setFormData(prev => ({ ...prev, [id]: newValue }));
    };

    const handlePreview = () => {
        setSubmitted(true);
        const hasErrors = Object.values(errors).some(err => err !== "");
        const hasEmpties = Object.values(formData).some(val => val === "");

        if (hasEmpties) {
            toast.error("All fields are required");
            return;
        }
        if (hasErrors) {
            toast.error("Please fill all fields correctly.");
            return;
        }
        setShowPreview(true);
    };

    const confirmRegistration = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const res = await api.post('/students/register', formData);
            console.log(res.data);

            // Clear old cached student data as explicitly requested
            localStorage.removeItem("student_data");

            // Save token and user to localStorage
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            localStorage.setItem("student_id", res.data.student_id);

            navigate(`/student/dashboard/${res.data.student_id}`);

        } catch (error) {
            console.log("ERROR", error.response?.data);
            toast.error(error.response?.data?.message || "Registration Failed");
        } finally {
            setLoading(false);
        }
    };

    const strength = getPasswordStrength(formData.password);

    return (
        <div className="form-box">
            <h2>Student Registration Form</h2>
            <form autoComplete="off">
                {Object.keys(formData).map(key => {
                    if (key === 'course') {
                        const years = formData.course ? courseDurationMap[formData.course] : 0;
                        return (
                            <div key={key} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <select id="course" value={formData.course} onChange={handleChange} className={submitted && !formData.course ? "invalid" : (formData.course ? "valid" : "")} style={{ flex: 1 }} required>
                                    <option value="" disabled>Select Course</option>
                                    {Object.keys(courseDurationMap).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <select id="year" value={formData.year} onChange={handleChange} className={submitted && !formData.year ? "invalid" : (formData.year ? "valid" : "")} style={{ flex: 1 }} required>
                                    <option value="" disabled>Select Year</option>
                                    {Array.from({ length: years }, (_, i) => {
                                        const y = i + 1;
                                        const label = y === 1 ? '1st' : y === 2 ? '2nd' : y === 3 ? '3rd' : `${y}th`;
                                        return <option key={y} value={`${label} Year`}>{label} Year</option>;
                                    })}
                                </select>
                            </div>
                        );
                    }

                    if (key === 'year') return null; // Rendered alongside course

                    let type = "text";
                    let placeholder = key.charAt(0).toUpperCase() + key.slice(1);
                    if (key === 'email') type = "email";
                    if (key === 'password' || key === 'confirmPassword') type = "password";
                    if (key === 'confirmPassword') placeholder = "Confirm Password";
                    if (key === 'phone') placeholder = "Mobile Number (+ISD)";
                    let currentType = type;
                    if (type === "password") {
                        currentType = showPassword ? "text" : "password";
                    }

                    return (
                        <div key={key} className={type === "password" ? "password-container" : ""}>
                            <input
                                type={currentType}
                                id={key}
                                placeholder={placeholder}
                                value={formData[key]}
                                onChange={handleChange}
                                className={errors[key] ? "invalid" : (submitted && !formData[key] ? "invalid" : (formData[key] ? "valid" : ""))}
                                required
                                autoComplete="new-password"
                            />
                            {type === "password" && (
                                <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            )}
                            {key === 'password' && (
                                <div style={{ height: '3px', width: '100%', backgroundColor: '#eee', marginTop: '2px', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: strength.width, backgroundColor: strength.color, transition: 'width 0.3s ease, background-color 0.3s ease' }}>
                                    </div>
                                </div>
                            )}
                            <small style={{ color: "red" }}>{errors[key]}</small>
                        </div>
                    );
                })}

                <div className="btn-row">
                    <button type="button" className="btn-secondary" onClick={handlePreview}>Preview</button>
                    <button type="button" className="btn-primary" onClick={handlePreview}>Submit</button>
                </div>

                <div style={{ textAlign: "center", marginTop: "10px" }}>
                    <button type="button" className="btn-outline" style={{ width: '50%', borderRadius: '20px', padding: '8px' }}
                        onClick={() => navigate('/')}>
                        Back to Roles
                    </button>
                </div>

                <p style={{ textAlign: "center", marginTop: "15px" }}>
                    Already have an account? <Link to="/student/login" style={{ color: "#2563eb", fontWeight: "600", textDecoration: "none" }}>Login</Link>
                </p>
            </form>

            {showPreview && (
                <StudentPreviewModal
                    data={formData}
                    onConfirm={confirmRegistration}
                    onEdit={() => setShowPreview(false)}
                    loading={loading}
                />
            )}
        </div>
    );
};

export default Register;
