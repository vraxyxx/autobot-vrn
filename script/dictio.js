const axios = require('axios');

module.exports.config = {
  name: "dictio",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Get word definitions using the Jonell01 Dictionary API.",
  usage: "/dictio <word>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Utility"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prefix = "/"; // Adjust if your bot uses a different prefix

  if (args.length < 1) {
    const usageMessage = `════『 𝗗𝗜𝗖𝗧𝗜𝗢𝗡𝗔𝗥𝗬 』════\n\n` +
      `⚠️ Please provide a word to look up.\n\n` +
      `📌 Usage: ${prefix}dictio <word>\n` +
      `💬 Example: ${prefix}dictio hello\n\n` +
      `> Powered by Jonell01 Dictionary API`;
    return api.sendMessage(usageMessage, threadID, messageID);
  }

  const queryWord = args.join(" ");

  try {
    // Loading message
    const waitMsg = `════『 𝗗𝗜𝗖𝗧𝗜𝗢𝗡𝗔𝗥𝗬 』════\n\n🔍 Searching for the definition of: "${queryWord}"\nPlease wait a moment.`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Dictionary API
    const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/dictio?q=${encodeURIComponent(queryWord)}`;
    const response = await axios.get(apiUrl);

    let resultMsg = `════『 𝗗𝗜𝗖𝗧𝗜𝗢𝗡𝗔𝗥𝗬 』════\n\n`;

    if (response.data && response.data.result) {
      resultMsg += `Definition of "${queryWord}":\n${response.data.result}`;
    } else if (typeof response.data === "string") {
      resultMsg += response.data;
    } else {
      resultMsg += "⚠️ No definition found for your word.";
    }

    resultMsg += `\n\n> Powered by Jonell01 Dictionary API`;
    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in dictio command:', error.message || error);

    const errorMessage = `════『 𝗗𝗜𝗖𝗧𝗜𝗢𝗡𝗔𝗥𝗬 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to get the definition.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};