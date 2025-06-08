const axios = require('axios');

module.exports.config = {
  name: "ytsearch",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Search YouTube videos using the Kaiz API.",
  usage: "/ytsearch <search query>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Utility"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(' ').trim();
  const prefix = "/"; // Change if your bot uses a dynamic prefix

  // No search query provided
  if (!query) {
    const usageMessage = `════『 𝗬𝗧𝗦𝗘𝗔𝗥𝗖𝗛 』════\n\n` +
      `⚠️ Please provide a search term for YouTube videos.\n\n` +
      `📌 Usage: ${prefix}ytsearch <search query>\n` +
      `💬 Example: ${prefix}ytsearch about you\n\n` +
      `> Thank you for using YouTube Search!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗬𝗧𝗦𝗘𝗔𝗥𝗖𝗛 』════\n\n` +
      `🔎 Searching YouTube for: "${query}"\nPlease wait a moment...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the YouTube Search API
    const apiUrl = "https://kaiz-apis.gleeze.com/api/ytsearch";
    const response = await axios.get(apiUrl, {
      params: {
        q: query,
        apikey: "4fe7e522-70b7-420b-a746-d7a23db49ee5"
      }
    });

    const data = response.data?.result || response.data?.data || response.data;
    let resultMsg = `════『 𝗬𝗧𝗦𝗘𝗔𝗥𝗖𝗛 』════\n\n`;

    if (Array.isArray(data) && data.length > 0) {
      data.slice(0, 5).forEach((video, idx) => {
        resultMsg += `#${idx + 1}\n`;
        if (video.title) resultMsg += `• Title: ${video.title}\n`;
        if (video.url) resultMsg += `• URL: ${video.url}\n`;
        if (video.duration) resultMsg += `• Duration: ${video.duration}\n`;
        if (video.channel) resultMsg += `• Channel: ${video.channel}\n`;
        if (video.views) resultMsg += `• Views: ${video.views}\n`;
        resultMsg += `\n`;
      });
    } else {
      resultMsg += "⚠️ No results found.";
    }

    resultMsg += `> Powered by Kaiz YouTube Search API`;

    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in ytsearch command:', error.message || error);

    const errorMessage = `════『 𝗬𝗧𝗦𝗘𝗔𝗥𝗖𝗛 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to search YouTube.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};