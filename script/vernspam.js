module.exports.config = {
  name: "vernspam",
  version: "1.0.0",
  credits: "vern",
  description: "Send multiple spam messages.",
  commandCategory: "Utility",
  usages: "<count> <message>",
  cooldowns: 10
};

module.exports.run = async function({ api, event, args }) {
  try {
    if (args.length < 2) {
      return api.sendMessage("Usage: !vernspam <count> <message>", event.threadID);
    }

    const count = parseInt(args[0]);
    if (isNaN(count) || count < 1 || count > 20) {
      return api.sendMessage("Please specify a count between 1 and 20.", event.threadID);
    }

    const message = args.slice(1).join(" ");

    for (let i = 0; i < count; i++) {
      await api.sendMessage(message, event.threadID);
    }
  } catch (error) {
    console.error(error);
  }
};
