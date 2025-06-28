const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const API_KEY = "f810244328efffe65edb02e899789cdc1b5303156dd950a644a6f2637ce564f0";
const API_URL = "https://haji-mix.up.railway.app/api/onlytik";

module.exports.config = {
  name: "tiktokvid",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["onlytik", "randomtik", "ttvid"],
  usage: "tiktokvid",
  description: "Get a random TikTok video (auto streamed)",
  credits: "Vern",
  cooldown: 5
};

module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  api.sendMessage("📲 Grabbing a viral TikTok video for you...\n🎶 Please wait a sec!", threadID, messageID);

  try {
    const res = await axios.get(API_URL, {
      params: {
        stream: true,
        api_key: API_KEY
      }
    });

    const video = res.data?.result;
    if (!video || !video.url) {
      return api.sendMessage("⚠️ Couldn't get a TikTok video. Try again shortly.", threadID, messageID);
    }

    const fileName = `${Date.now()}_tt.mp4`;
    const filePath = path.join(__dirname, "cache", fileName);

    const videoStream = await axios({
      method: "GET",
      url: video.url,
      responseType: "stream"
    });

    const writer = fs.createWriteStream(filePath);
    videoStream.data.pipe(writer);

    writer.on("finish", () => {
      const size = fs.statSync(filePath).size;
      if (size > 25 * 1024 * 1024) {
        fs.unlinkSync(filePath);
        return api.sendMessage("⚠️ Video too large to send (>25MB).", threadID, messageID);
      }

      const message = {
        body: `🎵 Here's a random TikTok for you!\n✨ Trend vibes incoming 👇`,
        attachment: fs.createReadStream(filePath)
      };

      api.sendMessage(message, threadID, () => fs.unlinkSync(filePath), messageID);
    });

    writer.on("error", err => {
      console.error("❌ File write error:", err);
      api.sendMessage("❌ Failed to save the TikTok video.", threadID, messageID);
    });

  } catch (err) {
    console.error("❌ TikTok fetch error:", err.message);
    api.sendMessage(`❌ Error while fetching TikTok video:\n${err.response?.data?.message || err.message}`, threadID, messageID);
  }
};
