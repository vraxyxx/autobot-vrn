const axios = require('axios');

module.exports.config = {
  name: "pinterest",
  version: "1.0.0",
  credits: "Vern",
  description: "Searches and streams images from Pinterest",
  hasPrefix: false,
  cooldown: 5,
  aliases: ["pin"],
};

module.exports.run = async function ({ api, event, args }) {
  try {
    let input = args.join(" ");
    if (!input.includes(" - ")) {
      return api.sendMessage("Usage: pinterest <keyword> - <limit>\nExample: pinterest cat - 5", event.threadID, event.messageID);
    }

    const [keyword, limit] = input.split(" - ");
    const count = parseInt(limit.trim());

    if (!keyword || isNaN(count) || count < 1 || count > 30) {
      return api.sendMessage("❌ Please provide a valid keyword and a number between 1–30.\nExample: pinterest anime - 10", event.threadID, event.messageID);
    }

    api.sendMessage(`🔍 Searching "${keyword.trim()}" (${count} images)...`, event.threadID, async () => {
      try {
        const apiUrl = `https://ccprojectsapis.zetsu.xyz/api/pin?title=${encodeURIComponent(keyword.trim())}&count=${count}`;
        const response = await axios.get(apiUrl);
        const images = response.data.data;

        if (!images || images.length === 0) {
          return api.sendMessage(`No results found for "${keyword.trim()}".`, event.threadID, event.messageID);
        }

        for (const url of images.slice(0, count)) {
          const imgStream = await axios.get(url, { responseType: 'stream' });
          await api.sendMessage({
            attachment: imgStream.data
          }, event.threadID);
        }

      } catch (error) {
        console.error("Pinterest stream error:", error);
        api.sendMessage("❌ An error occurred while retrieving or sending images.", event.threadID);
      }
    });
  } catch (err) {
    api.sendMessage(err.message, event.threadID);
  }
};