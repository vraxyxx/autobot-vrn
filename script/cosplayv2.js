const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "cosplayv2",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Vern",
  description: "Get a random cosplay video (v2) using Haji-Mix API",
  commandCategory: "fun",
  usages: "cosplayv2",
  cooldowns: 5,
  role: 0,
  hasPrefix: true
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;
  const apiKey = "f810244328efffe65edb02e899789cdc1b5303156dd950a644a6f2637ce564f0";
  const apiUrl = `https://haji-mix.up.railway.app/api/cosplayv2?api_key=${apiKey}`;

  // Notify user
  await api.sendMessage("🎬 Fetching a cool cosplay video... please wait!", threadID, messageID);

  try {
    const res = await axios.get(apiUrl);
    const list = res.data?.result;
    if (!Array.isArray(list) || list.length === 0) {
      return api.sendMessage("⚠️ No cosplay videos found. Try again later.", threadID, messageID);
    }

    // Pick a random video
    const video = list[Math.floor(Math.random() * list.length)];
    const url = video.url || video.video || video.link;
    if (!url) {
      return api.sendMessage("⚠️ Invalid video data received.", threadID, messageID);
    }

    // Download video stream
    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);
    const fileName = `cosplayv2_${Date.now()}.mp4`;
    const filePath = path.join(cacheDir, fileName);

    const videoRes = await axios({ method: "GET", url, responseType: "stream" });
    const writer = fs.createWriteStream(filePath);
    videoRes.data.pipe(writer);

    writer.on("finish", () => {
      const fileSize = fs.statSync(filePath).size;
      if (fileSize > 25 * 1024 * 1024) {
        fs.unlinkSync(filePath);
        return api.sendMessage("⚠️ Video too large to send (>25MB).", threadID, messageID);
      }

      api.sendMessage({
        body: "🎥 Here's your random cosplay video!",
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

    writer.on("error", (err) => {
      console.error("[cosplayv2] Write error:", err);
      api.sendMessage("❌ Failed to save video.", threadID, messageID);
    });
  } catch (err) {
    console.error("[cosplayv2] API Error:", err.response?.data || err.message);
    return api.sendMessage(
      "🚫 Error fetching cosplay video. Please try again later.",
      threadID,
      messageID
    );
  }
};
