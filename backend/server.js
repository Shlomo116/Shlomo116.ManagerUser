require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Octokit } = require('octokit');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// GitHub client setup
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (username === process.env.ADMIN_USERNAME && 
      password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ username, role: 'admin' }, 
      process.env.JWT_SECRET || 'your-secret-key');
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Get users from GitHub
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      path: 'data/users.json'
    });

    const content = Buffer.from(data.content, 'base64').toString();
    const users = JSON.parse(content);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Add new user
app.post('/api/users', authenticateToken, async (req, res) => {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      path: 'data/users.json'
    });

    const content = Buffer.from(data.content, 'base64').toString();
    const users = JSON.parse(content);
    
    const newUser = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      path: 'data/users.json',
      message: 'Add new user',
      content: Buffer.from(JSON.stringify(users, null, 2)).toString('base64'),
      sha: data.sha
    });

    res.json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Error adding user' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 