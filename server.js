const express = require('express');
const path = require('path');
const { nanoid } = require('nanoid');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory database
const urlDatabase = {};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: Create a Short Link
app.post('/api/shorten', (req, res) => {
    const { originalUrl } = req.body;
    if (!originalUrl) {
        return res.status(400).json({ error: 'URL is required' });
    }

    const shortId = nanoid(6);
    urlDatabase[shortId] = {
        originalUrl,
        createdAt: Date.now()
    };

    res.json({ shortUrl: `${req.protocol}://${req.get('host')}/s/${shortId}` });
});

// Route: Serve Ad Gateway Page
app.get('/s/:id', (req, res) => {
    const { id } = req.params;
    if (!urlDatabase[id]) {
        return res.status(404).send('Short URL not found');
    }
    res.sendFile(path.join(__dirname, 'public', 'gateway.html'));
});

// API: Get Final Link (Called after ads finish)
app.post('/api/get-destination', (req, res) => {
    const { shortId } = req.body;
    const record = urlDatabase[shortId];

    if (!record) {
        return res.status(404).json({ error: 'Link not found' });
    }

    res.json({ destination: record.originalUrl });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
      
