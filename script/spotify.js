const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "spotify",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  aliases: [],
  description: "Search and download Spotify track.",
  usage: "spotify [song name]",
  credits: "Vern",
  cooldown: 5,
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  if (!args[0]) {
    return api.sendMessage("❌ Please provide a song name.\n\nUsage: spotify [song name]", threadID, messageID);
  }

  const keyword = encodeURIComponent(args.join(" "));
  const searchURL = `https://api.ferdev.my.id/search/spotify?query=${keyword}`;

  api.sendMessage("🔎 Searching Spotify... Please wait.", threadID, messageID);

  try {
    const res = await axios.get(searchURL);
    const track = res.data?.result;

    if (!track || !track.url || !track.thumbnail) {
      return api.sendMessage("❌ No track found or incomplete data.", threadID, messageID);
    }

    const { title, url, artist, thumbnail } = track;

    const imgPath = path.join(__dirname, "cache", `thumb_${senderID}.jpg`);
    const audioPath = path.join(__dirname, "cache", `audio_${senderID}.mp3`);

    const imgRes = await axios.get(thumbnail, { responseType: "arraybuffer" });
    fs.writeFileSync(imgPath, Buffer.from(imgRes.data));

    const audioRes = await axios.get(url, { responseType: "arraybuffer" });
    fs.writeFileSync(audioPath, Buffer.from(audioRes.data));

    api.sendMessage({
      body: `🎵 Title: ${title}\n👤 Artist: ${artist}`,
      attachment: fs.createReadStream(imgPath)
    }, threadID, () => {
      api.sendMessage({
        body: "🎧 Here's your Spotify preview 🎶",
        attachment: fs.createReadStream(audioPath)
      }, threadID, () => {
        fs.unlinkSync(imgPath);
        fs.unlinkSync(audioPath);
      });
    });

  } catch (error) {
    console.error("Spotify command error:", error);
    return api.sendMessage("❌ Error while fetching Spotify track.", threadID, messageID);
  }
};
