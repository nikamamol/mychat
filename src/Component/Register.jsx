import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; // Import axios
import './Chat.css';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors

        try {
            const response = await axios.post('https://mychatbackend-di7n.onrender.com/register', {
                username,
                password,
            });

            console.log('Register successful:', response.data);
            navigate('/'); // Redirect to login on success
        } catch (err) {
            console.error('Error during registration:', err);
            if (err.response) {
                // Server responded with an error (e.g., 400, 500)
                setError(err.response.data.message || 'Registration failed');
            } else {
                // Network error or other issues
                setError('Something went wrong. Please try again.');
            }
        }
    };

    return (
        <div className="auth-wrapper">
            <h1 className="auth-title">Register for ChatSphere</h1>
            <form onSubmit={handleRegister} className="auth-form">
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
                <button type="submit" className="auth-button">Register</button>
            </form>
            <p className="auth-link">
                Already have an account? <Link to="/">Login</Link>
            </p>
        </div>
    );
}

export default Register;