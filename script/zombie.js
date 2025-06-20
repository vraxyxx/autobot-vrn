const axios = require("axios");

module.exports.config = {
  name: "zombie",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Applies a zombie face filter to an image",
  usage: "Reply to an image with: /zombie",
  prefix: true,
  cooldowns: 5,
  commandCategory: "Image"
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  let imageUrl = null;

  // Try to get image URL from the replied message
  if (event?.messageReply?.attachments?.[0]?.type === "photo") {
    imageUrl = event.messageReply.attachments[0].url;
  }

  if (!imageUrl) {
    const noImageMsg = `🧟 Please reply to an image to apply the zombie filter.`;
    return api.sendMessage(noImageMsg, threadID, messageID);
  }

  try {
    const waitMsg = `════『 𝗭𝗢𝗠𝗕𝗜𝗘 𝗙𝗜𝗟𝗧𝗘𝗥 』════\n\n🧟 Applying zombie effect...\nPlease wait...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    const apiUrl = `https://kaiz-apis.gleeze.com/api/zombie?url=${encodeURIComponent(imageUrl)}&apikey=4fe7e522-70b7-420b-a746-d7a23db49ee5`;
    const response = await axios.get(apiUrl);

    const zombieImage = response?.data?.result;
    if (!zombieImage) throw new Error("No result returned from API.");

    return api.sendMessage({
      attachment: await global.utils.getStreamFromURL(zombieImage)
    }, threadID, messageID);

  } catch (err) {
    console.error("❌ Error in zombie command:", err.message || err);

    const errorMsg = `════『 𝗭𝗢𝗠𝗕𝗜𝗘 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to apply zombie filter.\nReason: ${err.message || "Unknown error"}\n\n` +
      `> Try again with a clear face image.`;
    return api.sendMessage(errorMsg, threadID, messageID);
  }
};
