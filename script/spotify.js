const axios = require("axios");

module.exports = {
  config: {
    name: "spotify",
    version: "1.1.0",
    author: "You",
    description: "Search Spotify tracks and show details about the top 3 results.",
    cooldowns: 5,
    dependencies: {
      axios: ""
    }
  },

  run: async function({ api, event, args }) {
    const { threadID, messageID } = event;

    if (!args.length) {
      return api.sendMessage(
        "❗ Please provide a search query.\n\nUsage: /spotify [song or artist name]",
        threadID,
        messageID
      );
    }

    const query = encodeURIComponent(args.join(" "));

    try {
      const response = await axios.get(`https://api.ferdev.my.id/search/spotify?query=${query}`);
      const data = response.data;

      if (!data || !data.data || data.data.length === 0) {
        return api.sendMessage(
          `❌ No Spotify tracks found for "${args.join(" ")}".`,
          threadID,
          messageID
        );
      }

      // Prepare message for up to 3 tracks
      const tracks = data.data.slice(0, 3);
      let msg = `🎵 Spotify Search Results for: ${args.join(" ")}\n\n`;

      for (let i = 0; i < tracks.length; i++) {
        const t = tracks[i];
        const durationMs = t.duration_ms || 0;
        const minutes = Math.floor(durationMs / 60000);
        const seconds = Math.floor((durationMs % 60000) / 1000);

        msg += `🔹 ${i + 1}. ${t.name || "N/A"}\n`;
        msg += `   Artists: ${(t.artists || []).join(", ") || "N/A"}\n`;
        msg += `   Album: ${t.album || "N/A"}\n`;
        msg += `   Duration: ${minutes}m ${seconds}s\n`;
        msg += `   Preview: ${t.preview_url || "N/A"}\n`;
        msg += `   Link: ${t.external_urls ? t.external_urls.spotify : "N/A"}\n\n`;
      }

      // Send album cover from first track if exists
      let attachment = null;
      if (tracks[0].album_images && tracks[0].album_images[0]) {
        attachment = await global.utils.getStream(tracks[0].album_images[0]);
      }

      await api.sendMessage(
        {
          body: msg,
          attachment
        },
        threadID,
        messageID
      );

    } catch (error) {
      console.error("Error in spotify command:", error);
      api.sendMessage(
        `❌ Failed to fetch Spotify data.\nError: ${error.message}`,
        threadID,
        messageID
      );
    }
  }
};
