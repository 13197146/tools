const api = {
    async downloadVideo(url, format, quality) {
        const apiUrl = `/api/youtube?format=${format}&url=${url}&audioQuality=${quality}`;
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

        try {
            const data = await api.downloadVideo(url, format, quality);
            console.log("Download Data:", data);

            if (data.url) {
                document.getElementById("result").innerHTML = `
                    <h3>${data.title}</h3>
                    <img src="${data.thumbnail}" width="320"/>
                    <p>Duration: ${data.duration}</p>
                    <a href="${data.url}" target="_blank">⬇️ Download Now</a>
                `;
            } else {
                alert("Download link not found.");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to get download link. Check console.");
        }
    },
};

document.getElementById("downloadBtn").addEventListener("click", handlers.downloadVideo);
