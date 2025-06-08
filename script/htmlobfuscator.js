const axios = require('axios');

module.exports.config = {
  name: "htmlobfuscator",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Obfuscate HTML code using the Kaiz API.",
  usage: "/htmlobfuscator <your HTML code>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Utility"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const code = args.join(' ').trim();
  const prefix = "/"; // Change if your bot uses a dynamic prefix

  // No code provided
  if (!code) {
    const usageMessage = `════『 𝗛𝗧𝗠𝗟 𝗢𝗕𝗙𝗨𝗦𝗖𝗔𝗧𝗢𝗥 』════\n\n` +
      `⚠️ Please provide the HTML code you want to obfuscate.\n\n` +
      `📌 Usage: ${prefix}htmlobfuscator <your HTML code>\n` +
      `💬 Example: ${prefix}htmlobfuscator <!DOCTYPE html>\n\n` +
      `> Thank you for using the HTML Obfuscator!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗛𝗧𝗠𝗟 𝗢𝗕𝗙𝗨𝗦𝗖𝗔𝗧𝗢𝗥 』════\n\n` +
      `🔄 Obfuscating your HTML code...\nPlease wait a moment.`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the HTML Obfuscator API
    const apiUrl = "https://kaiz-apis.gleeze.com/api/html-obfuscator";
    const response = await axios.get(apiUrl, {
      params: {
        code: code,
        apikey: "4fe7e522-70b7-420b-a746-d7a23db49ee5"
      }
    });

    // Format response
    let resultMsg = `════『 𝗛𝗧𝗠𝗟 𝗢𝗕𝗙𝗨𝗦𝗖𝗔𝗧𝗢𝗥 』════\n\n`;

    if (response.data && (response.data.obfuscated || response.data.result)) {
      resultMsg += `🗝️ Obfuscated HTML:\n\n`;
      resultMsg += `${response.data.obfuscated || response.data.result}`;
    } else {
      resultMsg += "⚠️ Unable to parse obfuscator data.";
    }

    resultMsg += `\n\n> Powered by Kaiz HTML Obfuscator API`;

    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in htmlobfuscator command:', error.message || error);

    const errorMessage = `════『 𝗛𝗧𝗠𝗟 𝗢𝗕𝗙𝗨𝗦𝗖𝗔𝗧𝗢𝗥 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to obfuscate HTML code.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};