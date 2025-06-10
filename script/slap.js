const axios = require('axios');

module.exports.config = {
  name: "slap",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Send a random slap anime image (waifu.pics API).",
  usage: "/slap",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Fun"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  try {
    // Loading message
    const waitMsg = `════『 𝗦𝗟𝗔𝗣 』════\n\n🔄 Fetching a slap image...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Fetch the slap image
    const response = await axios.get('https://api.waifu.pics/sfw/slap');
    const imageUrl = response.data.url;

    // Download the image as a stream
    const imageResponse = await axios.get(imageUrl, { responseType: "stream" });

    // Send the image as an attachment
    return api.sendMessage(
      {
        body: `Here's a slap for you! 🖐\n\n> Powered by waifu.pics`,
        attachment: imageResponse.data
      },
      threadID,
      messageID
    );
  } catch (error) {
    console.error('❌ Error in slap command:', error.message || error);

    const errorMessage =
      `════『 𝗦𝗟𝗔𝗣 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to fetch a slap image.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};