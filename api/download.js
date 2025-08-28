// api/download.js
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== API Request Started ===');
    
    // Check if API key exists
    if (!process.env.RAPIDAPI_KEY) {
      console.error('❌ RAPIDAPI_KEY not found in environment variables');
      return res.status(500).json({ 
        error: 'Server configuration error',
        details: 'API key not configured'
      });
    }

    const { url, format } = req.body;
    console.log('📝 Request data:', { url, format });

    // Validate input
    if (!url || !format) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Both URL and format are required'
      });
    }

    // Validate format (only audio)
    const allowedFormats = ['mp3', 'm4a'];
    if (!allowedFormats.includes(format.toLowerCase())) {
      console.log('❌ Invalid format:', format);
      return res.status(400).json({ 
        error: 'Invalid format',
        details: 'Only MP3 and M4A formats are supported'
      });
    }

    // Extract and validate YouTube video ID
    const videoId = extractVideoId(url);
    if (!videoId) {
      console.log('❌ Invalid YouTube URL:', url);
      return res.status(400).json({ 
        error: 'Invalid YouTube URL',
        details: 'Please provide a valid YouTube URL'
      });
    }

    console.log('✅ Extracted video ID:', videoId);

    // Create normalized YouTube URL
    const normalizedUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const encodedUrl = encodeURIComponent(normalizedUrl);
    
    console.log('🔗 Normalized URL:', normalizedUrl);

    // Build RapidAPI request URL
    const apiUrl = `https://youtube-info-download-api.p.rapidapi.com/ajax/download.php?format=${format}&add_info=0&url=${encodedUrl}&audio_quality=128&allow_extended_duration=false&no_merge=false&audio_language=en`;
    
    console.log('🚀 Making request to RapidAPI...');

    // Make request to RapidAPI
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'youtube-info-download-api.p.rapidapi.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    console.log('📡 API Response status:', response.status);
    console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()));

    // Get response as text first
    const responseText = await response.text();
    console.log('📄 Raw response (first 500 chars):', responseText.substring(0, 500));

    // Check if response is successful
    if (!response.ok) {
      console.error('❌ API request failed');
      return res.status(response.status).json({
        error: `API request failed (${response.status})`,
        details: responseText.substring(0, 200)
      });
    }

    // Parse JSON response
    let apiData;
    try {
      apiData = JSON.parse(responseText);
      console.log('✅ Successfully parsed JSON response');
      console.log('📊 Response data keys:', Object.keys(apiData));
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError.message);
      return res.status(500).json({
        error: 'Invalid response from API',
        details: 'API returned non-JSON response: ' + responseText.substring(0, 100)
      });
    }

    // Log successful response
    console.log('🎉 API call successful');
    console.log('=== API Request Completed ===');

    // Return the data
    return res.status(200).json(apiData);

  } catch (error) {
    console.error('💥 Server error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

// Extract video ID from various YouTube URL formats
function extractVideoId(url) {
  if (!url) return null;

  const patterns = [
    // Standard youtube.com URLs
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    // Shortened youtu.be URLs
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
    // Embed URLs
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    // Mobile URLs
    /(?:https?:\/\/)?(?:m\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    // Just the video ID
    /^([a-zA-Z0-9_-]{11})$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}
