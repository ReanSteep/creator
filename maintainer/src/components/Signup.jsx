// src/components/Signup.jsx
import React, { useState } from 'react';
import { auth, db } from '../firebase/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';

function Signup() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await addDoc(collection(db, 'users'), {
        uid: userCred.user.uid,
        name: name,
        email: email
      });
      alert('User signed up!');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleSignup}>
      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">Sign Up</button>
    </form>
  );
}

export default Signup;
