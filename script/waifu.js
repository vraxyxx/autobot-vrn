const axios = require('axios');

module.exports.config = {
  name: "waifu",
  version: "1.0.0",
  credits: "original & converted by you",
  description: "Get random waifu images from the waifu.pics API.",
  hasPrefix: false,
  cooldown: 5,
  aliases: ["waifupic", "waifuu"],
};

module.exports.run = async function ({ api, event, args }) {
  try {
    api.sendMessage("✨ Fetching a random waifu image...", event.threadID, async () => {
      try {
        const response = await axios.get('https://api.waifu.pics/sfw/waifu');
        const waifuUrl = response.data.url;

        if (!waifuUrl) {
          return api.sendMessage("❌ No waifu image found.", event.threadID, event.messageID);
        }

        const imageStream = await axios.get(waifuUrl, { responseType: 'stream' });

        return api.sendMessage({
          body: "Here is your waifu 💖",
          attachment: imageStream.data
        }, event.threadID);
      } catch (err) {
        console.error("Waifu Command Error:", err);
        return api.sendMessage("❌ Failed to fetch waifu image.", event.threadID, event.messageID);
      }
    });
  } catch (e) {
    api.sendMessage(e.message, event.threadID, event.messageID);
  }
};