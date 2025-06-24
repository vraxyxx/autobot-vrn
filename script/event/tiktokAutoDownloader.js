const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "tiktokAutoDownloader",
  version: "1.0.0",
  description: "Auto-download TikTok videos when a TikTok URL is detected",
  credits: "Vern",
};

module.exports.handleEvent = async function ({ api, event }) {
  const { body, threadID, messageID } = event;

  // Only trigger if a TikTok URL is present
  const match = body && body.match(/https?:\/\/(?:vt|www)\.tiktok\.com\/[^\s]+/);
  if (!match) return;

  const url = match[0];
  const tempPath = path.join(__dirname, "..", "cache", `tiktok-${Date.now()}.mp4`);

  try {
    api.sendMessage("📥 Downloading TikTok video...", threadID);

    const apiUrl = `https://ace-rest-api.onrender.com/api/downloaderV2?url=${encodeURIComponent(url)}`;
    const res = await axios.get(apiUrl);

    const videoURL = res.data?.result?.video_no_watermark;
    if (!videoURL) {
      return api.sendMessage("❌ Couldn't fetch video from TikTok. Try another link.", threadID, messageID);
    }

    const videoStream = await axios.get(videoURL, { responseType: "arraybuffer" });
    fs.writeFileSync(tempPath, Buffer.from(videoStream.data));

    return api.sendMessage({
      body: `🎬 Here's the TikTok video you shared!`,
      attachment: fs.createReadStream(tempPath)
    }, threadID, () => fs.unlinkSync(tempPath));

  } catch (err) {
    console.error("❌ TikTok download error:", err.message || err);
    return api.sendMessage("❌ Error downloading the TikTok video.", threadID);
  }
};
