module.exports.config = {
  name: "vernjoke",
  version: "1.0.0",
  credits: "vern",
  description: "Tell a random joke to lighten the mood.",
  commandCategory: "Fun",
  usages: "",
  cooldowns: 5
};

const jokes = [
  "Why don’t scientists trust atoms? Because they make up everything!",
  "I told my computer I needed a break, and now it won’t stop sending me Kit-Kat ads.",
  "Why did the scarecrow win an award? Because he was outstanding in his field!",
  "I would tell you a construction joke, but I’m still working on it."
];

module.exports.run = async function({ api, event }) {
  const joke = jokes[Math.floor(Math.random() * jokes.length)];
  return api.sendMessage(joke, event.threadID);
};
