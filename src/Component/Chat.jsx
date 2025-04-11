import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './Chat.css';
import './Messagecss.css';

const socket = io('https://mychatbackend-7.onrender.com');

function Chat() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [username, setUsername] = useState(localStorage.getItem('username'));
    const [unreadCount, setUnreadCount] = useState(0);
    const chatBoxRef = useRef(null);
    const navigate = useNavigate();
console.log(setUsername)
    useEffect(() => {
        if (!username) return;

        socket.emit('setUsername', username);

        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') console.log('Notification permission granted');
            });
        }

        socket.on('loadMessages', (loadedMessages) => {
            setMessages(loadedMessages);
        });

        socket.on('message', (msg) => {
            setMessages(prev => [...prev, msg]);

            const chatBox = chatBoxRef.current;
            if (chatBox) {
                const isNearBottom = chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight < 100;
                if (isNearBottom) {
                    setTimeout(() => {
                        chatBox.scrollTop = chatBox.scrollHeight;
                    }, 100);
                }
            }

            if (document.hidden) {
                setUnreadCount(prev => prev + 1);
                showNotification(msg);
            }
        });

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                setUnreadCount(0);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            socket.off('loadMessages');
            socket.off('message');
            document.removeEventListener('visibilitychange', handleVisibilityChange);
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
        if (!timestamp) return 'Unknown Time';

        const messageDate = new Date(timestamp);
        if (isNaN(messageDate.getTime())) return 'Invalid Time';

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

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') sendMessage();
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
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <h1 className="chat-title">ChatSphere</h1>
                {unreadCount > 0 && (
                    <div style={{
                        background: 'red',
                        color: 'white',
                        borderRadius: '50%',
                        padding: '5px 10px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginLeft: '10px'
                    }}>
                        {unreadCount}
                    </div>
                )}
            </div>

            <div className="chat-box" ref={chatBoxRef}>
                {messages.map((msg, index) => {
                    const isMyMessage = msg.username === username;

                    return (
                        <div
                            key={index}
                            className={`message ${isMyMessage ? 'my-message' : 'other-message'}`}
                        >
                            <div
                                style={{
                                    background: isMyMessage ? '#DCF8C6' : '#FFFFFF',
                                    color: 'black',
                                    padding: '10px',
                                    borderRadius: '10px',
                                    maxWidth: '70%',
                                    wordWrap: 'break-word',
                                    boxShadow: '0px 1px 2px rgba(0,0,0,0.2)',
                                    textAlign: 'left'
                                }}
                            >
                                <p style={{
                                    fontSize: '10px',
                                    marginBottom: '5px',
                                    fontWeight: 'bold',
                                    backgroundColor: '#3D90D7',
                                    padding: '2px 5px',
                                    borderRadius: '5px'
                                }}>
                                    {msg.username || 'Anonymous'}
                                </p>
                                <p>{msg.content || 'No content'}</p>
                                <p style={{
                                    fontSize: '10px',
                                    marginTop: '5px',
                                    textAlign: 'right'
                                }}>
                                    {formatTimestamp(msg.timestamp)}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="input-container">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="message-input"
                    onKeyDown={handleKeyDown}
                />
                <button onClick={sendMessage} className="send-button">Send</button>
            </div>
        </div>
    );
}

export default Chat;
