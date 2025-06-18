const axios = require('axios');

module.exports.config = {
  name: "spotify",
  version: "1.0.0",
  role: 0,
  credits: "vraxyxx",
  description: "Search for a song on Spotify using the Ferdev API.",
  usage: "/spotify <song name or query>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Music"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(' ').trim();
  const prefix = "/"; // Adjust if your bot uses a different prefix

  // No query provided
  if (!query) {
    const usageMessage = `════『 𝗦𝗣𝗢𝗧𝗜𝗙𝗬 』════\n\n` +
      `⚠️ Please provide a song name or search query.\n\n` +
      `📌 Usage: ${prefix}spotify <song name or query>\n` +
      `💬 Example: ${prefix}spotify love story\n\n` +
      `> Thank you for using Spotify Search!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗦𝗣𝗢𝗧𝗜𝗙𝗬 』════\n\n` +
      `🔎 Searching Spotify for: "${query}"\nPlease wait a moment...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Spotify Search API
    const apiUrl = "https://api.ferdev.my.id/search/spotify";
    const response = await axios.get(apiUrl, {
      params: {
        query: query
      }
    });

    const results = response.data?.result || [];
    if (!Array.isArray(results) || results.length === 0) {
      return api.sendMessage("❌ No results found for your search.", threadID, messageID);
    }

    // Send up to 5 song results (adjust as desired)
    let resultMsg = `════『 𝗦𝗣𝗢𝗧𝗜𝗙𝗬 』════\n\n`;
    resultMsg += `🔎 Results for: ${query}\n\n`;
    results.slice(0, 5).forEach((song, idx) => {
      resultMsg += `${idx + 1}. ${song.title || 'Unknown Title'} by ${song.artists?.join(', ') || 'Unknown Artist'}\n`;
      resultMsg += `🔗 ${song.url || 'No URL'}\n\n`;
    });
    resultMsg += `> Powered by Ferdev API`;

    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in spotify command:', error.message || error);

    const errorMessage = `════『 𝗦𝗣𝗢𝗧𝗜𝗙𝗬 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to search Spotify.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};