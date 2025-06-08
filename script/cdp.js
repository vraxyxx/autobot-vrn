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
    // Send loading message first
    const waitMsg = `════『 𝗖𝗔𝗣𝗖𝗨𝗧 𝗧𝗘𝗠𝗣𝗟𝗔𝗧𝗘 』════\n\n` +
      `🔄 Fetching a random Capcut template...\nPlease wait a moment.`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Ace CDP API
    const apiUrl = "https://ace-rest-api.onrender.com/api/cdp";
    const response = await axios.get(apiUrl);

    // Try to get the template data from the response
    const data = response.data?.result || response.data;
    if (!data || !data.title || !data.url) {
      return api.sendMessage(
        `⚠️ Unable to fetch a Capcut template.`, threadID, messageID
      );
    }

    let resultMsg = `════『 𝗖𝗔𝗣𝗖𝗨𝗧 𝗧𝗘𝗠𝗣𝗟𝗔𝗧𝗘 』════\n\n`;
    resultMsg += `• Title: ${data.title}\n`;
    if (data.author) resultMsg += `• Author: ${data.author}\n`;
    if (data.views) resultMsg += `• Views: ${data.views}\n`;
    if (data.likes) resultMsg += `• Likes: ${data.likes}\n`;
    resultMsg += `• URL: ${data.url}\n`;
    if (data.preview) resultMsg += `• Preview: ${data.preview}\n`;
    resultMsg += `\n> Powered by Ace CDP API`;

    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in cdp command:', error.message || error);

    const errorMessage = `════『 𝗖𝗔𝗣𝗖𝗨𝗧 𝗧𝗘𝗠𝗣𝗟𝗔𝗧𝗘 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to fetch Capcut template.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};