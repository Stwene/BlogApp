require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blogs');

const app = express();

// ---------- MIDDLEWARE ----------
app.use(express.json());

// Allow CORS from frontend
// In .env on Render, set CLIENT_URL=https://your-frontend.netlify.app
const allowedOrigins = [
  'http://localhost:5173',process.env.CLIENT_URL, // Netlify URL
].filter(Boolean); // remove undefined

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));


// ---------- ROUTES ----------
app.get('/', (req, res) => res.send('Blog API is running'));

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

// ---------- DB + SERVER START ----------
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blogdb';

console.log('DB URL is:', MONGO_URI);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  })
  .catch((err) => {
    console.error('DB connection error', err);
    process.exit(1);
  });
