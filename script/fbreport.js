const axios = require('axios');

module.exports.config = {
  name: "fbreport",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Get a random Facebook report tip using the Haji Mix API.",
  usage: "/fbreport",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Fun"
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  try {
    // Send loading message first
    const waitMsg = `════『 𝗙𝗕𝗥𝗘𝗣𝗢𝗥𝗧 』════\n\n` +
      `📄 Fetching a random Facebook report tip...\nPlease wait a moment.`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Haji Mix FB Report API
    const apiUrl = "https://haji-mix.up.railway.app/api/fbreport";
    const response = await axios.get(apiUrl);

    let resultMsg = `════『 𝗙𝗕𝗥𝗘𝗣𝗢𝗥𝗧 』════\n\n`;

    // Try to parse common result fields or fall back to string
    if (response.data && (response.data.result || response.data.tip || response.data.message)) {
      resultMsg += `${response.data.result || response.data.tip || response.data.message}`;
    } else if (typeof response.data === "string") {
      resultMsg += response.data;
    } else {
      resultMsg += "⚠️ Unable to fetch FB report tip.";
    }

    resultMsg += `\n\n> Powered by Haji Mix FB Report API`;

    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in fbreport command:', error.message || error);

    const errorMessage = `════『 𝗙𝗕𝗥𝗘𝗣𝗢𝗥𝗧 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to fetch FB report tip.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};