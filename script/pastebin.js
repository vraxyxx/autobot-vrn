const axios = require('axios');

module.exports.config = {
  name: 'pastebin',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['paste', 'bin'],
  description: 'Creates a pastebin link from input text.',
  usage: 'pastebin <text>',
  credits: 'developer',
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (args.length === 0) {
    return api.sendMessage('Usage: pastebin <text>', threadID, messageID);
  }

  const content = args.join(' ');

  api.sendMessage('Creating Pastebin link...', threadID, async (err, info) => {
    if (err) return;

    try {
      const response = await axios.get(`https://rapido.zetsu.xyz/api/pastebin?c=${encodeURIComponent(content)}`);
      const data = response.data;

      if (!data.url) {
        throw new Error('No Pastebin URL returned');
      }

      const message = `Pastebin Link:\n${data.url}`;
      return api.editMessage(message, info.messageID);
    } catch (error) {
      console.error('pastebin command error:', error.message);
      return api.editMessage('Error: Could not generate Pastebin link.', info.messageID);
    }
  });
};