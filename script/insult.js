const axios = require('axios');

module.exports.config = {
  name: "insult",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Get a random insult using the Ace API.",
  usage: "/insult",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Fun"
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  try {
    // Send loading message first
    const waitMsg = `════『 𝗜𝗡𝗦𝗨𝗟𝗧 』════\n\n💢 Fetching a random insult...\nPlease wait a moment.`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Ace Insult API
    const apiUrl = "https://ace-rest-api.onrender.com/api/insult";
    const response = await axios.get(apiUrl);

    // Try to get the insult data from the response
    const data = response.data?.result || response.data;
    if (!data || typeof data !== "string") {
      return api.sendMessage(
        `⚠️ Unable to fetch an insult.`, threadID, messageID
      );
    }

    let resultMsg = `════『 𝗜𝗡𝗦𝗨𝗟𝗧 』════\n\n${data}\n\n> Powered by Ace Insult API`;

    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in insult command:', error.message || error);

    const errorMessage = `════『 𝗜𝗡𝗦𝗨𝗟𝗧 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to fetch an insult.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};