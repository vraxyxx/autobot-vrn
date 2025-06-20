const axios = require("axios");

module.exports.config = {
  name: "ccgen",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Generate fake credit card details for testing (ID, US, etc.)",
  usage: "/ccgen <type> <quantity>",
  prefix: true,
  cooldowns: 5,
  commandCategory: "Tool"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prefix = "/"; // Change if your bot uses a dynamic prefix

  const type = args[0] || "id";
  const quantity = args[1] || "5";

  try {
    // Loading message
    const waitMsg = `════『 𝗖𝗖𝗚𝗘𝗡 』════\n\n💳 Generating ${quantity} ${type.toUpperCase()} credit cards...\nPlease wait...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    const apiUrl = `https://haji-mix.up.railway.app/api/ccgen?types=${type}&quantity=${quantity}&api_key=48eb5b9082471e96afe7b11ea62e6c32bd595fbad9ca43092d900ae8fe547da8`;
    const response = await axios.get(apiUrl);

    if (!response.data?.result?.length) {
      return api.sendMessage(`❌ No CCs generated. Try different parameters.`, threadID, messageID);
    }

    const cards = response.data.result.join('\n');
    const resultMsg = `════『 𝗙𝗔𝗞𝗘 𝗖𝗖𝗚𝗘𝗡 』════\n\n${cards}\n\n> For testing purposes only.`;

    await api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error("❌ Error in ccgen command:", error.message || error);

    const errorMsg = `════『 𝗖𝗖𝗚𝗘𝗡 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to generate CCs.\nReason: ${error.message || "Unknown error"}\n\n` +
      `> Try again later.`;

    return api.sendMessage(errorMsg, threadID, messageID);
  }
};
