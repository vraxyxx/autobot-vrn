module.exports.config = {
  name: "vernquote",
  version: "1.0.0",
  credits: "vern",
  description: "Send a random inspirational quote.",
  commandCategory: "Fun",
  usages: "",
  cooldowns: 5
};

const quotes = [
  "The only way to do great work is to love what you do. – Steve Jobs",
  "Be yourself; everyone else is already taken. – Oscar Wilde",
  "In the middle of every difficulty lies opportunity. – Albert Einstein",
  "Don't watch the clock; do what it does. Keep going. – Sam Levenson",
  "Success is not final, failure is not fatal: It is the courage to continue that counts. – Winston Churchill"
];

module.exports.run = async function({ api, event }) {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  return api.sendMessage(`💡 Inspirational Quote:\n\n"${randomQuote}"`, event.threadID);
};
