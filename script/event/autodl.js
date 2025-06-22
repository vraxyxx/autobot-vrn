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
  event: true,
  description: "Auto-download videos from links detected in chat",
  credits: "Kenneth Panio + Vernex"
};

module.exports.handleEvent = async function ({ api, event }) {
  const body = event.body;
  if (!body) return;

  const links = body.match(/https?:\/\/[^\s]+/g);
  if (!links || links.length === 0) return;

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

          const contentType = response.headers['content-type'];
          const ext = contentType.includes('video') ? '.mp4' : '.bin';
          const filePath = path.join(__dirname, 'cache', `${Date.now()}_autodl${ext}`);

          const writer = fs.createWriteStream(filePath);
          response.data.pipe(writer);

          writer.on('finish', () => {
            const message = {
              body: `📥 Auto-downloaded from ${name}`,
              attachment: fs.createReadStream(filePath)
            };

            api.sendMessage(message, event.threadID, () => {
              fs.unlinkSync(filePath);
            }, event.messageID);
          });

          writer.on('error', err => {
            console.error('[autodl] Write error:', err);
            api.sendMessage(`❌ Failed to write the video file.`, event.threadID, event.messageID);
          });

          return;
        } catch (err) {
          console.error(`[autodl] Error fetching from ${name}:`, err.message);
          return api.sendMessage(`❌ Failed to download from ${name}.`, event.threadID, event.messageID);
        }
      }
    }
  }
};
