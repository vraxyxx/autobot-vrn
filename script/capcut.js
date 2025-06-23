const axios = require("axios");

module.exports.config = {
  name: "capcut",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Fetch CapCut template details using a link",
  usage: "/capcut <url>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Tools"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const url = args[0];

  if (!url || !url.includes("capcut.com")) {
    return api.sendMessage("❌ Please provide a valid CapCut link.", threadID, messageID);
  }

  const apiUrl = `https://ace-rest-api.onrender.com/api/capcut?url=${encodeURIComponent(url)}`;

  try {
    const response = await axios.get(apiUrl);
    const data = response.data?.result;

    if (!data || !data.title || !data.link) {
      return api.sendMessage("⚠️ Failed to fetch CapCut details.", threadID, messageID);
    }

    let msg = `════『 𝗖𝗔𝗣𝗖𝗨𝗧 𝗜𝗡𝗙𝗢 』════\n\n`;
    msg += `🎬 Title: ${data.title}\n`;
    if (data.author) msg += `👤 Author: ${data.author}\n`;
    if (data.views) msg += `👁️ Views: ${data.views}\n`;
    if (data.likes) msg += `❤️ Likes: ${data.likes}\n`;
    msg += `🔗 Link: ${data.link}\n`;
    if (data.preview) msg += `🖼️ Preview: ${data.preview}\n`;

    msg += `\n Thanks for using Vern autobo-site`;

    return api.sendMessage(msg, threadID, messageID);
  } catch (err) {
    console.error("❌ Error in capcut command:", err.message || err);
    return api.sendMessage(
      `🚫 Failed to fetch CapCut info.\nReason: ${err.response?.data?.message || err.message || "Unknown error"}`,
      threadID,
      messageID
    );
  }
};
