const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const PLATFORMS = {
  youtube: {
    regex: /https:\/\/(?:www\.)?(?:youtube\.[a-z.]+\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/,
    name: 'YouTube'
  },
  tiktok: {
    regex: /https:\/\/(www\.)?[a-z]{2,3}\.tiktok\.[a-z.]+\/[a-zA-Z0-9-_]+\/?/,
    name: 'TikTok'
  },
  instagram: {
    regex: /https:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/[a-zA-Z0-9_-]+\/?/,
    name: 'Instagram'
  },
  facebook: {
    regex: /https:\/\/www\.facebook\.com\/(?:watch\/?\?v=\d+|(?:\S+\/videos\/\d+)|(?:reel\/\d+)|(?:share\/\S+))(?:\?\S+)?/,
    name: 'Facebook'
  }
};

module.exports.config = {
  name: "autodl",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  aliases: [],
  usage: "Paste a video link",
  description: "Auto-download detected video links from supported platforms",
  credits: "Kenneth Panio + Vernex",
  cooldown: 5
};

module.exports.run = async function ({ api, event, args }) {
  const body = event.body;
  if (!body) return;

  const links = body.match(/https?:\/\/[^\s]+/g);
  if (!links || links.length === 0) {
    return api.sendMessage(`❗ No valid link found in the message.`, event.threadID, event.messageID);
  }

  for (const link of links) {
    for (const [_, { regex, name }] of Object.entries(PLATFORMS)) {
      if (regex.test(link)) {
        const apiURL = `https://api.hajime.my.id/api/autodl?url=${encodeURIComponent(link)}&stream=true`;

        try {
          const response = await axios({
            method: 'GET',
            url: apiURL,
            responseType: 'stream'
          });

          const ext = response.headers['content-type'].includes('video') ? '.mp4' : '.bin';
          const filePath = path.join(__dirname, 'cache', `${Date.now()}_autodl${ext}`);
          const writer = fs.createWriteStream(filePath);
          response.data.pipe(writer);

          writer.on('finish', () => {
            const message = {
              body: `📥 Downloaded from ${name}`,
              attachment: fs.createReadStream(filePath)
            };
            api.sendMessage(message, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
          });

          writer.on('error', err => {
            console.error('Download error:', err);
            api.sendMessage(`❌ Failed to download the video.`, event.threadID, event.messageID);
          });

          return;
        } catch (err) {
          console.error(`Error downloading from ${name}:`, err.message);
          return api.sendMessage(`❌ Error downloading from ${name}.`, event.threadID, event.messageID);
        }
      }
    }
  }

  return api.sendMessage(`⚠️ No supported video link detected.`, event.threadID, event.messageID);
};
