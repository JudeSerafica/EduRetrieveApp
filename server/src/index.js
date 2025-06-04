require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const authenticateToken = require('./middleware/authMiddleware');
const uploadController = require('./controllers/uploadController');
const moduleModel = require('./model/moduleModel');
const { generateContent } = require('./model/Model.js');
const chatRoutes = require('./routes/chatRoutes');
const checkEmailRoute = require('./routes/authRoutes.js');
const analyticsRoutes = require('./routes/analyticsRoute.js');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Endpoint for Gemini content generation
app.post('/api/generate-content', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required.' });
    }

    try {
        const content = await generateContent(prompt);
        res.json({ generatedContent: content });
    } catch (error) {
        console.error('API Error:', error.message);
        res.status(500).json({ error: 'Failed to generate content: ' + error.message });
    }
});

app.get('/api/protected-data', authenticateToken, async (req, res) => {
    res.json({
        message: 'Welcome to the protected area!',
        userEmail: req.user.email,
        userId: req.user.uid,
    });
});

app.post(
    '/api/upload-module',
    authenticateToken,
    uploadController.uploadModule
);
app.get('/api/modules', authenticateToken, async (req, res) => {
    try {
        const modules = await moduleModel.getAllModules();
        res.status(200).json(modules);
    } catch (error) {
        console.error('Error getting modules:', error);
        res.status(500).json({ message: `Error fetching modules: ${error.message}` });
    }
});

app.use('/api/chat', chatRoutes);
app.use('/api/reset-password', checkEmailRoute);
app.use('/api/analytics', analyticsRoutes);

app.listen(PORT, () => {
    console.log(`Node.js server running on http://localhost:${PORT}`);
});