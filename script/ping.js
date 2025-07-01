module.exports.config = {
  name: "ping",
  version: "1.0.0",
  description: "Responds with pong Ang Pangit Mo"
};

module.exports.run = async function({ api, event }) {
  api.sendMessage("🏓 Pong Ang Pangit Mo!", event.threadID, event.messageID);
};