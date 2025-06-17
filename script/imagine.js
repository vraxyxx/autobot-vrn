const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'imagine',
  description: 'generates an image based on prompt',
  author: 'Vern',
  async execute(senderId, args, pageAccessToken) {
    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(senderId, { text: '𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝘆𝗼𝘂𝗿 𝗽𝗿𝗼𝗺𝗽𝘁.' }, pageAccessToken);
      return;
    }

    const prompt = args.join(' ');

    try {
      const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/generate-art?prompt=${encodeURIComponent(prompt)}`;

      await sendMessage(senderId, { attachment: { type: 'image', payload: { url: apiUrl } } }, pageAccessToken);

    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Could not generate image.' }, pageAccessToken);
    }
  }
};