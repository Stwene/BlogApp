import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API } from '../api';

export default function Blog() {
  const { slug } = useParams();          // 👈 get slug from URL
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchBlog() {
      setLoading(true);
      setError('');
      try {
        const res = await API.get(`/api/blogs/${slug}`);  // 👈 call by slug
        setBlog(res.data);
      } catch (err) {
        console.error('Error loading blog:', err.response?.data || err.message);
        if (err.response?.status === 404) {
          setError('Blog not found.');
        } else {
          setError('Could not load this blog.');
        }
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchBlog();
    } else {
      setLoading(false);
      setError('Invalid blog link.');
    }
  }, [slug]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!blog) return <p className="p-6">No blog data.</p>;

  return (
    <article className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">{blog.title}</h1>
      <p className="text-gray-500 mb-4">
        {blog.author?.name} · {new Date(blog.createdAt).toLocaleString()}
      </p>
      <p className="whitespace-pre-line leading-relaxed">
        {blog.content}
      </p>
    </article>
  );
}
