const axios = require("axios");

module.exports.config = {
  name: "search",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: "Get definition of a word from Merriam-Webster.",
  usage: "search <word>",
  credits: "Vern",
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (args.length < 1) {
    return api.sendMessage(
      "❌ Error: Please provide a word to look up.\n\nExample: search example",
      threadID,
      messageID
    );
  }

  const word = args[0];
  const apiUrl = `https://jerome-web.gleeze.com/service/api/merriam?word=${encodeURIComponent(word)}`;

  try {
    const { data } = await axios.get(apiUrl);

    if (!data.results || data.results.length === 0) {
      return api.sendMessage(
        `❌ No definitions found for "${word}".`,
        threadID,
        messageID
      );
    }

    const definitions = data.results[0].definitions
      .slice(0, 5)
      .map((def, i) => `${i + 1}. ${def}`)
      .join("\n");

    return api.sendMessage(
      `📚 Definition of "${data.word}" (${data.results[0].partOfSpeech}):\n\n${definitions}`,
      threadID,
      messageID
    );
  } catch (error) {
    console.error("search command error:", error.message);
    return api.sendMessage(
      "❌ Error: Could not retrieve definition.",
      threadID,
      messageID
    );
  }
};