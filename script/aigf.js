const axios = require("axios");

module.exports.config = {
  name: "aigf",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: "Get a reply from AIGF.",
  usage: "aigf <message>",
  credits: "Vern",
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  const query = args.join(" ");
  if (!query) {
    return api.sendMessage(
      "❌ 𝗘𝗿𝗿𝗼𝗿: Please provide a message.\n\n📌 Example: aigf hello",
      threadID,
      messageID
    );
  }

  try {
    await api.sendMessage("🤖 Fetching response from AIGF...", threadID, messageID);

    const apiUrl = `https://xvi-rest-api.vercel.app/api/aigf?message=${encodeURIComponent(query)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.response) {
      return api.sendMessage("❌ No response from AIGF.", threadID, messageID);
    }

    const responseText = `🤖 | 𝗔𝗜𝗚𝗙:\n${data.response}`;
    return api.sendMessage(responseText, threadID, messageID);

  } catch (error) {
    console.error("aigf command error:", error.message);
    return api.sendMessage(
      `❌ An error occurred: ${error.message}`,
      threadID,
      messageID
    );
  }
};