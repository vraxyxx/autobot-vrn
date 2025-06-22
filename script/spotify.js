const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const SEARCH_URL = 'https://api.ferdev.my.id/search/spotify';

module.exports.config = {
  name: "spotify",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ['spot'],
  usage: 'spotify [song name]',
  description: 'Search and play music preview from Spotify',
  credits: 'Vernex',
  cooldown: 5
};

module.exports.run = async function ({ api, event, args }) {
  const query = args.join(' ');
  if (!query) {
    return api.sendMessage(`❗ Please provide a song name.`, event.threadID, event.messageID);
  }

  api.sendMessage(`🔍 Searching Spotify for "${query}"...`, event.threadID, event.messageID);

  try {
    const res = await axios.get(SEARCH_URL, {
      params: { query }
    });

    const track = res.data?.result?.[0];
    if (!track) {
      return api.sendMessage(`❌ No result found for "${query}".`, event.threadID, event.messageID);
    }

    const { title, artists, url, thumbnail, preview_url } = track;

    if (!preview_url) {
      return api.sendMessage(`⚠️ No audio preview available for "${title}".`, event.threadID, event.messageID);
    }

    // Download preview audio
    const fileName = `${Date.now()}_spotify.mp3`;
    const filePath = path.join(__dirname, 'cache', fileName);
    const writer = fs.createWriteStream(filePath);

    const downloadStream = await axios({
      method: 'GET',
      url: preview_url,
      responseType: 'stream'
    });

    downloadStream.data.pipe(writer);

    writer.on('finish', async () => {
      const fileSize = fs.statSync(filePath).size;
      if (fileSize > 25 * 1024 * 1024) {
        fs.unlinkSync(filePath);
        return api.sendMessage(`⚠️ The file is too large to send (over 25MB).`, event.threadID, event.messageID);
      }

      const message = {
        body: `🎧 ${title}\n👤 Artist: ${artists}\n🔗 ${url}`,
        attachment: fs.createReadStream(filePath)
      };

      api.sendMessage(message, event.threadID, () => {
        fs.unlinkSync(filePath);
      }, event.messageID);
    });

    writer.on('error', (err) => {
      console.error('Write error:', err);
      api.sendMessage(`❌ Failed to download audio preview.`, event.threadID, event.messageID);
    });

  } catch (err) {
    console.error('Spotify command error:', err.message);
    api.sendMessage(`❌ An error occurred while processing your request.`, event.threadID, event.messageID);
  }
};
