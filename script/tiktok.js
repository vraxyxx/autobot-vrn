const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const API_URL = 'https://rapido.zetsu.xyz/api/tk';

module.exports.config = {
  name: "tiktok",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["tt", "tk"],
  usage: "tiktok [keyword]",
  description: "Fetch a TikTok video by search keyword",
  credits: "Vern",
  cooldown: 5
};

module.exports.run = async function ({ api, event, args }) {
  const query = args.join(" ");
  if (!query) {
    return api.sendMessage("❓ What TikTok video are you looking for?\n\nExample:\ntiktok multo", event.threadID, event.messageID);
  }

  // Inform user it is processing
  api.sendMessage(`🔎 Searching TikTok for: "${query}"\n⏳ Please wait...`, event.threadID, event.messageID);

  try {
    const res = await axios.get(API_URL, {
      params: { search: query }
    });

    const data = res.data?.result;
    if (!data || !data.video) {
      return api.sendMessage("❌ No results found or video is unavailable.", event.threadID, event.messageID);
    }

    const videoUrl = data.video;
    const desc = data.desc || "🎥 TikTok Video";

    const filePath = path.join(__dirname, 'cache', `${Date.now()}_tiktok.mp4`);
    const writer = fs.createWriteStream(filePath);

    const response = await axios({
      url: videoUrl,
      method: 'GET',
      responseType: 'stream'
    });

    response.data.pipe(writer);

    writer.on('finish', () => {
      const message = {
        body: `🎬 ${desc}\n\n📥 From: TikTok\n🔍 Search: "${query}"`,
        attachment: fs.createReadStream(filePath)
      };

      api.sendMessage(message, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
    });

    writer.on('error', (err) => {
      console.error("Write error:", err);
      api.sendMessage("❌ Error downloading video.", event.threadID, event.messageID);
    });

  } catch (err) {
    console.error("API Error:", err.message);
    api.sendMessage("❌ Failed to fetch TikTok video. Try again later.", event.threadID, event.messageID);
  }
};
