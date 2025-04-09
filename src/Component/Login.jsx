import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Chat.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('https://mychatbackend-7.onrender.com/login', {
                username,
                password,
            });

            console.log('Login successful:', response.data);
            localStorage.setItem('username', response.data.username); // Store username
            navigate('/chat');
        } catch (err) {
            console.error('Error during login:', err);
            if (err.response) {
                setError(err.response.data.message || 'Login failed');
            } else {
                setError('Something went wrong. Please try again.');
            }
        }
    };

    return (
        <div className="auth-wrapper">
            <h1 className="auth-title">Login to ChatSphere</h1>
            <form onSubmit={handleLogin} className="auth-form">
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="auth-input"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="auth-input"
                />
                {error && <p className="error-message">{error}</p>}
                <button type="submit" className="auth-button">Login</button>
            </form>
            <p className="auth-link">
                Don't have an account? <Link to="/register">Register</Link>
            </p>
        </div>
    );
}

export default Login;