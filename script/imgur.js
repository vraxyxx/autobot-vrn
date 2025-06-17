const axios = require("axios");

module.exports.config = {
  name: "imgur",
  version: "1.0",
  credits: "vern", // Do not change
  description: "Convert replied image to Imgur JPG link",
  usage: "Reply to an image with: imgur",
  cooldown: 5,
  permissions: [0],
  commandCategory: "image",
};

module.exports.run = async function ({ api, event }) {
  const { messageReply, threadID, messageID } = event;

  // Require user to reply to an image
  if (!messageReply || !messageReply.attachments || messageReply.attachments[0].type !== "photo") {
    return api.sendMessage(
      `❌ | Please reply to an image to convert it to Imgur JPG.`,
      threadID,
      messageID
    );
  }

  const imageUrl = messageReply.attachments[0].url;

  // Notify processing
  api.sendMessage("🖼️ | Uploading image to Imgur...", threadID, messageID);

  try {
    const apiUrl = `https://kaiz-apis.gleeze.com/api/imgur?url=${encodeURIComponent(imageUrl)}&apikey=4fe7e522-70b7-420b-a746-d7a23db49ee5`;
    const response = await axios.get(apiUrl);

    const imgurLink = response?.data?.url || response?.data?.data?.url;

    if (!imgurLink) {
      throw new Error("Imgur response did not contain a valid URL.");
    }

    return api.sendMessage({
      body: `✅ | Uploaded Successfully:\n\n${imgurLink}`
    }, threadID, messageID);

  } catch (error) {
    console.error("❌ Error uploading to Imgur:", error);
    return api.sendMessage(
      `❌ | Failed to upload image to Imgur.\nReason: ${error.message || "Unknown error"}`,
      threadID,
      messageID
    );
  }
};
