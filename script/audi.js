const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "audi",
  version: "1.1.0",
  role: 0,
  hasPrefix: true,
  aliases: ["spotify", "music"],
  description: "Search a song from Spotify and play audio preview with image.",
  usage: "audi [song name]",
  credits: "Vern",
  cooldown: 3
};

module.exports.run = async function ({ api, event, args }) {
  const query = args.join(" ").trim();
  if (!query) return api.sendMessage("🔎 Please provide a song name.", event.threadID, event.messageID);

  try {
    const msgLoading = `🎵 Searching for "${query}" on Spotify...`;
    await api.sendMessage(msgLoading, event.threadID, event.messageID);

    const res = await axios.get(`https://api.ferdev.my.id/search/spotify`, {
      params: { query }
    });

    const song = res.data?.result?.[0]; // use first result
    if (!song || !song.preview_url) {
      return api.sendMessage("❌ No result found or no audio preview available.", event.threadID, event.messageID);
    }

    const { title, artist, preview_url, url, image } = song;
    const audioPath = path.join(__dirname, "..", "cache", `audio-preview.mp3`);
    const imagePath = path.join(__dirname, "..", "cache", `spotify-cover.jpg`);

    // Download audio
    const audioRes = await axios.get(preview_url, { responseType: "arraybuffer" });
    fs.writeFileSync(audioPath, Buffer.from(audioRes.data));

    // Download image
    const imgRes = await axios.get(image, { responseType: "arraybuffer" });
    fs.writeFileSync(imagePath, Buffer.from(imgRes.data));

    const msg = `🎧 𝗦𝗣𝗢𝗧𝗜𝗙𝗬 𝗦𝗘𝗔𝗥𝗖𝗛 𝗥𝗘𝗦𝗨𝗟𝗧\n\n` +
                `🎶 Title: ${title}\n` +
                `🎤 Artist: ${artist}\n` +
                `🔗 Link: ${url}\n\n` +
                `▶️ Audio preview and cover below`;

    return api.sendMessage({
      body: msg,
      attachment: [
        fs.createReadStream(imagePath),
        fs.createReadStream(audioPath)
      ]
    }, event.threadID, () => {
      fs.unlinkSync(audioPath);
      fs.unlinkSync(imagePath);
    });

  } catch (error) {
    console.error("Spotify command error:", error.message || error);
    return api.sendMessage("❌ Error fetching from Spotify. Please try again later.", event.threadID, event.messageID);
  }
};
