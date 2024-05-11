import express from 'express';
import { scrape } from './scraper.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware to validate the API key
app.use((req, res, next) => {
    const apiKey = req.query.apiKey;

    console.log("API Key: ", apiKey);

    if (apiKey === 'TEST_API_KEY') {
        next();
    } else {
        console.log("Invalid API Key");
        res.status(403).json({ error: 'Invalid API Key' });
    }
});

// Middleware to check if the URL is an Amazon URL
function amazonUrlValidator(req, res, next) {
    const url = req.query.url;

    console.log("URL in validator: ", url);
    if (!url) {
        return res.status(400).json({ error: 'URL parameter is missing. Please provide an Amazon URL.' });
    }

    const amazonUrlPattern = /^https?:\/\/(www\.)?amazon\.([a-z\.]{2,6})(\/[^\s]*)?$/i;
    if (amazonUrlPattern.test(url)) {
        next();
    } else {
        return res.status(400).json({ error: 'Not an Amazon link. Please provide a valid Amazon URL.' });
    }
}



// Route to handle scraping
app.get('/', amazonUrlValidator, async (req, res) => {
    try {
        const url = req.query.url;
        console.log("URL: ", url);
        const result = await scrape(url);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
