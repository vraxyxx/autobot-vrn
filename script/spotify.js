const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

// Read token for sending messages
const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'spotify',
  description: 'Fetch Spotify track details by song name.',
  usage: 'spotify <song name>',
  author: 'Vern',

  async execute(senderId, args) {
    const pageAccessToken = token;

    if (!Array.isArray(args) || args.length === 0) {
      return await sendError(senderId, '❌ Please provide a song name.', pageAccessToken);
    }

    const query = args.join(' ').trim();
    await fetchSpotifyTrack(senderId, query, pageAccessToken);
  }
};

async function fetchSpotifyTrack(senderId, query, pageAccessToken) {
  try {
    const apiUrl = `https://hiroshi-api.onrender.com/tiktok/spotify?search=${encodeURIComponent(query)}`;
    const { data } = await axios.get(apiUrl);

    if (!data || data.length === 0) {
      return await sendError(senderId, '❌ No results found.', pageAccessToken);
    }

    const { name: title, track, image, download } = data[0];

    const message = `🎶 | Now Playing
━━━━━━━━━━━━━━━
🎧 Track: ${title}
🔗 Listen: ${track}
━━━━━━━━━━━━━━━`;
    await sendMessage(senderId, { text: message }, pageAccessToken);

    if (image) {
      const imageAttachment = formatAttachment('image', image);
      await sendMessage(senderId, { attachment: imageAttachment }, pageAccessToken);
    }

    if (download) {
      const audioAttachment = formatAttachment('audio', download);
      await sendMessage(senderId, { attachment: audioAttachment }, pageAccessToken);
    }
  } catch (err) {
    console.error('❌ Spotify Fetch Error:', err);
    await sendError(senderId, '❌ Failed to fetch track. Please try again later.', pageAccessToken);
  }
}

function formatAttachment(type, url) {
  return {
    type,
    payload: { url }
  };
}

async function sendError(senderId, text, pageAccessToken) {
  await sendMessage(senderId, { text }, pageAccessToken);
}
