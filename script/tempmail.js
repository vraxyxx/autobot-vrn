const axios = require('axios');

module.exports.config = {
  name: 'tempmail',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['tempmail'],
  description: 'Generate a temporary email or check inbox messages.',
  usage: 'temp gen | temp inbox <email>',
  credits: 'Developer',
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
  const senderId = event.senderID;
  const subCommand = args[0];
  const apiBase = 'https://smfahim.xyz/tempmail';

  if (!subCommand) {
    return api.sendMessage(
      'Usage:\n• temp gen\n• temp inbox <email>',
      event.threadID,
      event.messageID
    );
  }

  const waitingMsg = '⌛ Please wait...';
  api.sendMessage(waitingMsg, event.threadID, async (err, info) => {
    if (err) return;

    try {
      if (subCommand === 'gen') {
        const { data } = await axios.get(apiBase);
        if (!data.email) {
          return api.editMessage('❌ Error: Could not generate email.', info.messageID);
        }

        const message = `📩 Email: ${data.email}\n\n🔎 Check inbox: temp inbox ${data.email}`;
        return api.editMessage(message, info.messageID);

      } else if (subCommand === 'inbox') {
        const email = args[1];
        if (!email) {
          return api.editMessage('❌ Please provide an email address to check.', info.messageID);
        }

        const { data: messages } = await axios.get(`${apiBase}/inbox?email=${encodeURIComponent(email)}`);

        if (!messages || messages.length === 0) {
          return api.editMessage('😢 No messages found for this email.', info.messageID);
        }

        let inboxText = '📬 Inbox:\n';
        messages.forEach(msg => {
          inboxText += `\n📑 Title: ${msg.subject}\n✉️ Body: ${msg.body_text}\n----------------------------`;
        });

        return api.editMessage(inboxText, info.messageID);
      } else {
        return api.editMessage('Usage:\n• temp gen\n• temp inbox <email>', info.messageID);
      }

    } catch (error) {
      console.error('Temp command error:', error.message);
      return api.editMessage('❌ Error: Can’t connect to Tempmail API.', info.messageID);
    }
  });
};