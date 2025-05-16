import React, { useState } from 'react';
import Chat from './components/Chat';
import AuthForm from './components/AuthForm';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  return (
    <div className="App">
      {user ? <Chat user={user} /> : <AuthForm />}
    </div>
  );
}

export default App;