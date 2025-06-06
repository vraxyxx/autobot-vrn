const axios = require('axios');

module.exports.config = {
  name: "meme",
  version: "1.0.0",
  credits: "developer",
  description: "Get a random meme from the Meme API.",
  hasPrefix: false,
  cooldown: 5,
  aliases: ["randommeme", "meme"],
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const response = await axios.get('https://jerome-web.gleeze.com/service/api/random-meme');
    const memeData = response.data.data;

    if (!memeData || !memeData.url) {
      return api.sendMessage("No meme for you.", event.threadID, event.messageID);
    }

    const imageStream = await axios.get(memeData.url, { responseType: 'stream' });

    return api.sendMessage({
      body: "Here's a random meme 🤣",
      attachment: imageStream.data
    }, event.threadID);
  } catch (error) {
    console.error('ranmeme command error:', error.message);
    return api.sendMessage("Error: Could not fetch meme.", event.threadID, event.messageID);
  }
};