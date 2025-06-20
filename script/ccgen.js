const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "ccgen",
  description: "Generate fake credit card details for testing (ID, US, etc.)",
  author: "Vern",
  usage: "ccgen <type> <quantity>",
  cooldown: 5,

  async execute(senderId, args, pageAccessToken) {
    try {
      const [type = "id", quantity = "5"] = args;

      await sendMessage(senderId, {
        text: `💳 Generating ${quantity} ${type.toUpperCase()} CCs, please wait...`
      }, pageAccessToken);

      const apiUrl = `https://haji-mix.up.railway.app/api/ccgen?types=${type}&quantity=${quantity}&api_key=48eb5b9082471e96afe7b11ea62e6c32bd595fbad9ca43092d900ae8fe547da8`;

      const response = await axios.get(apiUrl);

      if (!response.data || !response.data.result || response.data.result.length === 0) {
        return sendMessage(senderId, {
          text: "❌ No CC generated. Try different parameters."
        }, pageAccessToken);
      }

      const cards = response.data.result.join('\n');
      const message = `💳 𝗙𝗔𝗞𝗘 𝗖𝗖 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗘𝗗:\n\n${cards}`;

      await sendMessage(senderId, {
        text: message
      }, pageAccessToken);

    } catch (error) {
      console.error("❌ Error in ccgen command:", error.message);
      await sendMessage(senderId, {
        text: `❌ Failed to generate CC. Error: ${error.message || "Unknown error"}`
      }, pageAccessToken);
    }
  }
};
