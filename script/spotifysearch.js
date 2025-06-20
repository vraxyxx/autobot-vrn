const axios = require("axios");

module.exports.config = {
  name: "spotifysearch",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Search for songs on Spotify",
  usage: "/spotifysearch <song name>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Music"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prefix = "/"; // Use dynamic prefix if your bot supports it
  const query = args.join(" ").trim();

  if (!query) {
    const usageMsg = `════『 𝗦𝗣𝗢𝗧𝗜𝗙𝗬 𝗦𝗘𝗔𝗥𝗖𝗛 』════\n\n` +
      `🎵 Please enter a song name to search.\n\n` +
      `📌 Usage: ${prefix}spotifysearch <song name>\n` +
      `💬 Example: ${prefix}spotifysearch multo`;
    return api.sendMessage(usageMsg, threadID, messageID);
  }

  try {
    const loadingMsg = `🎧 Searching Spotify for: "${query}"...\nPlease wait...`;
    await api.sendMessage(loadingMsg, threadID, messageID);

    const apiUrl = `https://kaiz-apis.gleeze.com/api/spotify-search?q=${encodeURIComponent(query)}&apikey=4fe7e522-70b7-420b-a746-d7a23db49ee5`;
    const { data } = await axios.get(apiUrl);

    if (!data?.result?.length) {
      return api.sendMessage("❌ No results found for your search.", threadID, messageID);
    }

    const song = data.result[0];

    const songInfo = `════『 𝗦𝗣𝗢𝗧𝗜𝗙𝗬 𝗥𝗘𝗦𝗨𝗟𝗧 』════\n\n` +
      `🎵 Title: ${song.title}\n` +
      `🎤 Artist: ${song.artists}\n` +
      `📀 Album: ${song.album}\n` +
      `🔗 URL: ${song.url}\n\n` +
      `> Provided by Vern-Autobot`;

    await api.sendMessage(songInfo, threadID, messageID);

    if (song.thumbnail) {
      await api.sendMessage({
        attachment: await global.utils.getStreamFromURL(song.thumbnail)
      }, threadID, messageID);
    }

  } catch (error) {
    console.error("❌ Spotify Search Error:", error.message || error);

    const errorMsg = `════『 𝗦𝗣𝗢𝗧𝗜𝗙𝗬 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to fetch search results.\nReason: ${error.message || "Unknown error"}\n\n` +
      `> Please try again later.`;
    return api.sendMessage(errorMsg, threadID, messageID);
  }
};
