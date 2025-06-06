module.exports.config = {
  name: "vernautohello",
  version: "1.0.0",
  credits: "vern",
  description: "Send a welcome greeting message.",
  commandCategory: "Automation",
  usages: "",
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  const greeting = "👋 Hello everyone! Welcome to the chat! Feel free to introduce yourself.";
  return api.sendMessage(greeting, event.threadID);
};
