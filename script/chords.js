const axios = require('axios');

module.exports.config = {
  name: 'chords',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: [],
  description: 'Search for guitar chords by song title',
  usage: 'chords <song title>',
  credits: 'developer',
  cooldown: 3
};

module.exports.run = async function({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  const query = args.join(' ').trim();

  if (!query) {
    return api.sendMessage(
      'Error: Please enter a song title.\nExample: chords dilaw by maki',
      threadID,
      messageID
    );
  }

  try {
    const apiUrl = `https://wrapped-rest-apis.vercel.app/api/chords?title=${encodeURIComponent(query)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.success || !data.chords) {
      return api.sendMessage('Error: Song chords not found.', threadID, messageID);
    }

    const message = `
-------------
Title: ${data.chords.title}
Artist: ${data.chords.artist}
Key: ${data.chords.key}
Type: ${data.chords.type}
Link: ${data.chords.url}

Chords:
${data.chords.chords}
-------------`;

    await api.sendMessage(message, threadID, messageID);

  } catch (error) {
    console.error('Error fetching chords:', error.message);
    return api.sendMessage(
      'Error: An unexpected error occurred. Please try again later.',
      threadID,
      messageID
    );
  }
};