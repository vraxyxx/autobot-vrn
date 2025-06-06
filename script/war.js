module.exports.config = {
  name: "war",
  version: "1.0.1",
  permission: 2,
  credits: "Priyansh Rajput",
  description: "Friendly group war with funny messages",
  prefix: false,
  premium: false,
  category: "group",
  usages: "war @user",
  cooldowns: 10
};

module.exports.languages = {
  english: {
    noMention: "⚠️ Please mention a user to start the friendly war!",
    started: "⚔️ Starting a friendly war with @{name}!"
  }
};

module.exports.run = async function ({ api, event, getText }) {
  const mentionID = Object.keys(event.mentions)[0];
  if (!mentionID) return api.sendMessage(getText("noMention"), event.threadID, event.messageID);

  const mentionName = event.mentions[mentionID];
  const send = (msg) => api.sendMessage(msg, event.threadID);

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

  messages.forEach((msg, i) => {
    setTimeout(() => {
      if (i === 0) {
        send({ body: msg, mentions: [{ id: mentionID, tag: mentionName }] });
      } else {
        send(msg);
      }
    }, i * 5000);
  });
};