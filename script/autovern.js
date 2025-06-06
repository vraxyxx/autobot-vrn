module.exports.config = {
  name: "autovern",
  version: "1.0.0",
  credits: "vern",
  description: "Auto Vern command that replies with a preset message or custom input.",
  commandCategory: "General",
  usages: "[optional message]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  try {
    const message = args.length 
      ? args.join(" ") 
      : "This is the autobot of vern feel free to use!";

    return api.sendMessage(message, event.threadID);
  } catch (error) {
    console.error(error);
  }
};
