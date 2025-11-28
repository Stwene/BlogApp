const express = require('express');
const router = express.Router();
const slugify = require('slugify');
const Blog = require('../models/Blog');
const mongoose = require('mongoose');

const requireAuth = require('../middleware/auth');

// Create a blog (protected)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, content, tags = [], summary, published = true } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content required' });
    let slug = slugify(title, { lower: true, strict: true });
    const exists = await Blog.findOne({ slug });
    if (exists) slug = `${slug}-${Date.now()}`;

    const blog = await Blog.create({
      title, content, tags, summary, published, slug, author: req.user._id
    });
    res.status(201).json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a blog (protected, owner only)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Not found' });
    if (String(blog.author) !== String(req.user._id)) return res.status(403).json({ error: 'Forbidden' });

    const { title, content, tags, summary, published } = req.body;
    if (title && title !== blog.title) {
      let newSlug = slugify(title, { lower: true, strict: true });
      const exists = await Blog.findOne({ slug: newSlug, _id: { $ne: blog._id } });
      if (exists) newSlug = `${newSlug}-${Date.now()}`;
      blog.slug = newSlug;
      blog.title = title;
    }
    if (content !== undefined) blog.content = content;
    if (tags !== undefined) blog.tags = tags;
    if (summary !== undefined) blog.summary = summary;
    if (published !== undefined) blog.published = published;

    await blog.save();
    res.json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete (protected, owner only)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Not found' });

    // Check author properly
    if (!blog.author || String(blog.author) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Delete the blog safely
    await Blog.findByIdAndDelete(req.params.id);

    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Public list: pagination + search
// GET /api/blogs?page=1&limit=10&q=search&mine=true
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '10')));
    const q = req.query.q;
    const mine = req.query.mine === 'true';
    const authorId = req.query.authorId;

    const filter = {};
    if (q) filter.$text = { $search: q };
    if (req.query.published === 'true' || req.query.published === undefined) filter.published = true;
    if (mine && req.headers.authorization) {
      const auth = req.headers.authorization?.split(' ');
      if (auth && auth[0] === 'Bearer') {
        const jwt = require('jsonwebtoken');
        try {
          const payload = jwt.verify(auth[1], process.env.JWT_SECRET || 'dev_secret');
          filter.author = payload.id;
        } catch (err) {
          return res.status(401).json({ error: 'Invalid token' });
        }
      } else {
        return res.status(401).json({ error: 'Missing token' });
      }
    } else if (authorId) {
      filter.author = authorId;
    }

    const skip = (page - 1) * limit;
    const [total, items] = await Promise.all([
      Blog.countDocuments(filter),
      Blog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name')
        .select('-content')
    ]);

    res.json({ page, limit, total, pages: Math.ceil(total / limit), items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single blog by id OR slug
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    let query;
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      // looks like a MongoDB ObjectId → search by _id
      query = { _id: idOrSlug };
    } else {
      // otherwise treat it as slug
      query = { slug: idOrSlug };
    }

    const b = await Blog.findOne(query).populate('author', 'name email');
    if (!b) return res.status(404).json({ error: 'Not found' });

    res.json(b);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
