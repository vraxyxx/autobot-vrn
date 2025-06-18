const axios = require('axios');

module.exports.config = {
  name: "growagarden",
  version: "1.0.0",
  role: 0,
  credits: "vraxyxx",
  description: "Grow a virtual garden using the Ferdev API.",
  usage: "/growagarden",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Fun"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  try {
    // Send loading message first
    const waitMsg = `════『 𝗚𝗥𝗢𝗪 𝗔 𝗚𝗔𝗥𝗗𝗘𝗡 』════\n\n` +
      `🌱 Planting your virtual garden...\nPlease wait a moment...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Grow a Garden API
    const apiUrl = "https://api.ferdev.my.id/internet/growagarden";
    const response = await axios.get(apiUrl);

    // Prefer result field, fallback to other common fields or stringify
    const result = response.data?.result || response.data?.response || response.data?.answer || JSON.stringify(response.data);

    let resultMsg = `════『 𝗚𝗥𝗢𝗪 𝗔 𝗚𝗔𝗥𝗗𝗘𝗡 』════\n\n`;
    resultMsg += `🌱 Result:\n${result}\n\n`;
    resultMsg += `> Powered by Ferdev API`;

    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in growagarden command:', error.message || error);

    const errorMessage = `════『 𝗚𝗥𝗢𝗪 𝗔 𝗚𝗔𝗥𝗗𝗘𝗡 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to grow your garden.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};