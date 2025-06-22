const axios = require("axios");

module.exports.config = {
  name: "pixtral",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: "Chat with the Pixtral 12B AI model.",
  usage: "pixtral <message>",
  credits: "Vern",
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  const query = args.join(" ");
  if (!query) {
    return api.sendMessage(
      "❌ 𝗘𝗿𝗿𝗼𝗿: Please provide a message to chat with Pixtral.\n\n📌 Example: pixtral What is quantum computing?",
      threadID,
      messageID
    );
  }

  try {
    await api.sendMessage("🤖 Connecting to Pixtral...", threadID, messageID);

    const apiUrl = `https://kaiz-apis.gleeze.com/api/pixtral-12b?q=${encodeURIComponent(query)}&uid=${senderID}&apikey=APIKEYYYY`;
    const { data } = await axios.get(apiUrl);

    if (!data.content) {
      return api.sendMessage("❌ No response from Pixtral API.", threadID, messageID);
    }

    const responseText = `🤖 𝗣𝗶𝘅𝘁𝗿𝗮𝗹 𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲:\n\n${data.content}`;
    return api.sendMessage(responseText, threadID, messageID);

  } catch (error) {
    console.error("pixtral command error:", error.message);
    return api.sendMessage(
      `❌ An error occurred while connecting to Pixtral: ${error.message}`,
      threadID,
      messageID
    );
  }
};