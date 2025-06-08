const axios = require('axios');

module.exports.config = {
  name: "fbtoken",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Get Facebook token info using the Haji-Mix API.",
  usage: "/fbtoken <access_token>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Utility"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const token = args.join(' ').trim();
  const prefix = "/"; // Change if your bot uses a dynamic prefix

  if (!token) {
    const usageMessage = `════『 𝗙𝗕 𝗧𝗢𝗞𝗘𝗡 』════\n\n` +
      `⚠️ Please provide a Facebook access token.\n\n` +
      `📌 Usage: ${prefix}fbtoken <access_token>\n` +
      `💬 Example: ${prefix}fbtoken EAAJ...ZCfZBQZDZD\n\n` +
      `> Powered by Haji-Mix API`;
    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗙𝗕 𝗧𝗢𝗞𝗘𝗡 』════\n\n` +
      `🔍 Checking token info...\nPlease wait a moment.`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Haji-Mix fbtoken API
    const apiUrl = "https://haji-mix.up.railway.app/api/fbtoken";
    const response = await axios.get(apiUrl, {
      params: { token }
    });

    let resultMsg = `════『 𝗙𝗕 𝗧𝗢𝗞𝗘𝗡 』════\n\n`;

    if (response.data && typeof response.data === "object") {
      for (const [key, value] of Object.entries(response.data)) {
        resultMsg += `• ${key}: ${value}\n`;
      }
    } else if (typeof response.data === "string") {
      resultMsg += response.data;
    } else {
      resultMsg += "⚠️ Unable to retrieve token details or invalid response from API.";
    }

    resultMsg += `\n\n> Powered by Haji-Mix API`;

    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in fbtoken command:', error.message || error);

    const errorMessage = `════『 𝗙𝗕 𝗧𝗢𝗞𝗘𝗡 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to check token.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};