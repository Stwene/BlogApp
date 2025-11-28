import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API } from '../api';

export default function EditBlog() {
  const { id } = useParams();              // from /edit/:id
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  // Load existing blog data
  useEffect(() => {
    async function loadBlog() {
      try {
        const res = await API.get(`/api/blogs/${id}`);   // now works by id
        const b = res.data;

        setTitle(b.title);
        setSummary(b.summary);
        setContent(b.content);
      } catch (err) {
        console.error('Error loading blog:', err.response?.data || err.message);
        alert('Failed to load blog for editing');
      } finally {
        setLoading(false);
      }
    }

    loadBlog();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      await API.put(
        `/api/blogs/${id}`,
        { title, summary, content },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Blog updated successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error updating blog:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Failed to update blog');
    }
  }

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
      <h1 className="text-3xl font-bold mb-4">Edit Blog</h1>

      <input
        className="w-full p-2 border"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        className="w-full p-2 border"
        placeholder="Summary"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
      />

      <textarea
        className="w-full p-2 border h-40"
        placeholder="Content..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button className="bg-green-600 text-white px-4 py-2 rounded">
        Save Changes
      </button>
    </form>
  );
}
