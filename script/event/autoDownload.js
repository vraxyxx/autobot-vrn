const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "autodownload",
  eventType: ["message"],
  version: "1.0.0",
  credits: "Vern",
  description: "Auto download from TikTok, YouTube, Facebook, IG, X, etc.",
  cooldowns: 5
};

module.exports.handleEvent = async function ({ api, event }) {
  const input = event.body;
  if (!input) return;

  const API_BASE = "https://kaiz-apis.gleeze.com/api";
  const API_KEY = "b5e85d38-1ccc-4aeb-84fd-a56a08e8361a";

  const platforms = {
    "x.com": "/twitter-xdl",
    "twitter.com": "/twitter-xdl",
    "pin.it": "/pinte-dl",
    "capcut.com": "/capcutdl",
    "youtube.com": "/ytdl",
    "youtu.be": "/ytdl",
    "reddit.com": "/reddit-dl",
    "snapchat.com": "/snapchat-dl",
    "facebook.com": "/fbdl",
    "fb.watch": "/fbdl",
    "tiktok.com": "/tiktok-dl",
    "vt.tiktok.com": "/tiktok-dl",
    "vm.tiktok.com": "/tiktok-dl",
    "instagram.com": "/insta-dl"
  };

  const matched = Object.keys(platforms).find(key => input.includes(key));
  if (!matched) return;

  const endpoint = `${API_BASE}${platforms[matched]}?url=${encodeURIComponent(input)}&apikey=${API_KEY}`;

  if (event.messageID) {
    api.setMessageReaction("⏳", event.messageID, () => {}, true);
  }

  api.sendTypingIndicator(event.threadID, true);

  try {
    const res = await axios.get(endpoint);
    let videoUrl;

    switch (platforms[matched]) {
      case "/twitter-xdl":
        videoUrl = res.data.downloadLinks?.[0]?.link;
        break;
      case "/pinte-dl":
        videoUrl = res.data.video?.url;
        break;
      case "/capcutdl":
        videoUrl = res.data.url;
        break;
      case "/ytdl":
        videoUrl = res.data.download_url;
        break;
      case "/reddit-dl":
        videoUrl = res.data.mp4?.find(v => v.quality === "350p")?.url || res.data.mp4?.[0]?.url;
        break;
      case "/snapchat-dl":
        videoUrl = res.data.url;
        break;
      case "/fbdl":
        videoUrl = res.data.videoUrl;
        break;
      case "/tiktok-dl":
        videoUrl = res.data.url;
        break;
      case "/insta-dl":
        videoUrl = res.data.result?.video_url;
        break;
    }

    if (!videoUrl) {
      return api.sendMessage("❌ Failed to retrieve video URL from the API.", event.threadID, event.messageID);
    }

    const fileName = `video_${Date.now()}.mp4`;
    const filePath = path.join(__dirname, "..", "cache", fileName);

    const writer = fs.createWriteStream(filePath);
    const response = await axios({ method: "GET", url: videoUrl, responseType: "stream" });
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.setMessageReaction("✅", event.messageID, () => {}, true);

      api.sendMessage({
        body: `🎬 Successfully downloaded video from ${matched}`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => {
        fs.unlinkSync(filePath); // Clean up
      });
    });

    writer.on("error", (err) => {
      console.error("❌ File write error:", err.message || err);
      api.sendMessage("❌ Error saving the downloaded video.", event.threadID, event.messageID);
    });

  } catch (err) {
    console.error("❌ API call error:", err.message || err);
    return api.sendMessage("❌ Error while downloading the video. Please try again later.", event.threadID, event.messageID);
  }
};
