const axios = require('axios');

module.exports.config = {
  name: "uptime",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Get bot uptime statistics using the Kaiz API.",
  usage: "/uptime",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Utility"
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  // Optional: You can make these dynamic by accepting args or from config
  const instag = "verxpogi";
  const ghub = "https://github.com/vernesg";
  const fb = "https://www.facebook.com/vern.23x";
  const hours = "24 hours";
  const minutes = "60 minutes";
  const seconds = "60 seconds";
  const botname = "vernx";
  const apikey = "4fe7e522-70b7-420b-a746-d7a23db49ee5";

  try {
    // Loading message
    await api.sendMessage("⏳ Fetching uptime statistics...", threadID, messageID);

    const apiUrl = "https://kaiz-apis.gleeze.com/api/uptime";
    const response = await axios.get(apiUrl, {
      params: {
        instag,
        ghub,
        fb,
        hours,
        minutes,
        seconds,
        botname,
        apikey
      }
    });

    const data = response.data;
    // You may want to format the response for your bot
    let resultMsg = `════『 𝗕𝗢𝗧 𝗨𝗣𝗧𝗜𝗠𝗘 』════\n\n`;

    if (data && typeof data === "object") {
      for (const [key, value] of Object.entries(data)) {
        resultMsg += `• ${key}: ${value}\n`;
      }
    } else {
      resultMsg += "⚠️ Unable to parse uptime data.";
    }

    resultMsg += `\n> Powered by Kaiz Uptime API`;

    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in uptime command:', error.message || error);

    const errorMessage = `════『 𝗨𝗣𝗧𝗜𝗠𝗘 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to retrieve uptime statistics.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};