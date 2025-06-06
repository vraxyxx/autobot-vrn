const axios = require("axios");

module.exports = {
  config: {
    name: "spotify",
    version: "1.1.1",
    author: "vern",
    description: "Search Spotify tracks and show details about the top 3 results.",
    cooldowns: 5,
    dependencies: {
      axios: ""
    }
  },

  run: async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    // ⚠️ No input
    if (!args.length) {
      return api.sendMessage(
        "❗ Please provide a song or artist name.\n\nUsage: /spotify [query]",
        threadID,
        messageID
      );
    }

    const query = encodeURIComponent(args.join(" "));

    try {
      // 🔍 Fetch results
      const res = await axios.get(`https://api.ferdev.my.id/search/spotify?query=${query}`);
      const tracks = res.data?.data;

      if (!Array.isArray(tracks) || tracks.length === 0) {
        return api.sendMessage(`❌ No results found for "${args.join(" ")}".`, threadID, messageID);
      }

      const topTracks = tracks.slice(0, 3);
      let msg = `🎧 Spotify Top Results for: ${args.join(" ")}\n\n`;

      for (let i = 0; i < topTracks.length; i++) {
        const t = topTracks[i];
        const durationMs = t.duration_ms || 0;
        const min = Math.floor(durationMs / 60000);
        const sec = Math.floor((durationMs % 60000) / 1000);

        msg += `🔹 ${i + 1}. ${t.name || "Unknown Title"}\n`;
        msg += `   👤 Artists: ${(t.artists || []).join(", ") || "Unknown"}\n`;
        msg += `   💿 Album: ${t.album || "Unknown"}\n`;
        msg += `   ⏱ Duration: ${min}m ${sec}s\n`;
        msg += `   🎧 Preview: ${t.preview_url || "N/A"}\n`;
        msg += `   🔗 Link: ${t.external_urls?.spotify || "N/A"}\n\n`;
      }

      // 🖼️ Attempt to attach cover image
      let attachment = null;
      const imageUrl = topTracks[0]?.album_images?.[0];
      if (imageUrl) {
        const imgStream = await global.utils.getStream(imageUrl);
        attachment = imgStream;
      }

      // ✅ Send result
      return api.sendMessage({
        body: msg.trim(),
        attachment
      }, threadID, messageID);

    } catch (err) {
      console.error("❌ Error in spotify command:", err.message || err);
      return api.sendMessage(
        `❌ Failed to fetch data from Spotify API.\nError: ${err.message || 'Unknown error'}`,
        threadID,
        messageID
      );
    }
  }
};
