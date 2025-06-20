const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "aibooru",
  description: "Fetch random Aibooru AI art image (NSFW/SFW based on config)",
  author: "Vern",
  usage: "aibooru",
  cooldown: 5,

  async execute(senderId, args, pageAccessToken) {
    try {
      await sendMessage(senderId, {
        text: "🖼️ 𝗙𝗲𝘁𝗰𝗵𝗶𝗻𝗴 𝗿𝗮𝗻𝗱𝗼𝗺 𝗔𝗜𝗯𝗼𝗼𝗿𝘂 𝗶𝗺𝗮𝗴𝗲, 𝗽𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁..."
      }, pageAccessToken);

      const apiUrl = `https://haji-mix.up.railway.app/api/aibooru?stream=true&api_key=48eb5b9082471e96afe7b11ea62e6c32bd595fbad9ca43092d900ae8fe547da8`;

      const response = await axios.get(apiUrl);
      const imageUrl = response?.data?.url;

      if (!imageUrl) {
        return sendMessage(senderId, {
          text: "❌ No image found. Please try again later."
        }, pageAccessToken);
      }

      await sendMessage(senderId, {
        attachment: {
          type: "image",
          payload: { url: imageUrl }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error("❌ Error in Aibooru command:", error.message);
      await sendMessage(senderId, {
        text: `❌ Failed to retrieve image. Error: ${error.message || "Unknown error"}`
      }, pageAccessToken);
    }
  }
};
