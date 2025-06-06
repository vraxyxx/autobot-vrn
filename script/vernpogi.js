module.exports.config = {
  name: "vernpogi",
  version: "1.0.0",
  credits: "vern",
  description: "A fun command that sends a compliment message.",
  commandCategory: "Fun",
  usages: "[optional message]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  try {
    const msg = args.length 
      ? args.join(" ") 
      : "yes sobrang pogi ackk pati aso naglalaway! 😎🔥";

    return api.sendMessage(msg, event.threadID);
  } catch (err) {
    console.error(err);
  }
};
