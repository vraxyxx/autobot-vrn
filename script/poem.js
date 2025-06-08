const axios = require('axios');

module.exports.config = {
  name: "poem",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Get a random poem using the Ace API.",
  usage: "/poem",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Fun"
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  try {
    // Send loading message first
    const waitMsg = `════『 𝗣𝗢𝗘𝗠 』════\n\n📖 Fetching a random poem...\nPlease wait a moment.`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Ace Poem API
    const apiUrl = "https://ace-rest-api.onrender.com/api/poem";
    const response = await axios.get(apiUrl);

    // Try to get the poem data from the response
    const data = response.data?.result || response.data;
    if (!data || (!data.title && !data.poem && !data.author)) {
      return api.sendMessage(
        `⚠️ Unable to fetch a poem.`, threadID, messageID
      );
    }

    let resultMsg = `════『 𝗣𝗢𝗘𝗠 』════\n\n`;
    if (data.title) resultMsg += `• Title: ${data.title}\n`;
    if (data.author) resultMsg += `• Author: ${data.author}\n`;
    if (data.poem) resultMsg += `\n${data.poem}\n`;
    resultMsg += `\n> Powered by Ace Poem API`;

    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in poem command:', error.message || error);

    const errorMessage = `════『 𝗣𝗢𝗘𝗠 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to fetch a poem.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};