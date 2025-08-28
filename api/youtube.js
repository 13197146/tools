import fetch from "node-fetch";

export default async function handler(req, res) {
    const { url, action, format, quality, audioQuality } = req.query;

    if (!url || !action) {
        return res.status(400).json({ error: "Missing required parameters" });
    }

    const headers = {
        "x-rapidapi-host": "youtube-info-download-api.p.rapidapi.com",
        "x-rapidapi-key": process.env.RAPIDAPI_KEY, // ✅ API key env me safe rahegi
    };

    const API_BASE = "https://youtube-info-download-api.p.rapidapi.com/ajax";
    let apiUrl;

    try {
        if (action === "info") {
            apiUrl = `${API_BASE}/api.php?function=i&u=${encodeURIComponent(url)}`;
        } else if (action === "download") {
            if (format === "mp4") {
                apiUrl = `${API_BASE}/download.php?format=${format}&add_info=0&quality=${quality}&url=${encodeURIComponent(url)}`;
            } else {
                apiUrl = `${API_BASE}/download.php?format=${format}&add_info=0&audio_quality=${audioQuality || "128"}&audio_language=en&url=${encodeURIComponent(url)}`;
            }
        }

        const response = await fetch(apiUrl, { headers });
        const data = await response.json();
        res.status(200).json(data);
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: "Server error" });
    }
}
