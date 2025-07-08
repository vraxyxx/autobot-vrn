const axios = require("axios");

module.exports.config = {
  name: "colorroulette",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  aliases: ["roulette", "colorbet"],
  description: "Bet on your favorite color and try your luck!",
  usage: "colorroulette [color] [amount]",
  credits: "Vern",
  cooldown: 2
};

module.exports.run = async function ({ api, event, args, Currencies }) {
  const { threadID, messageID, senderID } = event;
  const colors = ["red", "blue", "green", "yellow", "orange", "purple", "pink"];

  const selectedColor = args[0]?.toLowerCase();
  const betAmount = parseInt(args[1]);

  // Validate color
  if (!selectedColor || !colors.includes(selectedColor)) {
    return api.sendMessage(`🎨 Invalid color!\nChoose one: ${colors.join(", ")}`, threadID, messageID);
  }

  // Validate amount
  if (!betAmount || isNaN(betAmount) || betAmount <= 0) {
    return api.sendMessage(`💰 Invalid amount!\nUsage: colorroulette [color] [amount]`, threadID, messageID);
  }

  // Check user balance
  const userData = await Currencies.getData(senderID);
  if (userData.money < betAmount) {
    return api.sendMessage(`❌ You don't have enough balance to bet $${betAmount}`, threadID, messageID);
  }

  const winningColor = colors[Math.floor(Math.random() * colors.length)];

  let resultMessage = "";
  let winnings = 0;

  if (selectedColor === winningColor) {
    winnings = betAmount * 3;
    await Currencies.increaseMoney(senderID, winnings);
    resultMessage = `🎉 You WON!\nColor: ${winningColor}\nPayout: $${winnings.toLocaleString()}`;
  } else {
    await Currencies.decreaseMoney(senderID, betAmount);
    resultMessage = `😢 You LOST!\nWinning Color: ${winningColor}\nYou lost $${betAmount.toLocaleString()}`;
  }

  return api.sendMessage(resultMessage, threadID, messageID);
};
