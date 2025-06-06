module.exports.config = {
  name: "say",
  version: "1.0.0",
  credits: "vern",
  description: "Make the bot repeat your message.",
  commandCategory: "Fun",
  usages: "<message>",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  try {
    if (!args.length) 
      return api.sendMessage("Please provide a message to say!", event.threadID);

    const message = args.join(" ");
    return api.sendMessage(message, event.threadID);
  } catch (error) {
    console.error(error);
  }
};
