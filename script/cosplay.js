const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const API_KEY = "f810244328efffe65edb02e899789cdc1b5303156dd950a644a6f2637ce564f0";
const API_URL = "https://haji-mix.up.railway.app/api/cosplay";

module.exports.config = {
  name: "cosplay",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["cos", "cosvid"],
  usage: "cosplay",
  description: "Send a random cosplay video",
  credits: "Vern",
  cooldown: 6
};

module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  // Step 1: Human-like message
  api.sendMessage("🧙‍♀️ Summoning a cosplay video...\n⏳ Please wait a moment...", threadID, messageID);

  try {
    // Step 2: Fetch cosplay data
    const res = await axios.get(API_URL, {
      params: {
        limit: 10,
        page: 1,
        stream: true,
        api_key: API_KEY
      }
    });

    const videoList = res.data?.result;
    if (!Array.isArray(videoList) || videoList.length === 0) {
      return api.sendMessage("❌ No cosplay videos found at the moment. Please try again later.", threadID, messageID);
    }

    // Step 3: Pick one random video
    const chosen = videoList[Math.floor(Math.random() * videoList.length)];
    if (!chosen || !chosen.url) {
      return api.sendMessage("⚠️ Invalid video data received.", threadID, messageID);
    }

    // Step 4: Download the video stream
    const fileName = `${Date.now()}_cosplay.mp4`;
    const filePath = path.join(__dirname, "cache", fileName);

    const videoStream = await axios({
      method: "GET",
      url: chosen.url,
      responseType: "stream"
    });

    const writer = fs.createWriteStream(filePath);
    videoStream.data.pipe(writer);

    writer.on("finish", () => {
      const fileSize = fs.statSync(filePath).size;
      if (fileSize > 25 * 1024 * 1024) {
        fs.unlinkSync(filePath);
        return api.sendMessage("⚠️ The cosplay video is too large to send (>25MB).", threadID, messageID);
      }

      // Step 5: Send it like a human
      const message = {
        body: `✨ Here's your random cosplay video!\n🧝 Enjoy the vibes 💫`,
        attachment: fs.createReadStream(filePath)
      };

      api.sendMessage(message, threadID, () => {
        fs.unlinkSync(filePath); // Cleanup
      }, messageID);
    });

    writer.on("error", err => {
      console.error("❌ Write stream error:", err);
      api.sendMessage("❌ Error while saving the cosplay video.", threadID, messageID);
    });

  } catch (err) {
    console.error("❌ Cosplay API error:", err.message);
    api.sendMessage(`❌ Failed to fetch cosplay video:\n${err.response?.data?.message || err.message}`, threadID, messageID);
  }
};
