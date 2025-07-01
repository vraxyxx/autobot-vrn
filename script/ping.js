module.exports.config = {
  name: "ping",
  version: "1.0.0",
  description: "Responds with pong"
};

module.exports.run = async function({ api, event }) {
  api.sendMessage("🏓 Pong!", event.threadID, event.messageID);
};