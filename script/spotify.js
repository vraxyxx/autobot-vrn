const axios = require('axios');

module.exports.config = {
  name: "spotify",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Search for a song on Spotify using the Kaiz API.",
  usage: "/spotify <song or artist>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Music"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(' ').trim();
  const prefix = "/"; // Change if your bot uses a dynamic prefix

  // No query given
  if (!query) {
    const usageMessage = `════『 𝗦𝗣𝗢𝗧𝗜𝗙𝗬 』════\n\n` +
      `⚠️ Please provide a song or artist to search.\n\n` +
      `📌 Usage: ${prefix}spotify <song or artist>\n` +
      `🎵 Example: ${prefix}spotify about you\n\n` +
      `> Thank you for using the Spotify search!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗦𝗣𝗢𝗧𝗜𝗙𝗬 』════\n\n` +
      `🔎 Searching for: "${query}"\nPlease wait a moment...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Spotify Search API
    const apiUrl = "https://kaiz-apis.gleeze.com/api/spotify-search";
    const response = await axios.get(apiUrl, {
      params: {
        q: query,
        apikey: "4fe7e522-70b7-420b-a746-d7a23db49ee5"
      }
    });

    // Format results
    const tracks = response.data?.tracks || [];
    if (!tracks.length) {
      return api.sendMessage(
        `════『 𝗦𝗣𝗢𝗧𝗜𝗙𝗬 』════\n\n❌ No results found for "${query}".`,
        threadID,
        messageID
      );
    }

    let resultsMsg = `════『 𝗦𝗣𝗢𝗧𝗜𝗙𝗬 』════\n\n` +
      `🎶 Top results for: "${query}"\n\n`;

    tracks.slice(0, 5).forEach((track, idx) => {
      resultsMsg += `${idx + 1}. ${track.title} - ${track.artist}\n`;
      if (track.url) resultsMsg += `🔗 ${track.url}\n`;
      if (track.album) resultsMsg += `💿 Album: ${track.album}\n`;
      resultsMsg += '\n';
    });

    resultsMsg += `> Powered by Kaiz Spotify API`;

    return api.sendMessage(resultsMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in spotify command:', error.message || error);

    const errorMessage = `════『 𝗦𝗣𝗢𝗧𝗜𝗙𝗬 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to search Spotify.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};