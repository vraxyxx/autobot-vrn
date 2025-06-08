const axios = require('axios');

module.exports.config = {
  name: "sp",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Search for a song using the Rapido Zetsu API (Spotify).",
  usage: "/sp <song title>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Music"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(' ').trim();
  const prefix = "/"; // Change if your bot uses a dynamic prefix

  if (!query) {
    const usageMessage = `════『 𝗦𝗣𝗢𝗧𝗜𝗙𝗬 𝗦𝗘𝗔𝗥𝗖𝗛 』════\n\n` +
      `⚠️ Please provide a song title to search.\n\n` +
      `📌 Usage: ${prefix}sp <song title>\n` +
      `💬 Example: ${prefix}sp night changes\n\n` +
      `> Powered by Rapido Zetsu API`;
    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗦𝗣𝗢𝗧𝗜𝗙𝗬 𝗦𝗘𝗔𝗥𝗖𝗛 』════\n\n` +
      `🔍 Searching for: "${query}"\nPlease wait a moment.`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Rapido Zetsu Spotify API
    const apiUrl = "https://rapido.zetsu.xyz/api/sp";
    const response = await axios.get(apiUrl, {
      params: { query }
    });

    let resultMsg = `════『 𝗦𝗣𝗢𝗧𝗜𝗙𝗬 𝗦𝗘𝗔𝗥𝗖𝗛 』════\n\n`;

    if (response.data && typeof response.data === "object") {
      // Try to display all relevant information
      if (response.data.title) resultMsg += `🎵 Title: ${response.data.title}\n`;
      if (response.data.artist) resultMsg += `👤 Artist: ${response.data.artist}\n`;
      if (response.data.album) resultMsg += `💿 Album: ${response.data.album}\n`;
      if (response.data.release_date) resultMsg += `📅 Release: ${response.data.release_date}\n`;
      if (response.data.duration) resultMsg += `⏱ Duration: ${response.data.duration}\n`;
      if (response.data.url) resultMsg += `🔗 Listen: ${response.data.url}\n`;
      if (response.data.preview_url) resultMsg += `▶️ Preview: ${response.data.preview_url}\n`;
      if (response.data.explicit !== undefined) resultMsg += `🚨 Explicit: ${response.data.explicit ? "Yes" : "No"}\n`;
      if (response.data.cover) {
        // Send with cover image attachment
        const imgRes = await axios.get(response.data.cover, { responseType: "stream" });
        return api.sendMessage({
          body: resultMsg + `\n> Powered by Rapido Zetsu`,
          attachment: imgRes.data
        }, threadID, messageID);
      }
    } else if (typeof response.data === "string") {
      resultMsg += response.data;
    } else {
      resultMsg += "⚠️ No results found or invalid response from API.";
    }

    resultMsg += `\n> Powered by Rapido Zetsu`;
    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in sp command:', error.message || error);

    const errorMessage = `════『 𝗦𝗣𝗢𝗧𝗜𝗙𝗬 𝗦𝗘𝗔𝗥𝗖𝗛 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to search for song.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};