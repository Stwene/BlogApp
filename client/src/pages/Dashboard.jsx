import { useEffect, useState } from 'react';
import { API } from '../api';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchMine() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const res = await API.get('/api/blogs', {
        params: { mine: true, limit: 20 },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setBlogs(res.data.items);
    } catch (err) {
      console.error(err);
      alert('Failed to load your blogs');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMine();
  }, []);

  // 🔥 Replace your old delete function with THIS one
  async function handleDelete(id) {
    if (!window.confirm('Delete this blog?')) return;

    try {
      const token = localStorage.getItem('token');

      await API.delete(`/api/blogs/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setBlogs(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      console.error('DELETE ERROR:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Failed to delete blog');
    }
  }

  return (
    <div>
      <h1 className="text-3xl mb-4 font-bold">My Blogs</h1>

      {loading && <p>Loading...</p>}

      <div className="space-y-3">
        {blogs.map(blog => (
          <div
            key={blog._id}
            className="border p-3 rounded flex justify-between items-center"
          >
            <div>
              <Link to={`/blog/${blog.slug}`} className="font-semibold">
                {blog.title}
              </Link>
              <p className="text-sm text-gray-500">{blog.summary}</p>
            </div>

            <div className="flex gap-2">
              <Link
                to={`/edit/${blog._id}`}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Edit
              </Link>

              <button
                onClick={() => handleDelete(blog._id)}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {blogs.length === 0 && !loading && (
          <p>You have no blogs yet.</p>
        )}
      </div>
    </div>
  );
}
