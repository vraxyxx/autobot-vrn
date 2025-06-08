const axios = require('axios');

module.exports.config = {
  name: "lbc",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Send a message using the LBC API.",
  usage: "/lbc <number> <message> [count]",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Utility"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prefix = "/"; // Adjust if your bot uses a dynamic prefix

  if (args.length < 2) {
    const usageMessage = `════『 𝗟𝗕𝗖 𝗔𝗣𝗜 』════\n\n` +
      `⚠️ Please provide a number and a message.\n\n` +
      `📌 Usage: ${prefix}lbc <number> <message> [count]\n` +
      `💬 Example: ${prefix}lbc 09123456789 Hello! 3\n\n` +
      `> Powered by Jonell01 LBC API`;
    return api.sendMessage(usageMessage, threadID, messageID);
  }

  const number = args[0];
  const count = isNaN(Number(args[args.length - 1])) ? 1 : Number(args.pop());
  const message = args.slice(1).join(" ");

  try {
    // Loading message
    const waitMsg = `════『 𝗟𝗕𝗖 𝗔𝗣𝗜 』════\n\n📤 Sending message...\nPlease wait a moment.`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the LBC API
    const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/lbc?number=${encodeURIComponent(number)}&message=${encodeURIComponent(message)}&count=${count}`;
    const response = await axios.get(apiUrl);

    let resultMsg = `════『 𝗟𝗕𝗖 𝗔𝗣𝗜 』════\n\n`;

    if (response.data && (response.data.result || response.data.message)) {
      resultMsg += `${response.data.result || response.data.message}`;
    } else if (typeof response.data === "string") {
      resultMsg += response.data;
    } else {
      resultMsg += "⚠️ No clear response from the LBC API.";
    }

    resultMsg += `\n\n> Powered by Jonell01 LBC API`;
    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in lbc command:', error.message || error);

    const errorMessage = `════『 𝗟𝗕𝗖 𝗔𝗣𝗜 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to process your request.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};