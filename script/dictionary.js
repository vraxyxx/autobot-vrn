const axios = require('axios');

module.exports.config = {
  name: "dictionary",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Get word definitions using the Kaiz Dictionary API.",
  usage: "/dictionary <word>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Utility"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const word = args.join(' ').trim();
  const prefix = "/"; // Change if your bot uses a dynamic prefix

  // No word provided
  if (!word) {
    const usageMessage = `════『 𝗗𝗜𝗖𝗧𝗜𝗢𝗡𝗔𝗥𝗬 』════\n\n` +
      `⚠️ Please provide a word to look up.\n\n` +
      `📌 Usage: ${prefix}dictionary <word>\n` +
      `💬 Example: ${prefix}dictionary languages\n\n` +
      `> Thank you for using the Dictionary!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗗𝗜𝗖𝗧𝗜𝗢𝗡𝗔𝗥𝗬 』════\n\n` +
      `🔎 Looking up the word: "${word}"\nPlease wait a moment...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Dictionary API
    const apiUrl = "https://kaiz-apis.gleeze.com/api/dictionary";
    const response = await axios.get(apiUrl, {
      params: {
        word: word,
        apikey: "4fe7e522-70b7-420b-a746-d7a23db49ee5"
      }
    });

    const data = response.data;
    let resultMsg = `════『 𝗗𝗜𝗖𝗧𝗜𝗢𝗡𝗔𝗥𝗬 』════\n\n`;

    if (typeof data === "object" && (data.definition || data.result || data.word)) {
      resultMsg += `• Word: ${data.word || word}\n`;
      if (data.pronunciation) resultMsg += `• Pronunciation: ${data.pronunciation}\n`;
      if (data.partOfSpeech) resultMsg += `• Part of Speech: ${data.partOfSpeech}\n`;
      if (data.definition) resultMsg += `• Definition: ${data.definition}\n`;
      if (data.example) resultMsg += `• Example: ${data.example}\n`;
      if (data.result) resultMsg += `• Result: ${data.result}\n`;
    } else {
      resultMsg += "⚠️ No definition found.";
    }

    resultMsg += `\n> Powered by Kaiz Dictionary API`;

    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in dictionary command:', error.message || error);

    const errorMessage = `════『 𝗗𝗜𝗖𝗧𝗜𝗢𝗡𝗔𝗥𝗬 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to fetch the definition.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};