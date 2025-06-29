const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "applemusic",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  aliases: [],
  description: "Search Apple Music track and play preview.",
  usage: "applemusic [song name]",
  credits: "burat",
  cooldown: 5,
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const senderID = event.senderID;

  if (!args[0]) {
    return api.sendMessage("❌ Please provide a song title.\n\nUsage: applemusic [song name]", threadID, messageID);
  }

  const query = encodeURIComponent(args.join(" "));
  const searchURL = `https://kaiz-apis.gleeze.com/api/apple-music?search=${query}&apikey=b5e85d38-1ccc-4aeb-84fd-a56a08e8361a`;

  await api.sendMessage("🔍 Searching Apple Music... Please wait.", threadID, messageID);

  try {
    const res = await axios.get(searchURL);
    const track = res.data?.response?.[0];

    if (!track) {
      return api.sendMessage("❌ No track found on Apple Music.", threadID, messageID);
    }

    const { title, artist, album, duration, releaseDate, thumbnail, url, previewMp3 } = track;
    const imgPath = path.join(__dirname, "cache", `apple_thumb_${senderID}.jpg`);
    const audioPath = path.join(__dirname, "cache", `apple_audio_${senderID}.mp3`);

    // Download thumbnail
    const imgRes = await axios.get(thumbnail, { responseType: "arraybuffer" });
    fs.writeFileSync(imgPath, imgRes.data);

    // Send song info with thumbnail
    api.sendMessage({
      body: `🎵 Title: ${title}\n👤 Artist: ${artist}\n💽 Album: ${album}\n🕒 Duration: ${duration}\n📅 Release: ${releaseDate}\n🔗 URL: ${url}`,
      attachment: fs.createReadStream(imgPath)
    }, threadID, async () => {
      fs.unlinkSync(imgPath); // Clean up image file after sending

      // If there's a preview, download and send it
      if (previewMp3) {
        const audioRes = await axios.get(previewMp3, { responseType: "arraybuffer" });
        fs.writeFileSync(audioPath, audioRes.data);

        api.sendMessage({
          body: "🎧 Here's a preview of the track:",
          attachment: fs.createReadStream(audioPath)
        }, threadID, () => {
          fs.unlinkSync(audioPath); // Clean up audio file after sending
        });
      } else {
        api.sendMessage("❌ No preview available for this track.", threadID);
      }
    });

  } catch (error) {
    console.error("Apple Music error:", error);
    return api.sendMessage("❌ An error occurred while fetching Apple Music data.", threadID, messageID);
  }
};