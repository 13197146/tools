const API_CONFIG = {
    useServerless: true, // ✅ Always true in GitHub/Vercel
    serverlessUrl: "/api/youtube",
};

const api = {
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

const handlers = {
    async downloadVideo() {
        const url = document.getElementById("url").value.trim();
        const format = document.getElementById("format").value;
        const quality = document.getElementById("quality").value;

        if (!url) return alert("Please enter a valid YouTube URL");

        try {
            const data = await api.downloadVideo(url, format, quality);
            console.log("Download Data:", data);

            if (data.title) {
                document.getElementById("result").innerHTML = `
                    <h3>${data.title}</h3>
                    <img src="${data.thumbnail}" alt="Thumbnail" width="320"/>
                    <p>Duration: ${data.duration}</p>
                `;
            }

            if (data.url) {
                // Open download link
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
document.getElementById("downloadBtn").addEventListener("click", handlers.downloadVideo);
