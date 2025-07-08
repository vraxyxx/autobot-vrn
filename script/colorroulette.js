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
  cooldown: 2,
};

module.exports.run = async function ({ api, event, args, Currencies }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const senderID = event.senderID;

  const colors = ["red", "blue", "green", "yellow", "orange", "purple", "pink"];
  const selectedColor = args[0]?.toLowerCase();
  const amount = parseInt(args[1]);

  if (!selectedColor || !colors.includes(selectedColor)) {
    return api.sendMessage(
      `🎨 Invalid color!\nChoose one of: ${colors.join(", ")}`,
      threadID,
      messageID
    );
  }

  if (!amount || isNaN(amount) || amount <= 0) {
    return api.sendMessage(
      `💰 Invalid amount!\nUsage: colorroulette [color] [amount]`,
      threadID,
      messageID
    );
  }

  const userData = await Currencies.getData(senderID);
  const userMoney = userData.money;

  if (userMoney < amount) {
    return api.sendMessage(
      `❌ You don't have enough balance to place a $${amount.toLocaleString()} bet.`,
      threadID,
      messageID
    );
  }

  api.sendMessage("🎲 𝗣𝗟𝗔𝗖𝗜𝗡𝗚 𝗬𝗢𝗨𝗥 𝗕𝗘𝗧...", threadID, async (err, info) => {
    if (err) return;

    const winningColor = colors[Math.floor(Math.random() * colors.length)];
    let resultText = "";
    let changeAmount = 0;

    if (selectedColor === winningColor) {
      changeAmount = amount * 3;
      await Currencies.increaseMoney(senderID, changeAmount);
      resultText = `🎉 𝗬𝗢𝗨 𝗪𝗢𝗡!\n━━━━━━━━━━━━━━━━━━\n🎯 Winning Color: ${winningColor}\n💰 Prize: $${changeAmount.toLocaleString()}`;
    } else {
      changeAmount = -amount;
      await Currencies.decreaseMoney(senderID, -changeAmount);
      resultText = `😢 𝗬𝗢𝗨 𝗟𝗢𝗦𝗧\n━━━━━━━━━━━━━━━━━━\n🎯 Winning Color: ${winningColor}\n💸 Lost: $${amount.toLocaleString()}`;
    }

    api.getUserInfo(senderID, (err, infoUser) => {
      const userName = infoUser?.[senderID]?.name || "Player";
      const timePH = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Manila",
      });

      const replyMessage = `🎮 𝗖𝗢𝗟𝗢𝗥 𝗥𝗢𝗨𝗟𝗘𝗧𝗧𝗘\n━━━━━━━━━━━━━━━━━━\n${resultText}\n━━━━━━━━━━━━━━━━━━\n🧑 Player: ${userName}\n⏰ Time: ${timePH}`;

      api.editMessage(replyMessage, info.messageID);
    });
  });
};
