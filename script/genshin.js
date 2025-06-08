const axios = require('axios');

module.exports.config = {
  name: "genshin",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Get a random Genshin Impact image using the Ace API.",
  usage: "/genshin",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Fun"
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  try {
    // Send loading message first
    const waitMsg = `════『 𝗚𝗘𝗡𝗦𝗛𝗜𝗡 』════\n\n` +
      `🖼️ Fetching a random Genshin Impact image...\nPlease wait a moment.`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Ace Genshin API
    const apiUrl = "https://ace-rest-api.onrender.com/api/gensin";
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
        `⚠️ Unable to fetch a Genshin Impact image.`, threadID, messageID
      );
    }

    // Send the image as an attachment
    const imageRes = await axios.get(imageUrl, { responseType: "stream" });

    return api.sendMessage({
      body: `════『 𝗚𝗘𝗡𝗦𝗛𝗜𝗡 』════\n\nHere's your random Genshin Impact image!\n\n> Powered by Ace API`,
      attachment: imageRes.data
    }, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in genshin command:', error.message || error);

    const errorMessage = `════『 𝗚𝗘𝗡𝗦𝗛𝗜𝗡 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to fetch the Genshin Impact image.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};