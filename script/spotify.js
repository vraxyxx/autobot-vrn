const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const SEARCH_URL = 'https://ace-rest-api.onrender.com/api/spotify';

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
      params: { search: query }
    });

    const track = res.data?.result?.[0];
    if (!track) {
      return api.sendMessage(`❌ No result found for "${query}".`, event.threadID, event.messageID);
    }

    const { title, artists, url, thumbnail, preview_url } = track;

    if (!preview_url) {
      return api.sendMessage(`⚠️ No audio preview available for "${title}".`, event.threadID, event.messageID);
    }

    // Ensure cache directory exists
    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    // Prepare file path
    const fileName = `${Date.now()}_spotify.mp3`;
    const filePath = path.join(cacheDir, fileName);

    const response = await axios({
      method: 'GET',
      url: preview_url,
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on('finish', async () => {
      const fileSize = fs.statSync(filePath).size;
      if (fileSize > 25 * 1024 * 1024) {
        fs.unlinkSync(filePath);
        return api.sendMessage(`⚠️ The file is too large to send (over 25MB).`, event.threadID, event.messageID);
      }

      const message = {
        body: `🎧 Title: ${title}\n👤 Artist: ${artists}\n🔗 ${url}`,
        attachment: fs.createReadStream(filePath)
      };

      api.sendMessage(message, event.threadID, () => {
        fs.unlinkSync(filePath); // clean up
      }, event.messageID);
    });

    writer.on('error', (err) => {
      console.error('Write stream error:', err);
      api.sendMessage(`❌ Failed to download audio preview.`, event.threadID, event.messageID);
    });

  } catch (err) {
    console.error('❌ Spotify command error:', err);
    return api.sendMessage(
      `❌ An error occurred while processing your request.\n${err.response?.data?.message || err.message}`,
      event.threadID,
      event.messageID
    );
  }
};
