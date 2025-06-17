const axios = require("axios");

module.exports.config = {
  name: "removebg",
  version: "1.0",
  credits: "vern", // Do not change
  description: "Remove image background",
  usage: "Reply to an image with: removebg",
  cooldown: 5,
  permissions: [0],
  commandCategory: "image",
};

module.exports.run = async function ({ api, event }) {
  const { messageReply, threadID, messageID } = event;

  // Check if user replied to an image
  if (!messageReply || !messageReply.attachments || messageReply.attachments[0].type !== "photo") {
    return api.sendMessage(
      `❌ | Please reply to an image to remove its background.`,
      threadID,
      messageID
    );
  }

  const imageUrl = messageReply.attachments[0].url;

  // Notify processing
  api.sendMessage("⌛ | Removing background, please wait...", threadID, messageID);

  try {
    const apiUrl = `https://rapido.zetsu.xyz/api/remove-background?imageUrl=${encodeURIComponent(imageUrl)}`;
    const response = await axios.get(apiUrl);
    const resultUrl = response.data?.result;

    if (resultUrl) {
      return api.sendMessage({
        body: "✅ | Background removed successfully!",
        attachment: await global.utils.getStreamFromURL(resultUrl)
      }, threadID);
    } else {
      return api.sendMessage(
        `❌ | Failed to remove background.\nReason: ${response.data?.message || 'Unknown error'}`,
        threadID
      );
    }

  } catch (err) {
    console.error("Error removing background:", err);
    return api.sendMessage(
      "❌ | An error occurred while processing the image. Please try again later.",
      threadID
    );
  }
};
