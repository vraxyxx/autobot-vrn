const axios = require("axios");

module.exports = {
  config: {
    name: "spotifydl",
    version: "1.0.0",
    author: "vern",
    description: "Download Spotify track info and direct audio from a Spotify track URL.",
    cooldowns: 5,
    dependencies: {
      axios: ""
    }
  },

  run: async function({ api, event, args }) {
    const { threadID, messageID } = event;

    if (!args.length) {
      return api.sendMessage(
        "❗ Please provide a Spotify track URL.\n\nUsage: /spotifydl [spotify track url]",
        threadID,
        messageID
      );
    }

    const trackUrl = args[0];
    try {
      const encodedLink = encodeURIComponent(trackUrl);
      const response = await axios.get(`https://api.ferdev.my.id/downloader/spotify?link=${encodedLink}`);
      const data = response.data;

      if (!data || !data.data) {
        return api.sendMessage(
          `❌ No data found for the provided URL.`,
          threadID,
          messageID
        );
      }

      const track = data.data;

      // Format message with track info
      let msg = `🎵 Spotify Track Download 🎵\n\n`;
      msg += `Title: ${track.title || "N/A"}\n`;
      msg += `Artists: ${track.artists ? track.artists.join(", ") : "N/A"}\n`;
      msg += `Album: ${track.album || "N/A"}\n`;
      msg += `Duration: ${track.duration || "N/A"}\n`;
      msg += `Popularity: ${track.popularity || "N/A"}\n`;
      msg += `Link: ${track.link || trackUrl}\n`;

      // If direct audio available, send with attachment
      if (track.audio) {
        await api.sendMessage(
          { body: msg, attachment: await global.utils.getStream(track.audio) },
          threadID,
          messageID
        );
      } else {
        await api.sendMessage(msg, threadID, messageID);
      }
    } catch (error) {
      console.error("Error in spotifydl command:", error);
      api.sendMessage(
        `❌ Failed to fetch Spotify track.\nError: ${error.message}`,
        threadID,
        messageID
      );
    }
  }
};
