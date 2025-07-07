const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: 'cosplayv2',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['cosplay', 'cosplayvideo'],
  description: "Get a random cosplay video using Haji-Mix API",
  usage: "cosplayv2",
  credits: 'Vern',
  cooldown: 5
};

module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const senderID = event.senderID;
  const apiKey = "f810244328efffe65edb02e899789cdc1b5303156dd950a644a6f2637ce564f0";
  const apiUrl = `https://haji-mix.up.railway.app/api/cosplayv2?api_key=${apiKey}`;

  api.sendMessage("🎬 Fetching a random cosplay video for you...", threadID, async (err, info) => {
    if (err) return;

    try {
      const res = await axios.get(apiUrl);
      const result = res.data?.result;

      let videoUrl = null;
      if (Array.isArray(result) && result.length > 0) {
        const random = result[Math.floor(Math.random() * result.length)];
        videoUrl = typeof random === "string" ? random : random.url || random.video || random.link;
      } else if (typeof result === "string") {
        videoUrl = result;
      }

      if (!videoUrl) {
        return api.editMessage("⚠️ No valid video URL found from the API.", info.messageID);
      }

      const cachePath = path.join(__dirname, "cache");
      await fs.ensureDir(cachePath);
      const fileName = `cosplay_${Date.now()}.mp4`;
      const filePath = path.join(cachePath, fileName);

      const videoRes = await axios({
        method: "GET",
        url: videoUrl,
        responseType: "stream"
      });

      const writer = fs.createWriteStream(filePath);
      videoRes.data.pipe(writer);

      writer.on("finish", async () => {
        const fileSize = fs.statSync(filePath).size;
        if (fileSize > 25 * 1024 * 1024) {
          fs.unlinkSync(filePath);
          return api.editMessage("⚠️ Video too large to send (>25MB).", info.messageID);
        }

        api.getUserInfo(senderID, (err, userInfo) => {
          const userName = userInfo?.[senderID]?.name || "Unknown User";
          const timePH = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });

          const messageData = {
            body: `📹 𝗖𝗢𝗦𝗣𝗟𝗔𝗬 𝗩𝗜𝗗𝗘𝗢\n━━━━━━━━━━━━━━━━━━\n👤 Requested by: ${userName}\n🕰 Time: ${timePH}`,
            attachment: fs.createReadStream(filePath)
          };

          api.sendMessage(messageData, threadID, () => fs.unlinkSync(filePath), info.messageID);
        });
      });

      writer.on("error", (err) => {
        console.error("[cosplayv2] File write error:", err);
        api.editMessage("❌ Failed to save video file locally.", info.messageID);
      });

    } catch (error) {
      console.error("[cosplayv2] API Error:", error.response?.data || error.message);
      api.editMessage("🚫 Failed to fetch cosplay video. Try again later.", info.messageID);
    }
  });
};
