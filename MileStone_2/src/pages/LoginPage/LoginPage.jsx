import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { mockUsers } from "../../DummyData/mockUsers";
import styles from "./LoginPage.module.css";

const LoginPage = ({ onLogin }) => {
    const [role, setRole] = useState("student");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    console.log("Current role:", role); // Add this debug line

    const handleLogin = () => {
        const user = mockUsers.find(
            (u) => u.username === username && u.password === password && u.role === role
        );
        if (user) {
            onLogin(user);
            navigate("/");
        } else {
            alert("Invalid credentials");
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
                    <div className={styles.roleSelector}>
                        {["student", "faculty", "company", "scad"].map((r) => (
                            <button
                                key={r}
                                className={`${styles.roleButton} ${role === r ? styles.activeRole : styles.inactiveRole}`}
                                onClick={() => setRole(r)}
                            >
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Username</label>
                        <input
                            className={styles.input}
                            type="text"
                            placeholder={`Enter ${role} username`}
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
                        <div className={styles.forgotPassword}>
                            <a href="#" className={styles.forgotPasswordLink}>Forgot password?</a>
                        </div>
                    </div>
                    <button
                        className={styles.submitButton}
                        onClick={handleLogin}
                    >
                        Sign In
                    </button>

                    {role === "company" && (
                        <Link to="/register-company" className={styles.registerLink}>
                            <button className={styles.registerButton}>
                                Register Company
                            </button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;