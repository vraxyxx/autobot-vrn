const axios = require('axios');

module.exports.config = {
  name: "teach",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Teach the chatbot a new question and answer (Priyansh SIM API).",
  usage: "/teach <question> | <answer>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "AI"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prefix = "/"; // Adjust if your bot uses a different prefix

  // Combine all args and split by the first '|'
  const input = args.join(" ");
  const parts = input.split("|");

  if (parts.length < 2) {
    const usageMessage =
      `════『 𝗧𝗘𝗔𝗖𝗛 𝗔𝗜 』════\n\n` +
      `⚠️ Please provide a question and an answer separated by '|'.\n\n` +
      `📌 Usage: ${prefix}teach <question> | <answer>\n` +
      `💬 Example: ${prefix}teach What is AI? | Artificial Intelligence\n\n` +
      `> Powered by Priyansh SIM API`;
    return api.sendMessage(usageMessage, threadID, messageID);
  }

  const ask = parts[0].trim();
  const ans = parts.slice(1).join("|").trim();

  try {
    // Loading message
    const waitMsg = `════『 𝗧𝗘𝗔𝗖𝗛 𝗔𝗜 』════\n\n📤 Teaching the bot your Q&A...\nPlease wait.`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // API call
    const apiUrl = `https://sim-api-by-priyansh.glitch.me/sim?type=teach&ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}&apikey=PriyanshVip`;
    const response = await axios.get(apiUrl);

    let resultMsg = `════『 𝗧𝗘𝗔𝗖𝗛 𝗔𝗜 』════\n\n`;

    if (response.data && (response.data.result || response.data.message)) {
      resultMsg += `${response.data.result || response.data.message}`;
    } else if (typeof response.data === "string") {
      resultMsg += response.data;
    } else {
      resultMsg += "⚠️ No clear response from the Teach API.";
    }

    resultMsg += `\n\n> Powered by Priyansh SIM API`;
    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in teach command:', error.message || error);

    const errorMessage =
      `════『 𝗧𝗘𝗔𝗖𝗛 𝗔𝗜 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to teach the AI.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};