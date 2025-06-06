module.exports.config = {
  name: 'uid',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['userid', 'getid'],
  description: 'Get user or group ID',
  usage: 'uid [id/reply/group/all]',
  credits: 'Joshua Apostol',
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, senderID, type, messageReply, participantIDs, mentions } = event;
  let id;

  if (!args[0]) {
    id = senderID;
  }

  if (args[0]) {
    if (args[0].startsWith('https://')) {
      try {
        const uid = await api.getUID(args[0]);
        return api.shareContact(uid, uid, threadID);
      } catch (error) {
        return api.sendMessage('Invalid URL or unable to retrieve UID.', threadID);
      }
    }
  }

  if (type === 'message_reply') {
    id = messageReply.senderID;
  }

  const input = args.join(' ');
  if (input.includes('@')) {
    id = Object.keys(mentions)[0];
  }

  if (input === 'all') {
    let message = '';
    participantIDs.forEach((participantID, index) => {
      message += `${index + 1}. ${participantID}\n`;
    });
    return api.sendMessage(message, threadID);
  }

  if (input === '-g' || input === 'group') {
    return api.sendMessage(threadID, threadID);
  }

  return api.shareContact(id, id, threadID);
};