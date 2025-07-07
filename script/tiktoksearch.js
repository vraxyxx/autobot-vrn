// modules/commands/tiktoksearch.js

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "tiktoksearch",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Vern",
  description: "Search and fetch a TikTok video via Haji-Mix API",
  commandCategory: "media",
  usages: "tiktoksearch [search terms]",
  cooldowns: 5,
  role: 0,
  hasPrefix: true
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(" ");
  if (!query) {
    return api.sendMessage(
      "❓ Usage: tiktoksearch <search terms>\nExample: tiktoksearch capcut anime edits",
      threadID,
      messageID
    );
  }

  const apiKey = "f810244328efffe65edb02e899789cdc1b5303156dd950a644a6f2637ce564f0";
  const limit = 10;
  const page = 1;
  const apiUrl = `https://haji-mix.up.railway.app/api/tiktok`;
  
  await api.sendMessage(`🔍 Searching TikTok for "${query}"...`, threadID, messageID);

  try {
    const res = await axios.get(apiUrl, {
      params: {
        search: query,
        limit,
        page,
        stream: true,
        api_key: apiKey
      }
    });

    const list = res.data?.result;
    if (!Array.isArray(list) || list.length === 0) {
      return api.sendMessage("⚠️ No TikTok videos found. Try another search.", threadID, messageID);
    }

    // Pick a random video
    const vid = list[Math.floor(Math.random() * list.length)];
    const videoUrl = vid.video || vid.url || vid.downloadUrl;
    if (!videoUrl) {
      return api.sendMessage("⚠️ Received invalid video data.", threadID, messageID);
    }

    // Download and send
    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);
    const filePath = path.join(cacheDir, `tiktok_${Date.now()}.mp4`);

    const streamRes = await axios({
      method: "GET",
      url: videoUrl,
      responseType: "stream"
    });

    const writer = fs.createWriteStream(filePath);
    streamRes.data.pipe(writer);

    writer.on("finish", () => {
      const size = fs.statSync(filePath).size;
      if (size > 25 * 1024 * 1024) {
        fs.unlinkSync(filePath);
        return api.sendMessage("⚠️ Video too large to send (>25MB).", threadID, messageID);
      }
      api.sendMessage(
        {
          body: `🎬 Here's a TikTok for "${query}":`,
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        () => fs.unlinkSync(filePath),
        messageID
      );
    });

    writer.on("error", (err) => {
      console.error("[tiktoksearch] Write error:", err);
      api.sendMessage("❌ Failed to save video.", threadID, messageID);
    });

  } catch (err) {
    console.error("[tiktoksearch] API error:", err.response?.data || err.message);
    return api.sendMessage("🚫 Error fetching TikTok video. Try again later.", threadID, messageID);
  }
};
