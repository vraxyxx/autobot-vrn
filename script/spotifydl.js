const axios = require("axios");

module.exports = {
  config: {
    name: "spotifydl",
    version: "1.0.1",
    author: "vern",
    description: "Download a Spotify track and info using a Spotify URL.",
    cooldowns: 5,
    dependencies: { axios: "" }
  },

  run: async function({ api, event, args }) {
    const { threadID, messageID } = event;

    if (!args[0]) {
      return api.sendMessage(
        "❗ Please provide a Spotify track URL.\n\nUsage: /spotifydl [spotify track url]",
        threadID,
        messageID
      );
    }

    const trackUrl = args[0].trim();

    try {
      const encoded = encodeURIComponent(trackUrl);
      const res = await axios.get(`https://api.ferdev.my.id/downloader/spotify?link=${encoded}`);
      const data = res.data?.data;

      if (!data) {
        return api.sendMessage("❌ No data found for this track URL.", threadID, messageID);
      }

      const {
        title = "N/A",
        artists = [],
        album = "N/A",
        duration = "N/A",
        popularity = "N/A",
        link = trackUrl,
        audio
      } = data;

      const msg = `🎧 Spotify Track Info 🎧\n\n` +
        `🎵 Title: ${title}\n` +
        `👤 Artists: ${artists.join(", ") || "N/A"}\n` +
        `💽 Album: ${album}\n` +
        `⏱️ Duration: ${duration}\n` +
        `📊 Popularity: ${popularity}\n` +
        `🔗 Link: ${link}`;

      if (audio) {
        const stream = await global.utils.getStream(audio);
        return api.sendMessage({ body: msg, attachment: stream }, threadID, messageID);
      } else {
        return api.sendMessage(msg, threadID, messageID);
      }

    } catch (err) {
      console.error("❌ spotifydl error:", err);
      return api.sendMessage(
        `❌ Failed to fetch track info.\nError: ${err.message || "Unknown error"}`,
        threadID,
        messageID
      );
    }
  }
};
