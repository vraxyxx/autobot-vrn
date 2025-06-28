module.exports.config = {
  name: "autodownload",
  eventType: ["message"],
  version: "1.0.0",
  credits: "Vern",
  description: "Auto download from TikTok, YouTube, Facebook, IG, X, etc.",
  cooldowns: 5
};

module.exports.handleEvent = async function ({ api, event }) {
  const fs = require("fs");
  const axios = require("axios");

  const API_BASE = "https://kaiz-apis.gleeze.com/api";
  const API_KEY = "b5e85d38-1ccc-4aeb-84fd-a56a08e8361a";

  const input = event.body;
  if (!input) return;

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

  api.setMessageReaction("⏳", event.messageID, () => {}, true);
  api.sendTypingIndicator(event.threadID, true);

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
    return api.sendMessage("❌ Failed to retrieve video URL.", event.threadID, event.messageID);
  }

  api.sendMessage("Downloading video...", event.threadID, (err, info) => {
    setTimeout(() => api.unsendMessage(info.messageID), 10000);
  });

  const fileName = `${Date.now()}.mp4`;
  const filePath = __dirname + "/" + fileName;

  const videoStream = await axios({
    method: "GET",
    url: videoUrl,
    responseType: "stream"
  }).then(res => res.data);

  const file = fs.createWriteStream(filePath);
  videoStream.pipe(file);

  file.on("finish", () => {
    file.close(() => {
      setTimeout(() => {
        api.setMessageReaction("✅", event.messageID, () => {}, true);
        api.sendMessage({
          body: `✅ Video downloaded successfully from ${matched}`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath));
      }, 5000);
    });
  });

  file.on("error", () => {
    api.sendMessage("❌ Error saving video.", event.threadID, event.messageID);
  });
};