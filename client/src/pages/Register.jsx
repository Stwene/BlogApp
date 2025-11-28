import { useState } from 'react';
import { API } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      // 1) Create the account
      await API.post('/api/auth/signup', {
        name,
        email,
        password,
      });

      // 2) Immediately log the user in
      const loginRes = await API.post('/api/auth/login', {
        email,
        password,
      });

      // 3) Save token + user
      localStorage.setItem('token', loginRes.data.token);
      localStorage.setItem('user', JSON.stringify(loginRes.data.user));

      // 4) Redirect to dashboard
      alert('Registration successful! You are now logged in.');
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Register error:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Failed to register');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Register</h1>

      <input
        className="w-full p-2 border"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="w-full p-2 border"
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="w-full p-2 border"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="bg-purple-600 text-white px-4 py-2 rounded">
        Register
      </button>
    </form>
  );
}
