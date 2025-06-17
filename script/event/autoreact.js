module.exports.config = {
  name: "autoreact",
  type: "event",
  eventType: ["message"],
  version: "1.0",
  credits: "Vern", // DO NOT CHANGE
};

module.exports.run = async function ({ api, event }) {
  if (!event.body) return;
  const message = event.body.toLowerCase();

  const reactionsMap = {
    "😂": [
      "haha", "lol", "funny", "hahah", "hahaha", "masaya", "happy", "🤣",
      "natomba", "tumomba", "tomomba", "tumumba", "tomumba",
      "side eye", "awooop jumpscare", "so masaya ka?", "sana all"
    ],
    "😭": [
      "cry", "sad", "crying", "bakit ka malungkot?", "bakit ka malongkot?",
      "hindi na", "sad ka", "walang ulam"
    ],
    "🥰": ["love", "mahal", "crush"],
    "🎮": ["laro", "laru", "game", "mc", "minecraft", "ml", "mlbb", "mobile legends", "mobile legends bang bang", "cod", "call of duty"]
  };

  for (const [reaction, keywords] of Object.entries(reactionsMap)) {
    if (keywords.some(word => message.includes(word))) {
      api.setMessageReaction(reaction, event.messageID, event.threadID, api);
      break;
    }
  }
};
