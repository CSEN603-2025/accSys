import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './RegisterCompany.module.css';
import { X, CheckCircle } from 'lucide-react'; // Import icons

const RegisterCompany = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        companyName: '',
        industry: '',
        companySize: '',
        companyEmail: '',
        username: '',
        password: '',
        confirmPassword: '',
    });

    const [logo, setLogo] = useState(null);
    const [documents, setDocuments] = useState(null);
    const [errors, setErrors] = useState({});
    const [showSuccessPopup, setShowSuccessPopup] = useState(false); // New state for success popup

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (name === 'logo') {
            setLogo(files[0]);
        } else if (name === 'documents') {
            setDocuments(files[0]);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Company name validation
        if (!formData.companyName.trim()) {
            newErrors.companyName = 'Company name is required';
        }

        // Industry validation
        if (!formData.industry) {
            newErrors.industry = 'Please select an industry';
        }

        // Company size validation
        if (!formData.companySize) {
            newErrors.companySize = 'Please select company size';
        }

        // Email validation
        if (!formData.companyEmail) {
            newErrors.companyEmail = 'Company email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.companyEmail)) {
            newErrors.companyEmail = 'Email is invalid';
        }

        // Logo validation
        if (!logo) {
            newErrors.logo = 'Company logo is required';
        }

        // Documents validation
        if (!documents) {
            newErrors.documents = 'Official documents are required';
        }

        // Username validation
        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        // Confirm password validation
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length === 0) {
            // Here you would typically send the data to your backend
            console.log('Form submitted successfully', { ...formData, logo, documents });

            // Show success popup
            setShowSuccessPopup(true);

            // Remove the auto-redirect timer
        } else {
            setErrors(validationErrors);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.pageHeader}>
                <h1 className={styles.systemTitle}>
                    Internship Management <span>System</span>
                </h1>
                <p className={styles.portalSubtitle}>University Internship Portal</p>
            </div>

            <div className={styles.formContainer}>
                <h2 className={styles.formTitle}>Register Your Company</h2>
                <p className={styles.formSubtitle}>Join our internship program to connect with talented students</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formSection}>
                        <h3 className={styles.sectionTitle}>Company Information</h3>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Company Name*</label>
                            <input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Enter your company's legal name"
                            />
                            {errors.companyName && <span className={styles.error}>{errors.companyName}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Industry*</label>
                            <select
                                name="industry"
                                value={formData.industry}
                                onChange={handleChange}
                                className={styles.select}
                            >
                                <option value="">Select Industry</option>
                                <option value="technology">Information Technology</option>
                                <option value="finance">Finance & Banking</option>
                                <option value="healthcare">Healthcare & Pharmaceuticals</option>
                                <option value="education">Education</option>
                                <option value="manufacturing">Manufacturing</option>
                                <option value="retail">Retail & Consumer Goods</option>
                                <option value="media">Media & Entertainment</option>
                                <option value="telecom">Telecommunications</option>
                                <option value="energy">Energy & Utilities</option>
                                <option value="other">Other</option>
                            </select>
                            {errors.industry && <span className={styles.error}>{errors.industry}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Company Size*</label>
                            <select
                                name="companySize"
                                value={formData.companySize}
                                onChange={handleChange}
                                className={styles.select}
                            >
                                <option value="">Select Company Size</option>
                                <option value="small">Small (50 employees or less)</option>
                                <option value="medium">Medium (51-100 employees)</option>
                                <option value="large">Large (101-500 employees)</option>
                                <option value="corporate">Corporate (more than 500 employees)</option>
                            </select>
                            {errors.companySize && <span className={styles.error}>{errors.companySize}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Official Company Email*</label>
                            <input
                                type="email"
                                name="companyEmail"
                                value={formData.companyEmail}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="e.g., info@yourcompany.com"
                            />
                            {errors.companyEmail && <span className={styles.error}>{errors.companyEmail}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Company Logo*</label>
                            <input
                                type="file"
                                name="logo"
                                onChange={handleFileChange}
                                className={styles.fileInput}
                                accept="image/*"
                            />
                            <p className={styles.fileHelp}>Upload your company logo (PNG, JPG, SVG)</p>
                            {errors.logo && <span className={styles.error}>{errors.logo}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Official Documents*</label>
                            <input
                                type="file"
                                name="documents"
                                onChange={handleFileChange}
                                className={styles.fileInput}
                                accept=".pdf,.doc,.docx"
                            />
                            <p className={styles.fileHelp}>Upload business registration or any official document proving legitimacy (PDF, DOC)</p>
                            {errors.documents && <span className={styles.error}>{errors.documents}</span>}
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <h3 className={styles.sectionTitle}>Account Information</h3>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Username*</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Choose a username for portal access"
                            />
                            {errors.username && <span className={styles.error}>{errors.username}</span>}
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Password*</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="At least 6 characters"
                                />
                                {errors.password && <span className={styles.error}>{errors.password}</span>}
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Confirm Password*</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={styles.input}
                                />
                                {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword}</span>}
                            </div>
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <button type="submit" className={styles.submitButton}>Register Company</button>
                        <Link to="/login" className={styles.backLink}>
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>

            {/* Success Popup */}
            {showSuccessPopup && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '8px',
                        padding: '2rem',
                        width: '90%',
                        maxWidth: '500px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                        position: 'relative',
                        textAlign: 'center'
                    }}>
                        <button
                            onClick={() => {
                                setShowSuccessPopup(false);
                                navigate('/login');
                            }}
                            style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '24px',
                                color: '#64748b',
                                display: 'flex'
                            }}
                        >
                            <X size={24} />
                        </button>

                        <div style={{ marginBottom: '1.5rem', color: '#16a34a', display: 'flex', justifyContent: 'center' }}>
                            <CheckCircle size={60} />
                        </div>

                        <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: '#0b257a',
                            marginBottom: '1rem'
                        }}>
                            Registration Submitted Successfully!
                        </h3>

                        <p style={{
                            fontSize: '1rem',
                            lineHeight: '1.5',
                            color: '#4b5563',
                            marginBottom: '0.75rem'
                        }}>
                            Thank you for registering your company. Your application will be reviewed by our team.
                        </p>

                        <p style={{
                            fontSize: '1rem',
                            lineHeight: '1.5',
                            color: '#4b5563',
                            marginBottom: '1.5rem'
                        }}>
                            You will receive an email notification once your request has been reviewed.
                        </p>

                        <button
                            onClick={() => {
                                setShowSuccessPopup(false);
                                navigate('/login');
                            }}
                            style={{
                                background: '#0b257a',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                padding: '0.75rem 1.5rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                width: '100%'
                            }}
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegisterCompany;