const axios = require('axios');

module.exports.config = {
  name: "goodbye",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Generate a goodbye image using the Ace API.",
  usage: "/goodbye <name> | <profile_pic_url> | <background_url> | <member_count>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Utility"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prefix = "/"; // Change if your bot uses a dynamic prefix

  // Join args and split by '|'
  const input = args.join(' ').split('|').map(s => s.trim());
  const [name, pp, bg, member] = input;

  if (!name || !pp || !bg || !member) {
    const usageMessage = `════『 𝗚𝗢𝗢𝗗𝗕𝗬𝗘 』════\n\n` +
      `⚠️ Please provide all required parameters.\n\n` +
      `📌 Usage: ${prefix}goodbye <name> | <profile_pic_url> | <background_url> | <member_count>\n` +
      `💬 Example: ${prefix}goodbye Lance | https://i.imgur.com/xwCoQ5H.jpeg | https://i.ibb.co/4YBNyvP/images-76.jpg | 25\n\n` +
      `> Thank you for using Goodbye!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗚𝗢𝗢𝗗𝗕𝗬𝗘 』════\n\n` +
      `🖼️ Generating goodbye image for: ${name}\nPlease wait a moment...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Build API URL
    const apiUrl = `https://ace-rest-api.onrender.com/api/goodbye?pp=${encodeURIComponent(pp)}&nama=${encodeURIComponent(name)}&bg=${encodeURIComponent(bg)}&member=${encodeURIComponent(member)}`;
    
    // Download image as stream
    const response = await axios.get(apiUrl, { responseType: 'stream' });

    // Send image as attachment
    return api.sendMessage({
      body: `════『 𝗚𝗢𝗢𝗗𝗕𝗬𝗘 』════\n\nHere's your generated goodbye image!\n\n> Powered by Ace API`,
      attachment: response.data
    }, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in goodbye command:', error.message || error);

    const errorMessage = `════『 𝗚𝗢𝗢𝗗𝗕𝗬𝗘 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to generate goodbye image.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};