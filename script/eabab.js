const axios = require('axios');

module.exports.config = {
  name: "eabab",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Get a random 'eabab' video from Hiroshi API.",
  usage: "/eabab",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Fun"
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  try {
    // Send loading message first
    const waitMsg = `════『 𝗘𝗔𝗕𝗔𝗕 𝗩𝗜𝗗𝗘𝗢 』════\n\n🎬 Fetching a random video...\nPlease wait a moment.`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Hiroshi API for eabab video
    const apiUrl = "https://hiroshi-api.onrender.com/video/eabab";
    const response = await axios.get(apiUrl);

    let resultMsg = `════『 𝗘𝗔𝗕𝗔𝗕 𝗩𝗜𝗗𝗘𝗢 』════\n\n`;
    if (response.data && response.data.url) {
      // Send with video attachment
      const videoRes = await axios.get(response.data.url, { responseType: "stream" });
      return api.sendMessage({
        body: resultMsg + `Here's your random EABAB video!\n\n> Powered by Hiroshi API`,
        attachment: videoRes.data
      }, threadID, messageID);
    } else {
      resultMsg += "⚠️ Unable to fetch EABAB video at this time.";
    }

    resultMsg += `\n> Powered by Hiroshi API`;
    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in eabab command:', error.message || error);

    const errorMessage = `════『 𝗘𝗔𝗕𝗔𝗕 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to fetch EABAB video.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};