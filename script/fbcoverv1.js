const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "fbcoverv1",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Generate a Facebook cover using the Hiroshi API.",
  usage: "/fbcoverv1 <name> | <id> | <subname> | <color>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Canvas"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prefix = "/"; // Change if your bot uses a dynamic prefix

  // Join args and split by '|'
  const input = args.join(' ').split('|').map(s => s.trim());
  const [name, id, subname, color] = input;

  if (!name || !id || !subname || !color) {
    const usageMessage = `════『 𝗙𝗕 𝗖𝗢𝗩𝗘𝗥 𝗩𝟭 』════\n\n` +
      `⚠️ Please provide all required parameters.\n\n` +
      `📌 Usage: ${prefix}fbcoverv1 <name> | <id> | <subname> | <color>\n` +
      `💬 Example: ${prefix}fbcoverv1 hiroshikim | 21 | kbien | red\n\n` +
      `> Thank you for using FB Cover V1!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗙𝗕 𝗖𝗢𝗩𝗘𝗥 𝗩𝟭 』════\n\n` +
      `🖼️ Generating Facebook cover for:\n` +
      `• Name: ${name}\n• ID: ${id}\n• Subname: ${subname}\n• Color: ${color}\nPlease wait a moment...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Build API URL
    const apiUrl = `https://hiroshi-api.onrender.com/canvas/fbcoverv1?name=${encodeURIComponent(name)}&id=${encodeURIComponent(id)}&subname=${encodeURIComponent(subname)}&color=${encodeURIComponent(color)}`;
    
    // Download image as stream
    const response = await axios.get(apiUrl, { responseType: 'stream' });

    // Send image as attachment
    return api.sendMessage({
      body: `════『 𝗙𝗕 𝗖𝗢𝗩𝗘𝗥 𝗩𝟭 』════\n\nHere's your generated Facebook cover!\n\n> Powered by Hiroshi API`,
      attachment: response.data
    }, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in fbcoverv1 command:', error.message || error);

    const errorMessage = `════『 𝗙𝗕 𝗖𝗢𝗩𝗘𝗥 𝗩𝟭 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to generate Facebook cover.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};