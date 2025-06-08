const axios = require('axios');

module.exports.config = {
  name: "wuwa",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Get random Wuthering Waves content using the Rapido Zetsu API.",
  usage: "/wuwa",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Fun"
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  try {
    // Send loading message first
    const waitMsg = `════『 𝗪𝗨𝗪𝗔 』════\n\n🎲 Fetching random Wuthering Waves content...\nPlease wait a moment.`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Rapido Zetsu wuwa API
    const apiUrl = "https://rapido.zetsu.xyz/api/wuwa";
    const response = await axios.get(apiUrl);

    let resultMsg = `════『 𝗪𝗨𝗪𝗔 』════\n\n`;
    if (response.data) {
      // Try to show info and image if available
      if (response.data.title) resultMsg += `📝 ${response.data.title}\n\n`;
      if (response.data.description) resultMsg += `${response.data.description}\n\n`;
      if (response.data.info) resultMsg += `${response.data.info}\n\n`;

      if (response.data.image) {
        // Send with image attachment
        const imgRes = await axios.get(response.data.image, { responseType: "stream" });
        return api.sendMessage({
          body: resultMsg + `> Powered by Rapido Zetsu`,
          attachment: imgRes.data
        }, threadID, messageID);
      }
    } else {
      resultMsg += "⚠️ Unable to fetch Wuthering Waves content at this time.";
    }

    resultMsg += `> Powered by Rapido Zetsu`;
    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in wuwa command:', error.message || error);

    const errorMessage = `════『 𝗪𝗨𝗪𝗔 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to fetch Wuthering Waves content.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};