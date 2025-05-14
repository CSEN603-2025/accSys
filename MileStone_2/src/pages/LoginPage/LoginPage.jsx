import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { mockUsers } from "../../DummyData/mockUsers";
import styles from "./LoginPage.module.css";

const LoginPage = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const handleLogin = () => {
        // Find user matching the credentials without filtering by role
        const user = mockUsers.find(
            (u) => u.username === username && u.password === password
        );

        if (user) {
            // User found - login with detected role
            onLogin(user);
            navigate("/");
        } else {
            // Show error message
            setErrorMessage("Invalid username or password");
            setTimeout(() => setErrorMessage(""), 3000); // Clear error after 3 seconds
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
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Sign In</h1>
                    <p className={styles.subtitle}>
                        Access the internship management portal
                    </p>
                </div>
                <div className={styles.body}>
                    {errorMessage && (
                        <div style={{
                            backgroundColor: "#fee2e2",
                            color: "#991b1b",
                            padding: "8px 12px",
                            borderRadius: "4px",
                            marginBottom: "16px",
                            textAlign: "center"
                        }}>
                            {errorMessage}
                        </div>
                    )}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Username</label>
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Password</label>
                        <input
                            className={styles.input}
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        className={styles.submitButton}
                        onClick={handleLogin}
                    >
                        Sign In
                    </button>

                    {/* Add "New Company?" label */}
                    <div style={{
                        textAlign: 'center',
                        margin: '16px 0 8px',
                        color: '#4b5563',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}>
                        New Company?
                    </div>

                    <Link to="/register-company" className={styles.registerLink}>
                        <button className={styles.registerButton}>
                            Register Company
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;