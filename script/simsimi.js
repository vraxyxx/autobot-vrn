const axios = require('axios');

module.exports.config = {
  name: "simsimi",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Chat with SimSimi using the Zetsu API.",
  usage: "/simsimi <your message>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "AI"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const input = args.join(' ').trim();
  const prefix = "/"; // Change if your bot uses a dynamic prefix

  // No input provided
  if (!input) {
    const usageMessage = `════『 𝗦𝗜𝗠𝗦𝗜𝗠𝗜 』════\n\n` +
      `⚠️ Please provide a message to chat with SimSimi.\n\n` +
      `📌 Usage: ${prefix}simsimi <your message>\n` +
      `💬 Example: ${prefix}simsimi hi\n\n` +
      `> Thank you for chatting with SimSimi!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗦𝗜𝗠𝗦𝗜𝗠𝗜 』════\n\n` +
      `💬 SimSimi is thinking about: "${input}"\nPlease wait a moment.`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the SimSimi Ask API
    const apiUrl = "https://api.zetsu.xyz/simsimi/ask";
    const response = await axios.get(apiUrl, {
      params: {
        input: input
      }
    });

    let reply = "";
    if (response.data?.result) {
      reply = response.data.result;
    } else if (response.data?.response) {
      reply = response.data.response;
    } else if (response.data?.answer) {
      reply = response.data.answer;
    } else if (typeof response.data === "string") {
      reply = response.data;
    } else {
      reply = "⚠️ SimSimi could not generate a response.";
    }

    let resultMsg = `════『 𝗦𝗜𝗠𝗦𝗜𝗠𝗜 』════\n\n`;
    resultMsg += `❓ You: ${input}\n`;
    resultMsg += `🤖 SimSimi: ${reply}\n\n`;
    resultMsg += `> Powered by Zetsu SimSimi API`;

    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in simsimi command:', error.message || error);

    const errorMessage = `════『 𝗦𝗜𝗠𝗦𝗜𝗠𝗜 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to get response from SimSimi.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};