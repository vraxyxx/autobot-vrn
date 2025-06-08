const axios = require('axios');

module.exports.config = {
  name: "randgore",
  version: "1.0.0",
  role: 2, // Only admin
  credits: "vern",
  description: "Get a random NSFW gore image using the Zetsu API. ⚠️ WARNING: This command sends explicit gore content. Admins only.",
  usage: "/randgore",
  prefix: true,
  cooldowns: 5,
  commandCategory: "NSFW"
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  try {
    // Send loading message first
    const waitMsg = `════『 𝗥𝗔𝗡𝗗𝗚𝗢𝗥𝗘 』════\n\n` +
      `🩸 Fetching a random gore image...\nPlease wait a moment.`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Zetsu RandGore API
    const apiUrl = "https://api.zetsu.xyz/randgore";
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
        `⚠️ Unable to fetch gore image.`, threadID, messageID
      );
    }

    // Send the image as an attachment
    const imageRes = await axios.get(imageUrl, { responseType: "stream" });

    return api.sendMessage({
      body: `════『 𝗥𝗔𝗡𝗗𝗚𝗢𝗥𝗘 』════\n\n⚠️ WARNING: This is explicit gore content. Admin only.\n\n> Powered by Zetsu`,
      attachment: imageRes.data
    }, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in randgore command:', error.message || error);

    const errorMessage = `════『 𝗥𝗔𝗡𝗗𝗚𝗢𝗥𝗘 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to fetch gore image.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};