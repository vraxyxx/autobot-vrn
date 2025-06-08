const axios = require('axios');

module.exports.config = {
  name: "animephoto",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Get a random anime photo using the Rapido API.",
  usage: "/animephoto",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Fun"
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  try {
    // Send loading message first
    const waitMsg = `════『 𝗔𝗡𝗜𝗠𝗘 𝗣𝗛𝗢𝗧𝗢 』════\n\n` +
      `🖼️ Fetching a random anime photo...\nPlease wait a moment.`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Rapido Anime Photo API
    const apiUrl = "https://rapido.zetsu.xyz/api/anime-photo";
    const response = await axios.get(apiUrl);

    // Try to get the image URL from the response
    let imageUrl = "";
    if (response.data) {
      if (typeof response.data === "string" && response.data.startsWith("http")) {
        imageUrl = response.data;
      } else if (response.data.url) {
        imageUrl = response.data.url;
      } else if (response.data.result) {
        imageUrl = response.data.result;
      }
    }

    if (!imageUrl) {
      return api.sendMessage(
        `⚠️ Unable to fetch anime photo.`, threadID, messageID
      );
    }

    // Send the image as an attachment
    const imageRes = await axios.get(imageUrl, { responseType: "stream" });

    return api.sendMessage({
      body: `════『 𝗔𝗡𝗜𝗠𝗘 𝗣𝗛𝗢𝗧𝗢 』════\n\nHere's your random anime photo!\n\n> Powered by Rapido`,
      attachment: imageRes.data
    }, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in animephoto command:', error.message || error);

    const errorMessage = `════『 𝗔𝗡𝗜𝗠𝗘 𝗣𝗛𝗢𝗧𝗢 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to fetch anime photo.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};