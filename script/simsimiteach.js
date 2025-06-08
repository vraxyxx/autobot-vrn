const axios = require('axios');

module.exports.config = {
  name: "simsimiteach",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Teach SimSimi a new response using the Zetsu API.",
  usage: "/simsimiteach <ask> | <answer>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "AI"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const input = args.join(' ').split('|').map(s => s.trim());
  const prefix = "/"; // Change if your bot uses a dynamic prefix

  // No ask or answer provided
  if (input.length < 2 || !input[0] || !input[1]) {
    const usageMessage = `════『 𝗦𝗜𝗠𝗦𝗜𝗠𝗜 𝗧𝗘𝗔𝗖𝗛 』════\n\n` +
      `⚠️ Please provide a question and its answer to teach SimSimi.\n\n` +
      `📌 Usage: ${prefix}simsimiteach <ask> | <answer>\n` +
      `💬 Example: ${prefix}simsimiteach hello | hi there\n\n` +
      `> Thank you for helping SimSimi learn!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  const ask = input[0];
  const answer = input[1];

  try {
    // Send loading message first
    const waitMsg = `════『 𝗦𝗜𝗠𝗦𝗜𝗠𝗜 𝗧𝗘𝗔𝗖𝗛 』════\n\n` +
      `📝 Teaching SimSimi...\nQuestion: "${ask}"\nAnswer: "${answer}"\nPlease wait a moment.`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the SimSimi Teach API
    const apiUrl = "https://api.zetsu.xyz/simsimi/teach";
    const response = await axios.get(apiUrl, {
      params: {
        ask: ask,
        answer: answer
      }
    });

    let resultMsg = `════『 𝗦𝗜𝗠𝗦𝗜𝗠𝗜 𝗧𝗘𝗔𝗖𝗛 』════\n\n`;

    if (response.data?.success || response.data?.result === "Success" || response.data?.status === "success") {
      resultMsg += `✅ Successfully taught SimSimi!\n\n• Question: ${ask}\n• Answer: ${answer}`;
    } else if (typeof response.data === "string") {
      resultMsg += response.data;
    } else if (response.data?.message) {
      resultMsg += response.data.message;
    } else {
      resultMsg += "⚠️ Unable to teach SimSimi. (No clear response from API)";
    }

    resultMsg += `\n\n> Powered by Zetsu SimSimi Teach API`;

    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in simsimiteach command:', error.message || error);

    const errorMessage = `════『 𝗦𝗜𝗠𝗦𝗜𝗠𝗜 𝗧𝗘𝗔𝗖𝗛 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to teach SimSimi.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};