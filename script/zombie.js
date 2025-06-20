const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "zombie",
  description: "Applies zombie face filter to an image",
  author: "Vern",
  usage: "reply to an image with: zombie",
  cooldown: 5,

  async execute(senderId, args, pageAccessToken, imageUrl, event) {
    // If image URL is not directly passed, try to get it from the reply
    if (!imageUrl && event?.message?.reply_to?.attachments?.[0]?.payload?.url) {
      imageUrl = event.message.reply_to.attachments[0].payload.url;
    }

    if (!imageUrl) {
      return sendMessage(senderId, {
        text: "🧟 Please reply to an image to apply the zombie filter."
      }, pageAccessToken);
    }

    try {
      await sendMessage(senderId, {
        text: "🧟 Applying zombie filter, please wait..."
      }, pageAccessToken);

      const apiUrl = `https://kaiz-apis.gleeze.com/api/zombie?url=${encodeURIComponent(imageUrl)}&apikey=4fe7e522-70b7-420b-a746-d7a23db49ee5`;
      const response = await axios.get(apiUrl);

      const zombieImage = response?.data?.result;
      if (!zombieImage) {
        throw new Error("No result from API.");
      }

      return sendMessage(senderId, {
        attachment: {
          type: "image",
          payload: {
            url: zombieImage
          }
        }
      }, pageAccessToken);

    } catch (err) {
      console.error("❌ Error applying zombie filter:", err.message);
      return sendMessage(senderId, {
        text: `❌ Failed to apply zombie filter.\nReason: ${err.message || "Unknown error"}`
      }, pageAccessToken);
    }
  }
};
