module.exports.config = {
  name: "vernstatus",
  version: "1.0.0",
  credits: "vern",
  description: "Shows bot's current uptime and status.",
  commandCategory: "Automation",
  usages: "",
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  const statusMsg = `🤖 Bot Uptime: ${hours}h ${minutes}m ${seconds}s\nStatus: Running smoothly!`;
  return api.sendMessage(statusMsg, event.threadID);
};
