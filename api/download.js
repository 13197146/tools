// /api/download.js
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, format } = req.body;

    // Check if API key is available
    if (!process.env.RAPIDAPI_KEY) {
      console.error('RAPIDAPI_KEY environment variable not found');
      return res.status(500).json({ error: 'Server configuration error: API key not found' });
    }

    console.log('API key available:', process.env.RAPIDAPI_KEY ? 'Yes' : 'No');
    console.log('Request body:', { url, format });

    // Validate input
    if (!url || !format) {
      return res.status(400).json({ error: 'URL and format are required' });
    }

    // Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    if (!youtubeRegex.test(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // Extract video ID and normalize URL
    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Could not extract video ID from URL' });
    }

    const normalizedUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const encodedUrl = encodeURIComponent(normalizedUrl);

    // Validate format
    const allowedFormats = ['mp3', 'mp4', 'm4a'];
    if (!allowedFormats.includes(format.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid format. Use mp3, mp4, or m4a' });
    }

    // Build API URL
    const apiUrl = `https://youtube-info-download-api.p.rapidapi.com/ajax/download.php?format=${format}&add_info=0&url=${encodedUrl}&audio_quality=128&allow_extended_duration=false&no_merge=false&audio_language=en`;

    console.log('Making request to:', apiUrl);

    // Make request to YouTube API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'youtube-info-download-api.p.rapidapi.com'
      }
    });

    console.log('API Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      return res.status(response.status).json({ 
        error: `API request failed: ${response.status}`,
        details: errorText
      });
    }

    // Get response as text first to debug
    const responseText = await response.text();
    console.log('Raw API Response:', responseText);

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Response was:', responseText.substring(0, 500) + '...');
      return res.status(500).json({ 
        error: 'Invalid JSON response from API',
        details: `Response: ${responseText.substring(0, 200)}...`
      });
    }

    console.log('Parsed API Response data:', data);
    return res.status(200).json(data);

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

// Function to extract video ID from various YouTube URL formats
function extractVideoId(url) {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}
