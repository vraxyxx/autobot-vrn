const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const API_KEY = '4fe7e522-70b7-420b-a746-d7a23db49ee5';
const SEARCH_URL = 'https://kaiz-apis.gleeze.com/api/spotify-search';

module.exports.config = {
  name: "spotify",
  version: "1.0.1",
  role: 0,
  hasPrefix: true,
  aliases: ['spot'],
  usage: 'spotify [song name]',
  description: 'Search and play music preview from Spotify (Kaiz API)',
  credits: 'Vernex + Kaiz API',
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
      params: {
        q: query,
        apikey: API_KEY
      }
    });

    const track = res.data?.result?.[0];
    if (!track) {
      return api.sendMessage(`❌ No result found for "${query}".`, event.threadID, event.messageID);
    }

    const { title, artist, url, preview, image } = track;

    if (!preview) {
      return api.sendMessage(`⚠️ No audio preview available for "${title}".`, event.threadID, event.messageID);
    }

    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const fileName = `${Date.now()}_spotify.mp3`;
    const filePath = path.join(cacheDir, fileName);

    const response = await axios({
      method: 'GET',
      url: preview,
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on('finish', () => {
      const fileSize = fs.statSync(filePath).size;
      if (fileSize > 25 * 1024 * 1024) {
        fs.unlinkSync(filePath);
        return api.sendMessage(`⚠️ The file is too large to send (over 25MB).`, event.threadID, event.messageID);
      }

      api.sendMessage({
        body: `🎧 Title: ${title}\n👤 Artist: ${artist}\n🔗 ${url}`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => {
        fs.unlinkSync(filePath);
      }, event.messageID);
    });

    writer.on('error', (err) => {
      console.error('Write stream error:', err);
      api.sendMessage(`❌ Failed to download audio preview.`, event.threadID, event.messageID);
    });

  } catch (err) {
    console.error('❌ Spotify command error:', err.message);
    return api.sendMessage(
      `❌ Error while fetching from Kaiz API:\n${err.response?.data?.message || err.message}`,
      event.threadID,
      event.messageID
    );
  }
};
