const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "soundcloud",
    version: "1.0.0",
    author: "vernex",
    description: "Download music from SoundCloud by title.",
    cooldowns: 5,
    dependencies: {
      axios: "",
      "fs-extra": ""
    }
  },

  run: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const query = args.join(" ");

    if (!query) {
      return api.sendMessage("❌ Please provide a SoundCloud song title.\n\nUsage: /soundcloud <title>", threadID, messageID);
    }

    try {
      await api.sendMessage(`⏳ Searching SoundCloud for: "${query}"...`, threadID, messageID);

      const response = await axios.get(`https://haji-mix.up.railway.app/api/soundcloud?title=${encodeURIComponent(query)}`);
      const data = response.data;

      if (!data.status || !data.result || !data.result.audio) {
        return api.sendMessage("❌ Failed to fetch SoundCloud audio. Try another title.", threadID, messageID);
      }

      const audioUrl = data.result.audio;
      const title = data.result.title || "Unknown Title";

      // Download the audio file
      const tempPath = path.join(__dirname, `../temp/soundcloud_${Date.now()}.mp3`);
      const audioStream = (await axios.get(audioUrl, { responseType: "stream" })).data;

      const writer = fs.createWriteStream(tempPath);
      audioStream.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // Send the audio file
      await api.sendMessage(
        {
          body: `🎧 Title: ${title}\n\n✅ Here's your SoundCloud audio:`,
          attachment: fs.createReadStream(tempPath)
        },
        threadID,
        () => fs.unlinkSync(tempPath) // Cleanup
      );

    } catch (err) {
      console.error("❌ Error in /soundcloud:", err.message);
      return api.sendMessage(`❌ Error: ${err.message}`, threadID, messageID);
    }
  }
};
