import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Create from './pages/Create';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EditBlog from './pages/EditBlog';

import { useEffect, useState } from 'react';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  }

  return (
    <div>
      <nav className="p-4 bg-gray-900 text-white flex justify-between items-center">
        <Link to="/" className="font-bold text-lg">Blog App</Link>
        <div className="space-x-4 flex items-center">
          <Link to="/">Home</Link>
          {user && <Link to="/dashboard">Dashboard</Link>}
          {user && <Link to="/create">Create</Link>}  
          {!user && <Link to="/login">Login</Link>}
          {!user && <Link to="/register">Register</Link>}
          {user && (
            <>
              <span className="text-sm text-gray-300">Hi, {user.name}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-red-600 rounded text-sm"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      <div className="p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog/:slug" element={<Blog />} />
          <Route path="/create" element={<Create />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/edit/:id" element={<EditBlog />} />

        </Routes>
      </div>
    </div>
  );
}
