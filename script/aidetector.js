const axios = require('axios');

module.exports.config = {
  name: "aidetector",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Detect if a text is written by AI using the Kaiz API.",
  usage: "/aidetector <text>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "AI"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const text = args.join(' ').trim();
  const prefix = "/"; // Change if your bot uses a dynamic prefix

  // No text provided
  if (!text) {
    const usageMessage = `════『 𝗔𝗜 𝗗𝗘𝗧𝗘𝗖𝗧𝗢𝗥 』════\n\n` +
      `⚠️ Please provide the text you want to analyze for AI detection.\n\n` +
      `📌 Usage: ${prefix}aidetector <text>\n` +
      `💬 Example: ${prefix}aidetector This is an essay about AI.\n\n` +
      `> Thank you for using the AI Detector!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗔𝗜 𝗗𝗘𝗧𝗘𝗖𝗧𝗢𝗥 』════\n\n` +
      `🕵️‍♂️ Analyzing your text for AI-generated content...\nPlease wait a moment.`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the AI Detector API
    const apiUrl = "https://kaiz-apis.gleeze.com/api/aidetectorv2";
    const response = await axios.get(apiUrl, {
      params: {
        text: text,
        apikey: "4fe7e522-70b7-420b-a746-d7a23db49ee5"
      }
    });

    // Format response
    let resultMsg = `════『 𝗔𝗜 𝗗𝗘𝗧𝗘𝗖𝗧𝗢𝗥 』════\n\n`;

    if (response.data && typeof response.data === "object") {
      for (const [key, value] of Object.entries(response.data)) {
        resultMsg += `• ${key}: ${value}\n`;
      }
    } else {
      resultMsg += "⚠️ Unable to parse detector data.";
    }

    resultMsg += `\n> Powered by Kaiz AI Detector API`;

    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in aidetector command:', error.message || error);

    const errorMessage = `════『 𝗔𝗜 𝗗𝗘𝗧𝗘𝗖𝗧𝗢𝗥 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to analyze the text for AI content.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};