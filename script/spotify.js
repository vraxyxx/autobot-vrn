const axios = require("axios");
const fs = require("fs");
const path = require("path");

const API_KEY = "4fe7e522-70b7-420b-a746-d7a23db49ee5";

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
  const searchURL = `https://kaiz-apis.gleeze.com/api/spotify-search?q=${keyword}&apikey=${API_KEY}`;

  api.sendMessage("🎶 Searching Spotify... please wait.", threadID, messageID);

  try {
    const searchRes = await axios.get(searchURL);
    const track = searchRes.data?.result?.[0];

    if (!track || !track.trackUrl) {
      return api.sendMessage("❌ No track found.", threadID, messageID);
    }

    const downloadURL = `https://kaiz-apis.gleeze.com/api/spotify-down?url=${encodeURIComponent(track.trackUrl)}&apikey=${API_KEY}`;
    const dlRes = await axios.get(downloadURL);

    const { title, artist, thumbnail, audio } = dlRes.data || {};
    if (!audio || !thumbnail) {
      return api.sendMessage("⚠️ Failed to fetch track data.", threadID, messageID);
    }

    const imgPath = path.join(__dirname, "cache", `thumb_${senderID}.jpg`);
    const audioPath = path.join(__dirname, "cache", `audio_${senderID}.mp3`);

    const imgRes = await axios.get(thumbnail, { responseType: "arraybuffer" });
    fs.writeFileSync(imgPath, Buffer.from(imgRes.data));

    const audioRes = await axios.get(audio, { responseType: "arraybuffer" });
    fs.writeFileSync(audioPath, Buffer.from(audioRes.data));

    api.sendMessage({
      body: `🎵 Title: ${title}\n👤 Artist: ${artist}`,
      attachment: fs.createReadStream(imgPath)
    }, threadID, () => {
      api.sendMessage({
        body: "🎧 Here’s your Spotify track preview. Enjoy! 🎶",
        attachment: fs.createReadStream(audioPath)
      }, threadID, () => {
        fs.unlinkSync(imgPath);
        fs.unlinkSync(audioPath);
      });
    });

  } catch (error) {
    console.error("Spotify command error:", error);
    return api.sendMessage("❌ An error occurred while processing your request.", threadID, messageID);
  }
};
