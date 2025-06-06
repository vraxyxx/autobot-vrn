module.exports.config = {
  name: "bsit",
  version: "1.0.0",
  credits: "vern",
  description: "Send a motivational message for BSIT students.",
  commandCategory: "Fun",
  usages: "[optional message]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  try {
    const msg = args.length
      ? args.join(" ")
      : "Nganong nag IT man ka awa ron guba imong kaugmaon haha, abi nimo pindot² ra no? diha ta nasayop, Kay abi pud nako!";

    return api.sendMessage(msg, event.threadID);
  } catch (error) {
    console.error(error);
  }
};
