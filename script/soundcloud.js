const axios = require("axios");

module.exports.config = {
  name: "soundcloud",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Download music from SoundCloud by title",
  usage: "/soundcloud <song title>",
  prefix: true,
  cooldowns: 5,
  commandCategory: "Music"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(" ").trim();
  const prefix = "/"; // Change if you use a dynamic prefix

  if (!query) {
    const usageMessage = `════『 𝗦𝗢𝗨𝗡𝗗𝗖𝗟𝗢𝗨𝗗 』════\n\n` +
      `🎧 Please enter a SoundCloud song title.\n\n` +
      `📌 Usage: ${prefix}soundcloud <song title>\n` +
      `💬 Example: ${prefix}soundcloud long live\n\n` +
      `> Powered by Vern-Autobot`;
    return api.sendMessage(usageMessage, threadID, messageID);
  }

  const apiUrl = `https://haji-mix.up.railway.app/api/soundcloud?title=${encodeURIComponent(query)}&api_key=48eb5b9082471e96afe7b11ea62e6c32bd595fbad9ca43092d900ae8fe547da8`;

  try {
    // Send loading message
    const waitMsg = `════『 𝗦𝗢𝗨𝗡𝗗𝗖𝗟𝗢𝗨𝗗 』════\n\n🎶 Searching for: "${query}"\nPlease wait...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    const response = await axios.get(apiUrl);
    const result = response.data?.result;

    if (!result || !result.audio || !result.title) {
      return api.sendMessage(`❌ No results found for "${query}".`, threadID, messageID);
    }

    // Send song details
    const detailMsg = `════『 𝗦𝗢𝗨𝗡𝗗𝗖𝗟𝗢𝗨𝗗 』════\n\n` +
      `🎶 𝗧𝗶𝘁𝗹𝗲: ${result.title}\n` +
      `👤 𝗔𝗿𝘁𝗶𝘀𝘁: ${result.artist || "N/A"}\n` +
      `⏱️ 𝗗𝘂𝗿𝗮𝘁𝗶𝗼𝗻: ${result.duration || "N/A"}\n\n` +
      `> Enjoy your music with Vern-Autobot 🎧`;
    await api.sendMessage(detailMsg, threadID);

    // Send thumbnail
    if (result.thumbnail) {
      await api.sendMessage({
        attachment: await global.utils.getStreamFromURL(result.thumbnail)
      }, threadID);
    }

    // Send audio
    await api.sendMessage({
      attachment: await global.utils.getStreamFromURL(result.audio)
    }, threadID);

  } catch (error) {
    console.error("❌ Error in soundcloud command:", error.message || error);
    const errorMsg = `════『 𝗦𝗢𝗨𝗡𝗗𝗖𝗟𝗢𝗨𝗗 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to fetch song.\nReason: ${error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;
    return api.sendMessage(errorMsg, threadID, messageID);
  }
};
