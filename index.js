const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// Reemplaza 'YOUR_API_KEY' con tu clave de API
const API_KEY = 'AIzaSyAh4915hArodRCxR6tqPVpwIBVKXiaf6Z4';

// Middleware para manejar errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Ruta principal para manejar solicitudes de búsqueda
app.get('/search', async (req, res) => {
    const query = req.query.buscar;
    const maxResults = parseInt(req.query.maxvideo, 10);

    if (!query || isNaN(maxResults)) {
        return res.status(400).send('Invalid query or maxResults parameter');
    }

    try {
        // Buscar videos
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${API_KEY}`;
        const searchResponse = await axios.get(searchUrl);
        const videoIds = searchResponse.data.items.map(item => item.id.videoId).join(',');

        if (!videoIds) {
            return res.status(404).send('No videos found for the given query');
        }

        // Obtener detalles de los videos
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${API_KEY}`;
        const detailsResponse = await axios.get(detailsUrl);

        if (detailsResponse.data.items.length === 0) {
            return res.status(404).send('No video details found');
        }

        res.json(detailsResponse.data);
    } catch (error) {
        console.error('Error fetching data from YouTube API:', error.message);
        res.status(500).send('Error fetching data from YouTube API');
    }
});

// Manejar errores 404
app.use((req, res) => {
    res.status(404).send('Not Found');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
