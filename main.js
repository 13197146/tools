const API_CONFIG = {
    useServerless: true, // ✅ Always true in GitHub/Vercel
    serverlessUrl: "/api/youtube",
};

const api = {
    async getVideoInfo(url) {
        const apiUrl = `${API_CONFIG.serverlessUrl}?action=info&url=${encodeURIComponent(url)}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("HTTP error " + response.status);
        return await response.json();
    },

    async downloadVideo(url, format, quality) {
        let apiUrl;
        if (format === "mp4") {
            apiUrl = `${API_CONFIG.serverlessUrl}?action=download&url=${encodeURIComponent(url)}&format=${format}&quality=${quality}`;
        } else {
            apiUrl = `${API_CONFIG.serverlessUrl}?action=download&url=${encodeURIComponent(url)}&format=${format}&audioQuality=${quality}`;
        }

        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("HTTP error " + response.status);
        return await response.json();
    },
};

// ✅ UI Handlers
const handlers = {
    async getVideoInfo() {
        const url = document.getElementById("url").value.trim();
        if (!url) return alert("Please enter a valid YouTube URL");

        try {
            const info = await api.getVideoInfo(url);
            console.log("Video Info:", info);

            document.getElementById("result").innerHTML = `
                <h3>${info.title}</h3>
                <img src="${info.thumbnail}" alt="Thumbnail" width="320"/>
                <p>Duration: ${info.duration}</p>
            `;
        } catch (err) {
            console.error(err);
            alert("Failed to fetch video info. Check console.");
        }
    },

    async downloadVideo() {
        const url = document.getElementById("url").value.trim();
        const format = document.getElementById("format").value;
        const quality = document.getElementById("quality").value;

        try {
            const data = await api.downloadVideo(url, format, quality);
            console.log("Download Data:", data);

            if (data.url) {
                window.open(data.url, "_blank");
            } else {
                alert("Download link not found.");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to get download link. Check console.");
        }
    },
};

// Event Listeners
document.getElementById("getInfoBtn").addEventListener("click", handlers.getVideoInfo);
document.getElementById("downloadBtn").addEventListener("click", handlers.downloadVideo);
