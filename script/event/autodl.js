const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const API_KEY = "f810244328efffe65edb02e899789cdc1b5303156dd950a644a6f2637ce564f0";
const BASE_URL = "https://haji-mix.up.railway.app/api/autodl";

module.exports.config = {
  name: "autodownload",
  version: "1.0.0",
  credits: "Vern",
  description: "Auto-download any video from YouTube, Facebook, TikTok links",
  eventType: ["message", "message_reply"]
};

module.exports.run = async function ({ api, event }) {
  const { body, threadID, messageID } = event;
  if (!body) return;

  // Check for common video URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = body.match(urlRegex);

  if (!matches) return;

  for (const url of matches) {
    // Only process links from known platforms
    if (!/(tiktok\.com|facebook\.com|fb\.watch|youtube\.com|youtu\.be|instagram\.com|x\.com|twitter\.com)/i.test(url)) continue;

    // Send thinking message
    api.sendMessage(`📽️ Processing video link...\n🔗 ${url}`, threadID, messageID);

    try {
      const res = await axios.get(BASE_URL, {
        params: {
          url: url,
          stream: true,
          api_key: API_KEY
        }
      });

      const video = res.data?.result;
      if (!video || !video.url) {
        return api.sendMessage("❌ Failed to fetch video from link.", threadID, messageID);
      }

      const fileName = `${Date.now()}_video.mp4`;
      const filePath = path.join(__dirname, "cache", fileName);

      const videoRes = await axios({
        method: "GET",
        url: video.url,
        responseType: "stream"
      });

      const writer = fs.createWriteStream(filePath);
      videoRes.data.pipe(writer);

      writer.on("finish", () => {
        const fileSize = fs.statSync(filePath).size;
        if (fileSize > 25 * 1024 * 1024) {
          fs.unlinkSync(filePath);
          return api.sendMessage("⚠️ Video is too large to send (over 25MB).", threadID, messageID);
        }

        const message = {
          body: `✅ Video downloaded from:\n🔗 ${url}`,
          attachment: fs.createReadStream(filePath)
        };

        api.sendMessage(message, threadID, () => {
          fs.unlinkSync(filePath);
        }, messageID);
      });

      writer.on("error", (err) => {
        console.error("Download error:", err);
        api.sendMessage("❌ Error saving video.", threadID, messageID);
      });

    } catch (err) {
      console.error("AutoDL Error:", err.message);
      api.sendMessage(`❌ Failed to download video.\n${err.message}`, threadID, messageID);
    }
  }
};