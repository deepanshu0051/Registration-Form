import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../services/api';
import StudentPreviewModal from '../modals/StudentPreviewModal';
import { getPasswordStrength } from '../utils/validationUtils';

const isdCountryMap = {
    "+91": "India", "+92": "Pakistan", "+1": "United States", "+44": "United Kingdom",
    "+61": "Australia", "+81": "Japan", "+86": "China", "+7": "Russia", "+49": "Germany",
    "+33": "France", "+971": "UAE", "+880": "Bangladesh", "+94": "Sri Lanka", "+39": "Italy", "+34": "Spain"
};

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', isd: '', email: '', address: '', pincode: '',
        city: '', state: '', country: '', dob: '', username: '',
        password: '', confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [showPreview, setShowPreview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const validateField = (name, value) => {
        let error = "";
        switch (name) {
            case 'name':
                if (!/^[A-Za-z ]+$/.test(value) || value.length < 4) error = "Only alphabets allowed & minimum 4 letters required";
                break;
            case 'email':
                if (!/^[a-z0-9._%+-]+@gmail\.com$/.test(value)) error = "Enter valid E-mail Address";
                break;
            case 'address':
                if (!/^[A-Za-z0-9 ,]+$/.test(value)) error = "Letters, numbers and spaces allowed";
                break;
            case 'city':
            case 'state':
                if (!/^[A-Za-z ]+$/.test(value)) error = "Only alphabets allowed";
                break;
            case 'username':
                if (!/^[A-Za-z0-9]+$/.test(value)) error = "Only letters and numbers allowed";
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

        if (id === 'isd') {
            const cleanValue = value.replace(/[^+0-9]/g, "");
            let matchedISD = null;
            for (let code in isdCountryMap) {
                if (cleanValue.startsWith(code)) {
                    matchedISD = code;
                    break;
                }
            }
            if (matchedISD) {
                const numberPart = cleanValue.slice(matchedISD.length).replace(/[^0-9]/g, "").slice(0, 10);
                newValue = matchedISD + numberPart;
                setFormData(prev => ({ ...prev, country: isdCountryMap[matchedISD] }));
                
                if (numberPart.length < 10) setErrors(prev => ({ ...prev, isd: "Enter 10 digit number after ISD" }));
                else setErrors(prev => ({ ...prev, isd: "" }));
            } else {
                newValue = cleanValue.slice(0, 4);
                setFormData(prev => ({ ...prev, country: "" }));
            }
        } 
        else if (id === 'pincode') {
            newValue = value.replace(/[^0-9]/g, "").slice(0, 6);
            if (newValue.length < 6) {
                setErrors(prev => ({ ...prev, pincode: "Enter 6 digit pincode" }));
            } else if (newValue.length === 6) {
                fetch(`https://api.postalpincode.in/pincode/${newValue}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data[0].Status === "Success") {
                            const po = data[0].PostOffice[data[0].PostOffice.length - 1];
                            setFormData(prev => ({ ...prev, city: po.District, state: po.State, country: po.Country }));
                            setErrors(prev => ({ ...prev, pincode: "" }));
                        } else {
                            setErrors(prev => ({ ...prev, pincode: "Invalid Pincode" }));
                        }
                    }).catch(() => setErrors(prev => ({ ...prev, pincode: "Server Error" })));
            }
        } else {
            validateField(id, newValue);
        }

        setFormData(prev => ({ ...prev, [id]: newValue }));
    };

    const handlePreview = () => {
        const hasErrors = Object.values(errors).some(err => err !== "");
        const hasEmpties = Object.values(formData).some(val => val === "");
        if (hasErrors || hasEmpties) {
            toast.error("Please fill all fields correctly.");
            return;
        }
        setShowPreview(true);
    };

    const confirmRegistration = async () => {
        setLoading(true);
        try {
            const res = await api.post('/students/register', formData);
            if (res.data.success) {
                toast.success(res.data.message);
                setShowPreview(false);
                setToken(res.data.token);
                setUser(res.data.user);
                navigate('/admin');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration Failed");
        } finally {
            setLoading(false);
        }
    };

    const strength = getPasswordStrength(formData.password);

    return (
        <div className="form-box">
            <h2>Student Registration Form</h2>
            <form onSubmit={(e) => { e.preventDefault(); handlePreview(); }} autoComplete="off">
                {Object.keys(formData).map(key => {
                    if (key === 'country') return (
                        <div key={key}>
                            <input type="text" id={key} placeholder="Country" value={formData[key]} readOnly className={formData[key] ? "valid" : ""} />
                        </div>
                    );
                    if (key === 'username') return (
                        <div key={key}>
                            <input type="text" id={key} placeholder="Username" value={formData[key]} onChange={handleChange} className={errors[key] ? "invalid" : (formData[key] ? "valid" : "")} required autoComplete="new-password" />
                            <small style={{ color: "red" }}>{errors[key]}</small>
                        </div>
                    );

                    let type = "text";
                    let placeholder = key.charAt(0).toUpperCase() + key.slice(1);
                    if (key === 'email') type = "email";
                    if (key === 'dob') type = "date";
                    if (key === 'password' || key === 'confirmPassword') type = "password";
                    if (key === 'confirmPassword') placeholder = "Confirm Password";
                    if (key === 'isd') placeholder = "+91";
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
                                className={errors[key] ? "invalid" : (formData[key] ? "valid" : "")} 
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
                                    <div style={{ height: '100%', width: strength.width, backgroundColor: strength.color, transition: 'width 0.3s ease, background-color 0.3s ease' }}></div>
                                </div>
                            )}
                            <small style={{ color: "red" }}>{errors[key]}</small>
                        </div>
                    );
                })}

                <div className="btn-row">
                    <button type="button" className="btn-secondary" onClick={handlePreview}>Preview</button>
                    <button type="submit" className="btn-primary">Submit</button>
                </div>

                <div style={{ textAlign: "center", marginTop: "10px" }}>
                    <button type="button" className="btn-outline" style={{width: '50%', borderRadius:'20px', padding:'8px'}} onClick={() => navigate('/admin')}>
                        Show Table
                    </button>
                </div>
                
                <p style={{ textAlign: "center", marginTop: "15px" }}>
                    Already have an account? <Link to="/login" style={{ color: "#2563eb", fontWeight: "600", textDecoration: "none" }}>Login</Link>
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
