module.exports.config = {
  name: "war",
  version: "1.0.2",
  role: 2,
  description: "Friendly group war with funny messages.",
  prefix: false,
  premium: false,
  credits: "Priyansh Rajput (modified by vern)",
  cooldowns: 10,
  category: "group"
};

module.exports.languages = {
  english: {
    noMention: "⚠️ Please mention a user to start the friendly war!",
    started: "⚔️ Starting a friendly war with @{name}!"
  }
};

module.exports.run = async function ({ api, event, getText }) {
  const { threadID, messageID, mentions } = event;
  const mentionID = Object.keys(mentions)[0];

  if (!mentionID) {
    return api.sendMessage(getText("noMention"), threadID, messageID);
  }

  const mentionName = mentions[mentionID];
  const messages = [
    getText("started").replace("{name}", mentionName),
    "🔥 Listen up, warriors!",
    "⚔️ Prepare yourselves for an epic battle!",
    "🗡️ Sharpen your words, the war has begun!",
    "📣 Are you ready to rumble?",
    "🏆 May the best fighter win!",
    "😆 This is a friendly showdown, no hard feelings!",
    "🎉 Remember to have fun!",
    "💣 Warriors, attack!",
    "🚩 Victory is near!",
    "🤝 Good fight, everyone!",
    "☮️ Peace is restored. Until next time!"
  ];

  // Sequentially send each message with delay
  for (let i = 0; i < messages.length; i++) {
    await new Promise(resolve => setTimeout(resolve, i === 0 ? 1000 : 5000));

    if (i === 0) {
      // First message with mention
      api.sendMessage({
        body: messages[i],
        mentions: [{
          id: mentionID,
          tag: mentionName
        }]
      }, threadID, messageID);
    } else {
      api.sendMessage(messages[i], threadID);
    }
  }
};
