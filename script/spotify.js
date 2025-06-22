const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'spotify',
  description: 'Search Spotify tracks using Ferdev API and send image/audio',
  usage: 'spotify <song name>',
  cooldown: 5,

  async execute({ api, event, args }) {
    const query = args.join(" ");
    if (!query) {
      return sendMessage(api, event, "❌ Please enter a song name.\n\nExample:\nspotify love story");
    }

    try {
      const res = await axios.get(`https://api.ferdev.my.id/search/spotify?query=${encodeURIComponent(query)}`);
      const tracks = res.data.result;

      if (!tracks || tracks.length === 0) {
        return sendMessage(api, event, `😕 No results found for: "${query}"`);
      }

      const track = tracks[0]; // take first match

      // Paths for saving media files
      const imgPath = path.join(__dirname, `cache_${event.threadID}.jpg`);
      const audioPath = path.join(__dirname, `preview_${event.threadID}.mp3`);

      // Download album thumbnail
      const imgRes = await axios.get(track.thumbnail, { responseType: 'arraybuffer' });
      fs.writeFileSync(imgPath, imgRes.data);

      // Download audio preview (if available)
      let attachments = [fs.createReadStream(imgPath)];
      if (track.preview_url) {
        const audioRes = await axios.get(track.preview_url, { responseType: 'arraybuffer' });
        fs.writeFileSync(audioPath, audioRes.data);
        attachments.push(fs.createReadStream(audioPath));
      }

      // Message body
      let message = `🎧 𝗦𝗽𝗼𝘁𝗶𝗳𝘆 𝗦𝗲𝗮𝗿𝗰𝗵 𝗥𝗲𝘀𝘂𝗹𝘁\n\n`;
      message += `🎵 Title: ${track.title}\n`;
      message += `👤 Artist: ${track.artists}\n`;
      message += `🔗 URL: ${track.url}\n`;

      if (track.preview_url) {
        message += `🔊 Sending preview audio...`;
      } else {
        message += `⚠️ No audio preview available.`;
      }

      // Send message with attachments
      return sendMessage(api, event, {
        body: message,
        attachment: attachments
      }, () => {
        fs.unlinkSync(imgPath);
        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      });

    } catch (err) {
      console.error("Spotify Error:", err.message);
      return sendMessage(api, event, "❌ Error fetching Spotify data.");
    }
  }
};
