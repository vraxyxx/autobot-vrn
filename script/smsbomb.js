const axios = require('axios');

module.exports.config = {
  name: "smsbomb",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Send SMS spam using the Jonell01 SMSBomb API.",
  usage: "/smsbomb <phone_number> <spam_count>",
  prefix: true,
  cooldowns: 5,
  commandCategory: "Utility"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prefix = "/"; // Adjust if your bot uses a different prefix

  if (args.length < 2) {
    const usageMessage = `════『 𝗦𝗠𝗦𝗕𝗢𝗠𝗕 』════\n\n` +
      `⚠️ Please provide a phone number and spam count.\n\n` +
      `📌 Usage: ${prefix}smsbomb <phone_number> <spam_count>\n` +
      `💬 Example: ${prefix}smsbomb 09123456789 5\n\n` +
      `> Powered by Jonell01 SMSBomb API`;
    return api.sendMessage(usageMessage, threadID, messageID);
  }

  const phoneNumber = args[0];
  const spamNum = parseInt(args[1], 10);

  if (!/^\d{7,}$/.test(phoneNumber)) {
    return api.sendMessage(`⚠️ Please enter a valid phone number.`, threadID, messageID);
  }
  if (isNaN(spamNum) || spamNum < 1 || spamNum > 30) {
    return api.sendMessage(`⚠️ Please enter a valid spam count (1-30).`, threadID, messageID);
  }

  try {
    // Loading message
    const waitMsg = `════『 𝗦𝗠𝗦𝗕𝗢𝗠𝗕 』════\n\n📤 Sending SMS spam...\nPlease wait a moment.`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the SMSBomb API
    const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/smsbomb?phonenum=${encodeURIComponent(phoneNumber)}&spamnum=${spamNum}`;
    const response = await axios.get(apiUrl);

    let resultMsg = `════『 𝗦𝗠𝗦𝗕𝗢𝗠𝗕 』════\n\n`;

    if (response.data && (response.data.result || response.data.message)) {
      resultMsg += `${response.data.result || response.data.message}`;
    } else if (typeof response.data === "string") {
      resultMsg += response.data;
    } else {
      resultMsg += "⚠️ No clear response from the SMSBomb API.";
    }

    resultMsg += `\n\n> Thanks for using vern autobot-site `;
    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in smsbomb command:', error.message || error);

    const errorMessage = `════『 𝗦𝗠𝗦𝗕𝗢𝗠𝗕 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to process your request.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};