import express from 'express';
import connectDB from './config/db.js';
import usersRoutes from './routes/api/users.js';
import authRoutes from './routes/api/auth.js';
import profileRoutes from './routes/api/profile.js';
import postsRoutes from './routes/api/post.js';

const app = express();

//Connect Database
connectDB();

//Init Middleware
app.use(express.json({ extended: false }));

app.get('/', (req, res) => {
    res.send('API Running');
});

//Define Routes

app.use('/api/users', usersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/posts', postsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
