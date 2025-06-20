const axios = require("axios");

module.exports.config = {
  name: "aibooru",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Fetch a random Aibooru AI art image (NSFW/SFW based on config)",
  usage: "/aibooru",
  prefix: true,
  cooldowns: 5,
  commandCategory: "Image"
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  try {
    // Loading message
    const waitMsg = `════『 𝗔𝗜𝗕𝗢𝗢𝗥𝗨 』════\n\n🖼️ Fetching a random Aibooru AI art image...\nPlease wait...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    const apiUrl = `https://haji-mix.up.railway.app/api/aibooru?stream=true&api_key=48eb5b9082471e96afe7b11ea62e6c32bd595fbad9ca43092d900ae8fe547da8`;
    const response = await axios.get(apiUrl);
    const imageUrl = response?.data?.url;

    if (!imageUrl) {
      return api.sendMessage(`❌ No image found. Please try again later.`, threadID, messageID);
    }

    await api.sendMessage({
      attachment: await global.utils.getStreamFromURL(imageUrl)
    }, threadID, messageID);

  } catch (error) {
    console.error("❌ Error in aibooru command:", error.message || error);

    const errorMsg = `════『 𝗔𝗜𝗕𝗢𝗢𝗥𝗨 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to fetch Aibooru image.\nReason: ${error.message || "Unknown error"}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMsg, threadID, messageID);
  }
};
