const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const SEARCH_URL = 'https://kaiz-apis.gleeze.com/api/ytsearch';
const DOWNLOAD_URL = 'https://kaiz-apis.gleeze.com/api/ytmp3-v2';
const API_KEY = 'b5e85d38-1ccc-4aeb-84fd-a56a08e8361a';

module.exports.config = {
  name: "ytmusic",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ['playyt', 'ytaudio'],
  usage: 'ytmusic [song name]',
  description: 'Searches YouTube for music and plays audio',
  credits: 'Ry',
  cooldown: 5
};

module.exports.run = async function ({ api, event, args }) {
  const songName = args.join(' ');
  if (!songName) {
    return api.sendMessage(`❗ Please provide the title of the song.`, event.threadID, event.messageID);
  }

  api.sendMessage(`🔍 Searching for "${songName}"...`, event.threadID, event.messageID);

  try {
    // Search YouTube
    const searchRes = await axios.get(SEARCH_URL, {
      params: { q: songName, apikey: API_KEY }
    });

    const item = searchRes.data?.items?.[0];
    if (!item) {
      return api.sendMessage(`❌ No song found.`, event.threadID, event.messageID);
    }

    const { title, thumbnail, url, duration } = item;

    // Download MP3
    const downloadRes = await axios.get(DOWNLOAD_URL, {
      params: { url, apikey: API_KEY }
    });

    const { download_url, quality } = downloadRes.data;

    if (!download_url) {
      return api.sendMessage(`❌ Failed to fetch MP3 download link.`, event.threadID, event.messageID);
    }

    // Download file to cache
    const fileName = `${Date.now()}_ytmusic.mp3`;
    const filePath = path.join(__dirname, 'cache', fileName);
    const writer = fs.createWriteStream(filePath);

    const downloadStream = await axios({
      method: 'GET',
      url: download_url,
      responseType: 'stream'
    });

    downloadStream.data.pipe(writer);

    writer.on('finish', () => {
      const fileSize = fs.statSync(filePath).size;
      if (fileSize > 25 * 1024 * 1024) {
        fs.unlinkSync(filePath);
        return api.sendMessage(`⚠️ The file is too large to send (over 25MB).`, event.threadID, event.messageID);
      }

      const message = {
        body: `🎧 ${title}\nDuration: ${duration} | Quality: ${quality}`,
        attachment: fs.createReadStream(filePath)
      };

      api.sendMessage(message, event.threadID, () => {
        fs.unlinkSync(filePath);
      }, event.messageID);
    });

    writer.on('error', (err) => {
      console.error('Write error:', err);
      api.sendMessage(`❌ Failed to download audio.`, event.threadID, event.messageID);
    });

  } catch (err) {
    console.error('YouTube music error:', err.message);
    api.sendMessage(`❌ An error occurred while processing your request.`, event.threadID, event.messageID);
  }
};