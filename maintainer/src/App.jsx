// src/App.jsx
import React from 'react';
import Signup from './components/Signup';
import UserList from './components/UserList';

function App() {
  return (
    <div className="App">
      <h1>SideQuest Users</h1>
      <Signup />
      <UserList />
    </div>
  );
}

export default App;
