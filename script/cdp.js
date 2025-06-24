const axios = require("axios");

module.exports.config = {
  name: "cdp",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["capcut", "capcuttemp"],
  description: "Get a random CapCut Template",
  usage: "cdp",
  credits: "Vern",
  cooldown: 3
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  try {
    // Send loading message
    await api.sendMessage("🔄 Fetching a random CapCut template...", threadID, messageID);

    const res = await axios.get("https://ace-rest-api.onrender.com/api/cdp");
    const data = res.data?.result || res.data;

    if (!data || !data.title || !data.url) {
      return api.sendMessage("⚠️ Failed to fetch CapCut template. Try again later.", threadID, messageID);
    }

    let msg = `🎬 𝗖𝗮𝗽𝗖𝘂𝘁 𝗧𝗲𝗺𝗽𝗹𝗮𝘁𝗲\n\n`;
    msg += `📌 Title: ${data.title}\n`;
    if (data.author) msg += `👤 Author: ${data.author}\n`;
    if (data.views) msg += `👁️ Views: ${data.views}\n`;
    if (data.likes) msg += `❤️ Likes: ${data.likes}\n`;
    msg += `🔗 Link: ${data.url}`;
    if (data.preview) msg += `\n🖼️ Preview: ${data.preview}`;

    return api.sendMessage(msg, threadID, messageID);

  } catch (err) {
    console.error("❌ CDP error:", err.message || err);
    return api.sendMessage("❌ Error fetching CapCut template. Please try again later.", threadID, messageID);
  }
};
