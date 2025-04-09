import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './Chat.css';

const socket = io('https://mychatbackend-7.onrender.com');

function Chat() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [username, setUsername] = useState(localStorage.getItem('username'));
    const navigate = useNavigate();

    useEffect(() => {
        if (!username) {
            return;
        }
console.log(setUsername)
        socket.emit('setUsername', username);

        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') console.log('Notification permission granted');
            });
        }

        socket.on('loadMessages', (loadedMessages) => {
            console.log('Loaded Messages:', loadedMessages); // Debug log
            setMessages(loadedMessages);
        });

        socket.on('message', (msg) => {
            console.log('New Message:', msg); // Debug log
            setMessages((prev) => [...prev, msg]);
            if (document.hidden) {
                showNotification(msg);
            }
        });

        return () => {
            socket.off('loadMessages');
            socket.off('message');
        };
    }, [username]);

    const showNotification = (message) => {
        if (Notification.permission === 'granted') {
            const time = message.timestamp
                ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Unknown Time';
            new Notification('New Message', {
                body: `${message.username}: ${message.content} (${time})`,
                icon: 'https://via.placeholder.com/50',
            });
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) {
            return 'Unknown Time'; // Fallback if timestamp is missing
        }

        const messageDate = new Date(timestamp);
        if (isNaN(messageDate.getTime())) {
            return 'Invalid Time'; // Fallback if timestamp is invalid
        }

        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const timeString = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (messageDate.toDateString() === today.toDateString()) {
            return `Today ${timeString}`;
        } else if (messageDate.toDateString() === yesterday.toDateString()) {
            return `Yesterday ${timeString}`;
        }
        return timeString;
    };

    const sendMessage = () => {
        if (message.trim()) {
            socket.emit('sendMessage', message);
            setMessage('');
        }
    };

    if (!username) {
        return (
            <div className="chat-wrapper">
                <h1 className="chat-title">ChatSphere</h1>
                <p className="error-message">
                    You are not authenticated. Please{' '}
                    <span onClick={() => navigate('/')} style={{ color: 'blue', cursor: 'pointer' }}>
                        login
                    </span>{' '}
                    to continue.
                </p>
            </div>
        );
    }

    return (
        <div className="chat-wrapper">
            <h1 className="chat-title">ChatSphere</h1>
            <div className="chat-box">
                {messages.map((msg, index) => (
                    <div key={index} className="message">
                        <p style={{fontSize:"10px", marginBottom:"10px", background:"#A0C878",color:"black", padding:"5px", borderRadius:"10px",width:"80%",marginLeft:"-10px"}}>{msg.username || 'Anonymous'}</p> 
                        <p>{msg.content || 'No content'}{' '}</p>
                  
                        <p style={{ color: 'black', fontSize: '10px', marginTop:"10px", justifyContent:"end",display:"flex" }}>
                            ({formatTimestamp(msg.timestamp)})
                        </p>
                    </div>
                ))}
            </div>
            <div className="input-container">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="message-input"
                />
                <button onClick={sendMessage} className="send-button">Send</button>
            </div>
        </div>
    );
}

export default Chat;