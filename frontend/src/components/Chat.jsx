import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { initializeUserKeys, createChat, sendEncryptedMessage, receiveEncryptedMessage } from '../utils/encryption';
import './Chat.css';

export default function Chat() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser && selectedUser) {
      setupChat();
    }
  }, [currentUser, selectedUser]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user);
    setCurrentUser(user);

    // Check if user already has keys
    if (user) {
      const { data: keys } = await supabase
        .from('user_keys')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (keys) {
        setIsInitialized(true);
        fetchUsers();
      }
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    try {
      await initializeUserKeys(currentUser.id, password);
      setIsInitialized(true);
      fetchUsers();
    } catch (error) {
      console.error('Error initializing user keys:', error);
      setPasswordError('Failed to initialize encryption. Please try again.');
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .neq('id', currentUser?.id);

      if (error) throw error;
      console.log('Fetched users:', data);
      console.log('Number of users fetched:', data.length);
      if (data.length > 0) {
        console.log('First user details:', data[0]);
      }
      setUsers(data);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const setupChat = async () => {
    try {
      console.log('Setting up subscription for users:', { currentUser: currentUser.id, selectedUser: selectedUser.id });
      
      // Create or get chat ID
      const newChatId = await createChat(currentUser.id, selectedUser.id);
      setChatId(newChatId);

      // Fetch existing messages
      const { data: existingMessages, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      // Decrypt messages
      const decryptedMessages = await Promise.all(
        existingMessages.map(async (msg) => {
          const decryptedContent = await receiveEncryptedMessage(
            newChatId,
            currentUser.id,
            msg.id
          );
          return {
            ...msg,
            content: decryptedContent
          };
        })
      );

      setMessages(decryptedMessages);

      // Set up real-time subscription
      const subscription = supabase
        .channel('messages')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUser.id}))`
        }, async (payload) => {
          console.log('Real-time event received:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new;
            console.log('New message details:', newMessage);
            
            // Only process if it's for the current chat
            if ((newMessage.sender_id === currentUser.id && newMessage.receiver_id === selectedUser.id) ||
                (newMessage.sender_id === selectedUser.id && newMessage.receiver_id === currentUser.id)) {
              
              // Decrypt the message
              const decryptedContent = await receiveEncryptedMessage(
                newChatId,
                currentUser.id,
                newMessage.id
              );

              // Add to messages state
              setMessages(current => {
                // Check if message already exists
                const exists = current.some(m => m.id === newMessage.id);
                if (exists) return current;
                
                return [...current, { ...newMessage, content: decryptedContent }];
              });
            }
          }
        })
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up chat:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !selectedUser || !chatId) return;

    try {
      // Send encrypted message
      await sendEncryptedMessage(
        chatId,
        currentUser.id,
        selectedUser.id,
        newMessage
      );

      // Clear input
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!isInitialized) {
    return (
      <div className="initializing">
        <div className="password-form">
          <h2>Set Up Encryption</h2>
          <p>Please create a password to encrypt your private key. This password will be used to secure your messages.</p>
          
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                minLength={8}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
                minLength={8}
              />
            </div>

            {passwordError && (
              <div className="error-message">
                {passwordError}
              </div>
            )}

            <button type="submit" className="submit-button">
              Initialize Encryption
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="users-list">
        <h2>Users</h2>
        {users.map(user => (
          <div
            key={user.id}
            className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
            onClick={() => setSelectedUser(user)}
          >
            {user.email}
          </div>
        ))}
      </div>

      <div className="chat-box">
        {selectedUser ? (
          <>
            <div className="messages">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`message ${message.sender_id === currentUser?.id ? 'sent' : 'received'}`}
                >
                  <div className="message-content">{message.content}</div>
                  <div className="message-time">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="message-form">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit">Send</button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
} 