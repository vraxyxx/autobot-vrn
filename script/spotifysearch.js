const axios = require('axios');

module.exports.config = {
  name: "spotifysearch",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Search for Spotify tracks using the Kaiz API.",
  usage: "/spotifysearch <search query>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Music"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(' ').trim();
  const prefix = "/"; // Change if your bot uses a dynamic prefix

  // No search query provided
  if (!query) {
    const usageMessage = `════『 𝗦𝗣𝗢𝗧𝗜𝗙𝗬 𝗦𝗘𝗔𝗥𝗖𝗛 』════\n\n` +
      `⚠️ Please provide a search term for Spotify tracks.\n\n` +
      `📌 Usage: ${prefix}spotifysearch <search query>\n` +
      `💬 Example: ${prefix}spotifysearch about you\n\n` +
      `> Thank you for using Spotify Search!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗦𝗣𝗢𝗧𝗜𝗙𝗬 𝗦𝗘𝗔𝗥𝗖𝗛 』════\n\n` +
      `🔎 Searching Spotify for: "${query}"\nPlease wait a moment...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Spotify Search API
    const apiUrl = "https://kaiz-apis.gleeze.com/api/spotify-search";
    const response = await axios.get(apiUrl, {
      params: {
        q: query,
        apikey: "4fe7e522-70b7-420b-a746-d7a23db49ee5"
      }
    });

    const data = response.data?.result || response.data?.tracks || response.data;
    let resultMsg = `════『 𝗦𝗣𝗢𝗧𝗜𝗙𝗬 𝗦𝗘𝗔𝗥𝗖𝗛 』════\n\n`;

    if (Array.isArray(data) && data.length > 0) {
      data.slice(0, 5).forEach((track, idx) => {
        resultMsg += `#${idx + 1}\n`;
        if (track.title) resultMsg += `• Title: ${track.title}\n`;
        if (track.artist) resultMsg += `• Artist: ${track.artist}\n`;
        if (track.album) resultMsg += `• Album: ${track.album}\n`;
        if (track.url) resultMsg += `• URL: ${track.url}\n`;
        if (track.release_date) resultMsg += `• Release Date: ${track.release_date}\n`;
        resultMsg += `\n`;
      });
    } else {
      resultMsg += "⚠️ No results found.";
    }

    resultMsg += `> Powered by Kaiz Spotify Search API`;

    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in spotifysearch command:', error.message || error);

    const errorMessage = `════『 𝗦𝗣𝗢𝗧𝗜𝗙𝗬 𝗦𝗘𝗔𝗥𝗖𝗛 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to search Spotify.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};