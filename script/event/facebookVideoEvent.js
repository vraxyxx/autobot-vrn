const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "facebookVideoAuto",
  version: "1.0.0",
  description: "Auto-download Facebook videos when a FB URL is detected",
  credits: "Vern",
};

module.exports.handleEvent = async function ({ api, event }) {
  const { body, threadID, messageID } = event;

  // Detect FB video URL
  const fbRegex = /https?:\/\/(?:www\.)?(facebook|fb)\.com\/[^\s]+/gi;
  const match = body?.match(fbRegex);
  if (!match || match.length === 0) return;

  const fbURL = match[0];

  try {
    api.sendMessage("📥 Downloading Facebook video, please wait...", threadID);

    const apiUrl = `https://ace-rest-api.onrender.com/api/facebookv2?url=${encodeURIComponent(fbURL)}`;
    const res = await axios.get(apiUrl);

    const videoURL = res.data?.result?.hd || res.data?.result?.sd;
    if (!videoURL) {
      return api.sendMessage("❌ Failed to retrieve Facebook video. Make sure the link is public.", threadID, messageID);
    }

    const videoData = await axios.get(videoURL, { responseType: "arraybuffer" });
    const videoPath = path.join(__dirname, "..", "cache", `fbvid-${Date.now()}.mp4`);
    fs.writeFileSync(videoPath, Buffer.from(videoData.data));

    await api.sendMessage({
      body: `📺 Here's your Facebook video:\n${fbURL}`,
      attachment: fs.createReadStream(videoPath)
    }, threadID, () => fs.unlinkSync(videoPath));

  } catch (err) {
    console.error("❌ Facebook video error:", err.message || err);
    return api.sendMessage("❌ Error downloading the Facebook video. It might be private or expired.", threadID);
  }
};
