const axios = require('axios');
const fs = require('fs');

module.exports.config = {
  name: "spotify",
  version: "1.0",
  credits: "vern", // DO NOT CHANGE
  description: "Search and play Spotify music",
  usage: "spotify <song name>",
  cooldown: 5,
  permissions: [0],
  commandCategory: "music",
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  if (!args || args.length === 0) {
    return api.sendMessage("🎵 Please provide a song name to search on Spotify.", threadID, messageID);
  }

  const searchQuery = args.join(" ").trim();
  const apiUrl = `https://hiroshi-api.onrender.com/tiktok/spotify?search=${encodeURIComponent(searchQuery)}`;

  try {
    const { data } = await axios.get(apiUrl);

    if (!data || data.length === 0) {
      return api.sendMessage("❌ No results found for that song.", threadID, messageID);
    }

    const { name: trackName, track, image, download } = data[0];

    // Send track info
    const msg = `🎶 | Now Playing\n━━━━━━━━━━━━━━━\n🎧 Track: ${trackName}\n🔗 Listen: ${track}\n━━━━━━━━━━━━━━━`;
    await api.sendMessage(msg, threadID);

    // Send image if available
    if (image) {
      await api.sendMessage({
        body: "",
        attachment: await global.utils.getStreamFromURL(image)
      }, threadID);
    }

    // Send audio if available
    if (download) {
      await api.sendMessage({
        body: "🎧 Audio Preview:",
        attachment: await global.utils.getStreamFromURL(download)
      }, threadID, messageID);
    }

  } catch (error) {
    console.error("Spotify Error:", error);
    return api.sendMessage("❌ An unexpected error occurred while fetching the song.", threadID, messageID);
  }
};
