module.exports.config = {
  name: "ping",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  credits: "Vern",
  description: "Responds with pong"
  usage: "ping",
  cooldown: 5,
};

module.exports.run = async function({ api, event }) {
  api.sendMessage("🏓 Pong!", event.threadID, event.messageID);
};