const axios = require('axios');

module.exports.run = async function ({ api, event, args }) {
  const message = args.join(' ');

  if (!message) {
    return api.sendMessage(
      'Provide message ',
      event.threadID,
      event.messageID
    );
  }

  try {
    const apiUrl = `https://jer-ai.gleeze.com/meta?senderid=${encodeURIComponent(event.senderID)}&message=${encodeURIComponent(message)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.response) {
      return api.sendMessage(
        '𝗘𝗿𝗿𝗼𝗿: 𝗡𝗼 𝗿𝗲𝘀𝗽𝗼𝗻𝘀𝗲 𝗿𝗲𝗰𝗲𝗶𝘃𝗲𝗱 𝗳𝗿𝗼𝗺 𝗠𝗲𝘁𝗮 𝗔𝗜.',
        event.threadID,
        event.messageID
      );
    }

    return api.sendMessage(
      `∞ | 𝗠𝗲𝘁𝗮 𝗔𝗜 :\n\n${data.response}`,
      event.threadID
    );

  } catch (error) {
    console.error('meta command error:', error.message);
    return api.sendMessage(
      '𝗘𝗿𝗿𝗼𝗿: 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗰𝗼𝗻𝗻𝗲𝗰𝘁 𝘁𝗼 𝗠𝗲𝘁𝗮 𝗔𝗜 𝗔𝗣𝗜.',
      event.threadID,
      event.messageID
    );
  }
};

module.exports.config = {
  name: 'meta',
  version: '1.0.0',
  hasPermission: 0,
  credits: 'Vern',
  description: 'Get a response from Facebook Meta AI.',
  usage: 'meta <ask>',
  cooldown: 3
};