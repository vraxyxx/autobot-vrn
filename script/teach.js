const axios = require('axios');

module.exports.config = {
  name: 'teach',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['simsimi-teach'],
  description: 'Teach the SimSimi API with a question and answer.',
  usage: 'teach <ask> | <answer>',
  credits: 'Developer',
  cooldown: 5,
};

module.exports.run = async function({ api, event, args }) {
  const senderId = event.senderID;
  const input = args.join(' ').split('|').map(part => part.trim());
  const ask = input[0];
  const ans = input[1];

  if (!ask || !ans) {
    return api.sendMessage(
      'Error: Please provide a question and an answer separated by "|".\nExample: teach Hello | Hi there!',
      event.threadID,
      event.messageID
    );
  }

  const waitingMessage = 'Submitting your teach request...';
  api.sendMessage(waitingMessage, event.threadID, async (err, info) => {
    if (err) return;

    try {
      const apiKey = '2a5a2264d2ee4f0b847cb8bd809ed34bc3309be7';
      const apiUrl = `https://simsimi.ooguy.com/teach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}&apikey=${apiKey}`;
      const { data } = await axios.get(apiUrl);

      if (!data || !data.message) {
        return api.editMessage('Error: No response from Teach API.', info.messageID);
      }

      const teachNote = data.teachResponse?.respond || 'No extra details.';
      return api.editMessage(
        `Teach Response: ${data.message}\nNote: ${teachNote}`,
        info.messageID
      );
    } catch (error) {
      console.error('Teach command error:', error.message);
      return api.editMessage('Error: Failed to connect to Teach API.', info.messageID);
    }
  });
};