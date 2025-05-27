import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch users using Supabase's auth API
    const fetchUsers = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log('Current user:', user);
        if (userError) {
          console.error('Error getting user:', userError);
          return;
        }
        
        const { data: users, error } = await supabase
          .from('profiles')
          .select('id, email')
          .neq('id', user.id);
        
        console.log('Fetched users:', users);
        console.log('Number of users fetched:', users?.length);
        if (users?.length > 0) {
          console.log('First user details:', {
            id: users[0].id,
            email: users[0].email
          });
        }
        console.log('Fetch error:', error);
        
        if (error) {
          console.error('Detailed error:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }
        setUsers(users || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      const setupSubscription = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          console.log('Setting up subscription for users:', { currentUser: user.id, selectedUser: selectedUser.id });

          // Subscribe to new messages
          const channel = supabase
            .channel('messages')
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id}))`,
              },
              (payload) => {
                console.log('New message received:', payload);
                setMessages((current) => {
                  // Check if message already exists to avoid duplicates
                  const messageExists = current.some(msg => msg.id === payload.new.id);
                  if (messageExists) {
                    return current;
                  }
                  const newMessages = [...current, payload.new];
                  console.log('Updated messages:', newMessages);
                  return newMessages;
                });
              }
            )
            .subscribe((status) => {
              console.log('Subscription status:', status);
              if (status === 'CHANNEL_ERROR') {
                console.error('Channel error occurred');
                setError('Failed to establish real-time connection. Please refresh the page.');
              }
            });

          // Fetch existing messages
          const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id})`)
            .order('created_at', { ascending: true });
          
          if (error) throw error;
          console.log('Fetched existing messages:', messages);
          setMessages(messages || []);

          return () => {
            console.log('Cleaning up subscription');
            channel.unsubscribe();
          };
        } catch (err) {
          console.error('Error setting up chat:', err);
          setError('Failed to load chat. Please try again later.');
        }
      };

      setupSubscription();
    }
  }, [selectedUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      console.log('Sending message:', {
        sender_id: user.id,
        receiver_id: selectedUser.id,
        content: newMessage
      });

      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: user.id,
            receiver_id: selectedUser.id,
            content: newMessage,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }
      
      console.log('Message sent successfully:', data);
      // Add the new message to the state immediately
      setMessages(current => [...current, data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="chat-container" style={{ 
      display: 'flex', 
      height: '100vh',
      backgroundColor: '#1a1a1a',
      color: '#ffffff'
    }}>
      {error && (
        <div className="error-message" style={{ 
          color: 'red', 
          padding: '10px', 
          textAlign: 'center',
          backgroundColor: '#2a2a2a'
        }}>
          {error}
        </div>
      )}
      <div className="users-list" style={{ 
        width: '250px',
        borderRight: '1px solid #333',
        padding: '20px',
        backgroundColor: '#2a2a2a'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#fff' }}>Users</h3>
        {users.map((user) => (
          <div
            key={user.id}
            className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
            onClick={() => setSelectedUser(user)}
            style={{
              padding: '10px',
              marginBottom: '10px',
              cursor: 'pointer',
              backgroundColor: selectedUser?.id === user.id ? '#3a3a3a' : '#333',
              borderRadius: '5px',
              color: '#fff',
              transition: 'background-color 0.2s'
            }}
          >
            {user.email}
          </div>
        ))}
      </div>
      
      <div className="chat-main" style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#1a1a1a'
      }}>
        {selectedUser ? (
          <>
            <div className="messages-container" style={{ 
              flex: 1,
              padding: '20px',
              overflowY: 'auto'
            }}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.sender_id === selectedUser.id ? 'received' : 'sent'}`}
                  style={{
                    maxWidth: '70%',
                    marginBottom: '10px',
                    padding: '10px',
                    borderRadius: '10px',
                    backgroundColor: message.sender_id === selectedUser.id ? '#2a2a2a' : '#3a3a3a',
                    alignSelf: message.sender_id === selectedUser.id ? 'flex-start' : 'flex-end',
                    marginLeft: message.sender_id === selectedUser.id ? '0' : 'auto',
                    marginRight: message.sender_id === selectedUser.id ? 'auto' : '0',
                    color: '#fff'
                  }}
                >
                  {message.content}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSendMessage} className="message-form" style={{ 
              padding: '20px',
              borderTop: '1px solid #333',
              backgroundColor: '#2a2a2a'
            }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #333',
                  backgroundColor: '#3a3a3a',
                  color: '#fff',
                  marginBottom: '10px'
                }}
              />
              <button type="submit" style={{
                padding: '10px 20px',
                borderRadius: '5px',
                border: 'none',
                backgroundColor: '#4a4a4a',
                color: '#fff',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}>
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected" style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#666'
          }}>
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat; 