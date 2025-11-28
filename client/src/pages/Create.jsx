import { useState, useEffect } from 'react';
import { API } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Create() {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  // Protect route - must be logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to create a blog.');
      navigate('/login');
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      // attach token
      const token = localStorage.getItem('token');

      const res = await API.post(
        '/api/blogs',
        { title, summary, content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Create response:', res.data);

      alert('Blog created successfully!');
      navigate('/dashboard'); // redirect
    } catch (err) {
      console.error('Create error:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Failed to create blog');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
      <h1 className="text-3xl font-bold mb-4">Create Blog Post</h1>

      <input
        className="w-full p-2 border"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        className="w-full p-2 border"
        placeholder="Short Summary"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
      />

      <textarea
        className="w-full p-2 border h-40"
        placeholder="Content..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button className="bg-purple-600 text-white px-4 py-2 rounded">
        Create
      </button>
    </form>
  );
}
