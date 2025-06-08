const axios = require('axios');

module.exports.config = {
  name: "billboard",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Generate a billboard image with your custom text using the Ace API.",
  usage: "/billboard <your message>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Canvas"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const text = args.join(' ').trim();
  const prefix = "/"; // Change if your bot uses a dynamic prefix

  if (!text) {
    const usageMessage = `════『 𝗕𝗜𝗟𝗟𝗕𝗢𝗔𝗥𝗗 』════\n\n` +
      `⚠️ Please provide the message for your billboard.\n\n` +
      `📌 Usage: ${prefix}billboard <your message>\n` +
      `💬 Example: ${prefix}billboard Hello, World!\n\n` +
      `> Thank you for using Billboard Generator!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗕𝗜𝗟𝗟𝗕𝗢𝗔𝗥𝗗 』════\n\n` +
      `🖼️ Generating billboard for: "${text}"\nPlease wait a moment...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Build API URL
    const apiUrl = `https://ace-rest-api.onrender.com/api/billboard?text=${encodeURIComponent(text)}`;

    // Download image as stream
    const response = await axios.get(apiUrl, { responseType: 'stream' });

    return api.sendMessage({
      body: `════『 𝗕𝗜𝗟𝗟𝗕𝗢𝗔𝗥𝗗 』════\n\nHere's your generated billboard!\n\n> Powered by Ace API`,
      attachment: response.data
    }, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in billboard command:', error.message || error);

    const errorMessage = `════『 𝗕𝗜𝗟𝗟𝗕𝗢𝗔𝗥𝗗 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to generate billboard.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};