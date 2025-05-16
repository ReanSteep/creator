import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';

function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await addDoc(collection(db, 'users'), {
          uid: userCred.user.uid,
          name: name,
          email: email
        });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {!isLogin && <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />}
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      <button type="submit">{isLogin ? 'Login' : 'Create Account'}</button>
      <p onClick={() => setIsLogin(!isLogin)} className="toggle">{isLogin ? 'Create an account' : 'Have an account? Login'}</p>
    </form>
  );
}

export default AuthForm;