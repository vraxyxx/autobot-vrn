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
    return api.sendMessage("❌ Please provide a search keyword.\n\nUsage: spotify [song name]", threadID, messageID);
  }

  const keyword = encodeURIComponent(args.join(" "));
  const searchURL = `https://kaiz-apis.gleeze.com/api/spotify-search?q=${keyword}&apikey=b5e85d38-1ccc-4aeb-84fd-a56a08e8361a`;

  await api.sendMessage("🎶 Tracking song, please wait...", threadID, messageID);

  try {
    const searchRes = await axios.get(searchURL);
    const track = Array.isArray(searchRes.data) ? searchRes.data[0] : searchRes.data;

    if (!track || !track.trackUrl) {
      return api.sendMessage("❌ No Spotify track found for that keyword.", threadID, messageID);
    }

    const downloadURL = `https://kaiz-apis.gleeze.com/api/spotify-down?url=${encodeURIComponent(track.trackUrl)}&apikey=b5e85d38-1ccc-4aeb-84fd-a56a08e8361a`;
    const dlRes = await axios.get(downloadURL);
    const { title, url, artist, thumbnail } = dlRes.data;

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const imgPath = path.join(cacheDir, `thumb_${senderID}.jpg`);
    const audioPath = path.join(cacheDir, `audio_${senderID}.mp3`);

    const imgRes = await axios.get(thumbnail, { responseType: "arraybuffer" });
    fs.writeFileSync(imgPath, imgRes.data);

    const audioRes = await axios.get(url, { responseType: "arraybuffer" });
    fs.writeFileSync(audioPath, audioRes.data);

    api.sendMessage({
      body: `🎵 Title: ${title}\n👤 Artist: ${artist}`,
      attachment: fs.createReadStream(imgPath)
    }, threadID, () => {
      api.sendMessage({
        body: "🎧 Here's your Spotify track. Enjoy!",
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
