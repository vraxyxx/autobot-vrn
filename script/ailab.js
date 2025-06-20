const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "ailab",
  description: "Generate AI image using Haji-Mix AILab",
  author: "Vern",
  usage: "ailab <your prompt>",
  cooldown: 5,

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(" ").trim();

    if (!prompt) {
      return sendMessage(senderId, {
        text: "❌ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝗽𝗿𝗼𝗺𝗽𝘁.\n\nExample: ailab cat twerking"
      }, pageAccessToken);
    }

    try {
      await sendMessage(senderId, {
        text: "⌛ 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗶𝗻𝗴 𝗮𝗿𝘁𝘄𝗼𝗿𝗸, 𝗽𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁..."
      }, pageAccessToken);

      const apiUrl = `https://haji-mix.up.railway.app/api/ailab?prompt=${encodeURIComponent(prompt)}&api_key=48eb5b9082471e96afe7b11ea62e6c32bd595fbad9ca43092d900ae8fe547da8`;
      const response = await axios.get(apiUrl);

      const imageUrl = response?.data?.result;

      if (!imageUrl) {
        throw new Error("No result returned from API.");
      }

      await sendMessage(senderId, {
        attachment: {
          type: "image",
          payload: {
            url: imageUrl
          }
        }
      }, pageAccessToken);

    } catch (err) {
      console.error("❌ Ailab error:", err.message);
      await sendMessage(senderId, {
        text: `❌ Failed to generate image.\nReason: ${err.message || "Unknown error"}`
      }, pageAccessToken);
    }
  }
};
