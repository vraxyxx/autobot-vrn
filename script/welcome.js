const axios = require('axios');

module.exports.config = {
  name: "welcome",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Generate a welcome image using the Ace API.",
  usage: "/welcome <username> | <avatar_url> | <group_name> | <background_url> | <member_count>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Utility"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prefix = "/"; // Change if your bot uses a dynamic prefix

  // Join args and split by '|'
  const input = args.join(' ').split('|').map(s => s.trim());
  const [username, avatarUrl, groupname, bg, memberCount] = input;

  if (!username || !avatarUrl || !groupname || !bg || !memberCount) {
    const usageMessage = `════『 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 』════\n\n` +
      `⚠️ Please provide all required parameters.\n\n` +
      `📌 Usage: ${prefix}welcome <username> | <avatar_url> | <group_name> | <background_url> | <member_count>\n` +
      `💬 Example: ${prefix}welcome Lance | https://i.imgur.com/xwCoQ5H.jpeg | Ajironian | https://i.ibb.co/4YBNyvP/images-76.jpg | 25\n\n` +
      `> Thank you for using Welcome!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 』════\n\n` +
      `🖼️ Generating welcome image for: ${username}\nPlease wait a moment...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Build API URL
    const apiUrl = `https://ace-rest-api.onrender.com/api/welcome?username=${encodeURIComponent(username)}&avatarUrl=${encodeURIComponent(avatarUrl)}&groupname=${encodeURIComponent(groupname)}&bg=${encodeURIComponent(bg)}&memberCount=${encodeURIComponent(memberCount)}`;
    
    // Download image as stream
    const response = await axios.get(apiUrl, { responseType: 'stream' });

    // Send image as attachment
    return api.sendMessage({
      body: `════『 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 』════\n\nHere's your generated welcome image!\n\n> Powered by Ace API`,
      attachment: response.data
    }, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in welcome command:', error.message || error);

    const errorMessage = `════『 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to generate welcome image.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};