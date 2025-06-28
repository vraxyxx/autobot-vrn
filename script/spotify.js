const axios = require("axios");
const fs = require("fs");
const path = require("path");

const API_KEY = "8aa2f0a0-cbb9-40b8-a7d8-bba320cb9b10";

module.exports.config = {
  name: "spotify",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  aliases: [],
  description: "Search and download Spotify track.",
  usage: "spotify [song name]",
  credits: "Ryy",
  cooldown: 5,
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  if (!args[0]) {
    return api.sendMessage("❌ Please provide a song name.\n\nUsage: spotify [song name]", threadID, messageID);
  }

  const keyword = encodeURIComponent(args.join(" "));
  const searchURL = `https://kaiz-apis.gleeze.com/api/spotify-search?q=${keyword}&apikey=${API_KEY}`;

  await api.sendMessage("🎶 Tracking your song... please wait.", threadID, messageID);

  try {
    const searchRes = await axios.get(searchURL);
    const track = searchRes.data?.result?.[0];

    if (!track || !track.trackUrl) {
      return api.sendMessage("❌ No Spotify track found.", threadID, messageID);
    }

    const downloadURL = `https://kaiz-apis.gleeze.com/api/spotify-down?url=${encodeURIComponent(track.trackUrl)}&apikey=${API_KEY}`;
    const dlRes = await axios.get(downloadURL);
    const { title, url, artist, thumbnail } = dlRes.data;

    if (!url || !title || !artist || !thumbnail) {
      return api.sendMessage("⚠️ Incomplete track data.", threadID, messageID);
    }

    if (!fs.existsSync("cache")) fs.mkdirSync("cache");

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
        body: "🎧 Here’s your Spotify track!",
        attachment: fs.createReadStream(audioPath)
      }, threadID, () => {
        fs.unlinkSync(imgPath);
        fs.unlinkSync(audioPath);
      });
    });

  } catch (error) {
    console.error("Spotify command error:", error.message || error);
    return api.sendMessage("❌ An error occurred while processing your request.", threadID, messageID);
  }
};
