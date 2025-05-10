// components/LoginPage.jsx
import React, { useState } from 'react';
import { mockUsers } from '../data/mockUsers';

const LoginPage = ({ onLogin }) => {
    const [selectedUserId, setSelectedUserId] = useState(null);

    const handleLogin = () => {
        const user = mockUsers.find(u => u.id === parseInt(selectedUserId));
        if (user) onLogin(user);
    };

    return (
        <div className="login-container">
            <h2>Select User to Log In</h2>
            <select onChange={(e) => setSelectedUserId(e.target.value)} defaultValue="">
                <option value="" disabled>Select a user</option>
                {mockUsers.map(user => (
                    <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                    </option>
                ))}
            </select>
            <button onClick={handleLogin} disabled={!selectedUserId}>Login</button>
        </div>
    );
};

export default LoginPage;
