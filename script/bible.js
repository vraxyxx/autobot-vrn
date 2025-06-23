const axios = require("axios");

module.exports.config = {
  name: "bible",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: "Fetch a Bible verse!",
  usage: "bible",
  credits: "Dale Mekumi",
  cooldown: 3,
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  // Notify user
  await api.sendMessage("📖 Fetching a Bible verse...", threadID, messageID);

  try {
    const response = await axios.get("https://ace-rest-api.onrender.com/api/bibleverse");

    const data = response.data;

    // Check if API returned the expected fields
    if (!data || !data.verse || !data.book || !data.chapter || !data.verse_number) {
      return api.sendMessage(
        "🥺 Sorry, the verse data was incomplete or not found.",
        threadID,
        messageID
      );
    }

    const message = `📜 𝗕𝗶𝗯𝗹𝗲 𝗩𝗲𝗿𝘀𝗲\n\n` +
      `"${data.verse}"\n\n` +
      `📖 ${data.book} ${data.chapter}:${data.verse_number}`;

    return api.sendMessage(message, threadID, messageID);

  } catch (error) {
    console.error("❌ Bible command error:", error);
    return api.sendMessage(
      `❌ An error occurred while fetching the verse.\nReason: ${error.response?.data?.message || error.message}`,
      threadID,
      messageID
    );
  }
};
