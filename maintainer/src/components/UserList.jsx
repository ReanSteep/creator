// src/components/UserList.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadUsers = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      const userList = snapshot.docs.map(doc => doc.data());
      setUsers(userList);
    };
    loadUsers();
  }, []);

  return (
    <div>
      <h2>Public Usernames</h2>
      <ul>
        {users.map((user, i) => <li key={i}>{user.name}</li>)}
      </ul>
    </div>
  );
}

export default UserList;
