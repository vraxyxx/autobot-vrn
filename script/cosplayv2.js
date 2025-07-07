const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "cosplayv2",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Vern",
  description: "Get a random cosplay video using Haji-Mix API",
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

  await api.sendMessage("🎬 Fetching a cosplay video... please wait!", threadID, messageID);

  try {
    const res = await axios.get(apiUrl);
    const data = res.data?.result;

    let videoUrl = null;

    if (Array.isArray(data) && data.length > 0) {
      const random = data[Math.floor(Math.random() * data.length)];
      videoUrl = typeof random === "string" ? random : random.url || random.video || random.link;
    } else if (typeof data === "string") {
      videoUrl = data;
    }

    if (!videoUrl) {
      return api.sendMessage("⚠️ No valid video URL found.", threadID, messageID);
    }

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);
    const fileName = `cosplay_${Date.now()}.mp4`;
    const filePath = path.join(cacheDir, fileName);

    const videoRes = await axios({ method: "GET", url: videoUrl, responseType: "stream" });
    const writer = fs.createWriteStream(filePath);
    videoRes.data.pipe(writer);

    writer.on("finish", async () => {
      const fileSize = fs.statSync(filePath).size;
      if (fileSize > 25 * 1024 * 1024) {
        fs.unlinkSync(filePath);
        return api.sendMessage("⚠️ Video too large to send (>25MB).", threadID, messageID);
      }

      return api.sendMessage(
        {
          body: "📹 Here's your cosplay video!",
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        () => fs.unlinkSync(filePath),
        messageID
      );
    });

    writer.on("error", (err) => {
      console.error("[cosplayv2] Write error:", err);
      api.sendMessage("❌ Failed to save video file.", threadID, messageID);
    });
  } catch (err) {
    console.error("[cosplayv2] API Error:", err.response?.data || err.message);
    return api.sendMessage("🚫 Error while fetching cosplay video. Try again later.", threadID, messageID);
  }
};
