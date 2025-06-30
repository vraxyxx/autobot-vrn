const axios = require("axios");

const API_KEY = 'b5e85d38-1ccc-4aeb-84fd-a56a08e8361a';
const BASE_URL = 'https://kaiz-apis.gleeze.com/api/openrouter';

module.exports.config = {
  name: "ask",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ['ai', 'gemma', 'chat'],
  usage: "ask [your question]",
  description: "Ask an AI a question using Kaiz API (Gemma-2-9B)",
  credits: "Vern",
  cooldown: 4
};

module.exports.run = async function ({ api, event, args }) {
  const question = args.join(" ");
  if (!question) return api.sendMessage("❓ Please ask a question.\n\nExample:\nask what is AI", event.threadID, event.messageID);

  api.sendMessage(`💬 Thinking...\n🤖 Model: google/gemma-2-9b-it`, event.threadID, event.messageID);

  try {
    const res = await axios.get(BASE_URL, {
      params: {
        ask: question,
        model: "google/gemma-2-9b-it:free",
        apikey: API_KEY
      }
    });

    const reply = res.data?.result;
    if (!reply) {
      return api.sendMessage("⚠️ No answer received from the AI.", event.threadID, event.messageID);
    }

    // Simulate more human-like response
    const cleaned = reply
      .replace(/\*\*/g, '') // remove bold if exists
      .replace(/(?:\\n|\\r|\\t)/g, '\n') // ensure line breaks
      .trim();

    // Send the AI's reply
    api.sendMessage(`🧠 ${cleaned}`, event.threadID, event.messageID);

  } catch (err) {
    console.error("❌ AI error:", err.message);
    return api.sendMessage(
      `❌ Error while querying AI:\n${err.response?.data?.message || err.message}`,
      event.threadID,
      event.messageID
    );
  }
};
