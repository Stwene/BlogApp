import { useEffect, useState } from 'react';
import { API } from '../api';
import { Link } from 'react-router-dom';

export default function Home() {
  const [blogs, setBlogs] = useState([]);   // must be array
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);

  async function fetchBlogs(p = 1, search = '') {
    setLoading(true);
    try {
      const res = await API.get('/api/blogs', {
        params: { page: p, limit: 5, q: search },
      });

      // IMPORTANT FIX
      setBlogs(res.data.items || []);     // always array
      setPage(res.data.page);
      setPages(res.data.pages);
    } catch (err) {
      console.error(err);
      setBlogs([]);       // prevent crash on error
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBlogs(1, '');
  }, []);

  return (
    <div>
      <h1 className="text-3xl mb-4 font-bold">All Blogs</h1>

      {/* Search bar */}
      <form
        onSubmit={(e) => { e.preventDefault(); fetchBlogs(1, q); }}
        className="mb-4 flex gap-2"
      >
        <input
          className="border p-2 flex-1"
          placeholder="Search blogs..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded">
          Search
        </button>
      </form>

      {loading && <p>Loading...</p>}

      <div className="space-y-4">
        {blogs.map((blog) => (
          <Link
            key={blog._id}
            to={`/blog/${blog.slug}`}
            className="block border p-4 rounded shadow"
          >
            <h2 className="text-xl font-semibold">{blog.title}</h2>
            <p className="text-gray-600">{blog.summary}</p>
          </Link>
        ))}

        {!loading && blogs.length === 0 && <p>No blogs found.</p>}
      </div>

      {/* Pagination */}
      <div className="flex items-center gap-4 mt-6">
        <button
          disabled={page <= 1}
          onClick={() => fetchBlogs(page - 1, q)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span>Page {page} of {pages}</span>

        <button
          disabled={page >= pages}
          onClick={() => fetchBlogs(page + 1, q)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
