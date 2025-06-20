const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "onlytik",
  description: "Fetch a random TikTok video using Haji-Mix API",
  author: "Vern",
  usage: "onlytik",
  cooldown: 5,

  async execute(senderId, args, pageAccessToken) {
    try {
      await sendMessage(senderId, {
        text: "📽️ 𝗙𝗲𝘁𝗰𝗵𝗶𝗻𝗴 𝗮 𝗧𝗶𝗸𝗧𝗼𝗸 𝘃𝗶𝗱𝗲𝗼, 𝗽𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁..."
      }, pageAccessToken);

      const apiUrl = `https://haji-mix.up.railway.app/api/onlytik?stream=true&api_key=48eb5b9082471e96afe7b11ea62e6c32bd595fbad9ca43092d900ae8fe547da8`;
      const response = await axios.get(apiUrl);

      const videoUrl = response?.data?.url;

      if (!videoUrl) {
        return sendMessage(senderId, {
          text: "❌ No video found. Please try again."
        }, pageAccessToken);
      }

      await sendMessage(senderId, {
        attachment: {
          type: "video",
          payload: {
            url: videoUrl
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error("❌ Error fetching TikTok video:", error.message);
      await sendMessage(senderId, {
        text: `❌ Failed to get TikTok video.\nReason: ${error.message || "Unknown error"}`
      }, pageAccessToken);
    }
  }
};
