const axios = require('axios');

module.exports.config = {
  name: "cdp",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Get a random Capcut Template (CDP) using the Ace API.",
  usage: "/cdp",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Fun"
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  try {
    // Send loading message
    const waitMsg = `════『 𝗖𝗔𝗣𝗖𝗨𝗧 𝗧𝗘𝗠𝗣𝗟𝗔𝗧𝗘 』════\n\n` +
                    `🔄 Fetching a random Capcut template...\nPlease wait a moment.`;
    await api.sendMessage(waitMsg, threadID);

    // Request from API
    const apiUrl = "https://ace-rest-api.onrender.com/api/cdp";
    const response = await axios.get(apiUrl);
    const data = response.data?.result || response.data;

    // Validation
    if (!data || !data.url || !data.title) {
      return api.sendMessage("⚠️ No valid template found. Try again later.", threadID, messageID);
    }

    // Build response message
    let resultMsg = `════『 𝗖𝗔𝗣𝗖𝗨𝗧 𝗧𝗘𝗠𝗣𝗟𝗔𝗧𝗘 』════\n\n`;
    resultMsg += `📌 Title: ${data.title}\n`;
    if (data.author) resultMsg += `👤 Author: ${data.author}\n`;
    if (data.views) resultMsg += `👁️ Views: ${data.views}\n`;
    if (data.likes) resultMsg += `❤️ Likes: ${data.likes}\n`;
    resultMsg += `🔗 Link: ${data.url}\n`;
    if (data.preview) resultMsg += `🎞️ Preview: ${data.preview}\n`;
    resultMsg += `\n🚀 Powered by Ace CDP API`;

    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error("❌ CDP command error:", error);

    const errMsg = `════『 𝗖𝗗𝗣 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
                   `❌ Could not fetch Capcut template.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
                   `> Try again later.`;

    return api.sendMessage(errMsg, threadID, messageID);
  }
};
