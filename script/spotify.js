const axios = require("axios");

module.exports.config = {
  name: "spotify",
  version: "1.1.3",
  author: "vern",
  description: "Search Spotify tracks and show details about the top 3 results.",
  prefix: true,
  cooldowns: 5,
  commandCategory: "music",
  dependencies: {
    axios: ""
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  // No input
  if (!args.length) {
    return api.sendMessage(
      "❗ Please provide a song or artist name.\n\nUsage: /spotify [query]",
      threadID,
      messageID
    );
  }

  const query = encodeURIComponent(args.join(" "));

  // FIX: Corrected API URL (remove hardcoded 'multo' and '?query=' bug)
  const apiUrl = `https://kaiz-apis.gleeze.com/api/spotify-search?q=${query}&apikey=4fe7e522-70b7-420b-a746-d7a23db49ee5`;

  try {
    // Fetch results
    const res = await axios.get(apiUrl);
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

      // Format artists
      let artists = "Unknown";
      if (Array.isArray(t.artists)) {
        if (typeof t.artists[0] === "object" && t.artists[0].name) {
          artists = t.artists.map(a => a.name).join(", ");
        } else {
          artists = t.artists.join(", ");
        }
      }

      // Album name
      const album = typeof t.album === "object" && t.album.name ? t.album.name : (t.album || "Unknown");

      msg += `🔹 ${i + 1}. ${t.name || "Unknown Title"}\n`;
      msg += `   👤 Artists: ${artists}\n`;
      msg += `   💿 Album: ${album}\n`;
      msg += `   ⏱ Duration: ${min}m ${sec}s\n`;
      msg += `   🎧 Preview: ${t.preview_url || "N/A"}\n`;
      msg += `   🔗 Link: ${t.external_urls?.spotify || "N/A"}\n\n`;
    }

    // Try to attach cover image from first result
    let messageData = { body: msg.trim() };
    let imageUrl = null;
    if (topTracks[0]?.album && Array.isArray(topTracks[0].album.images) && topTracks[0].album.images[0]?.url) {
      imageUrl = topTracks[0].album.images[0].url;
    }

    if (imageUrl && global.utils && typeof global.utils.getStream === "function") {
      try {
        const imgStream = await global.utils.getStream(imageUrl);
        if (imgStream) messageData.attachment = imgStream;
      } catch (imgErr) {
        // Ignore image error, just send text
      }
    }

    return api.sendMessage(messageData, threadID, messageID);

  } catch (err) {
    console.error("❌ Error in spotify command:", err.message || err);
    return api.sendMessage(
      `❌ Failed to fetch data from Spotify API.\nError: ${err.message || 'Unknown error'}`,
      threadID,
      messageID
    );
  }
};