module.exports.config = {
  name: "vernrant",
  version: "1.0.1",
  credits: "vern",
  description: "Spam 100 angry emojis aggressively in the thread.",
  commandCategory: "Fun",
  usages: "",
  cooldowns: 20
};

const angryEmojis = ["😡","🤬","😤","👿","💢","🔥","🤯","😠","😾"];

module.exports.run = async function({ api, event }) {
  try {
    const threadID = event.threadID;

    for (let i = 0; i < 100; i++) {
      const emoji = angryEmojis[Math.floor(Math.random() * angryEmojis.length)];
      await api.sendMessage(emoji, threadID);
    }
  } catch (error) {
    console.error(error);
  }
};
