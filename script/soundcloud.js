const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "soundcloud",
  description: "Download music from SoundCloud by title",
  author: "Vern",
  usage: "soundcloud <song title>",
  cooldown: 5,

  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      return sendMessage(senderId, {
        text: "🎧 Please enter the SoundCloud song title.\n\nExample: soundcloud long live"
      }, pageAccessToken);
    }

    const query = args.join(" ");
    const apiUrl = `https://haji-mix.up.railway.app/api/soundcloud?title=${encodeURIComponent(query)}&api_key=48eb5b9082471e96afe7b11ea62e6c32bd595fbad9ca43092d900ae8fe547da8`;

    try {
      // Fetch song data
      const response = await axios.get(apiUrl);
      const result = response.data.result;

      if (!result || !result.audio || !result.title) {
        return sendMessage(senderId, {
          text: `❌ No results found for "${query}".`
        }, pageAccessToken);
      }

      // Send song details
      const message = `🎶 𝗧𝗶𝘁𝗹𝗲: ${result.title}\n👤 𝗔𝗿𝘁𝗶𝘀𝘁: ${result.artist}\n⏱️ 𝗗𝘂𝗿𝗮𝘁𝗶𝗼𝗻: ${result.duration || "N/A"}`;
      await sendMessage(senderId, { text: message }, pageAccessToken);

      // Send thumbnail if available
      if (result.thumbnail) {
        await sendMessage(senderId, {
          attachment: {
            type: "image",
            payload: { url: result.thumbnail }
          }
        }, pageAccessToken);
      }

      // Send audio
      await sendMessage(senderId, {
        attachment: {
          type: "audio",
          payload: { url: result.audio }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error("❌ Error in soundcloud command:", error.message || error);
      return sendMessage(senderId, {
        text: `❌ Failed to fetch SoundCloud song.\nReason: ${error.message || "Unknown error"}`
      }, pageAccessToken);
    }
  }
};
