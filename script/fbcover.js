const axios = require('axios');

module.exports.config = {
  name: "fbcover",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Generate a Facebook cover image using the Zetsu API.",
  usage: "/fbcover <name> | <subname> | <sdt> | <address> | <email> | <uid> | <color>",
  prefix: true,
  cooldowns: 5,
  commandCategory: "Fun"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const input = args.join(' ').split('|').map(s => s.trim());
  const prefix = "/"; // Change if your bot uses a dynamic prefix

  if (input.length < 7) {
    const usageMessage = `════『 𝗙𝗕 𝗖𝗢𝗩𝗘𝗥 』════\n\n` +
      `⚠️ Please provide all required fields!\n\n` +
      `📌 Usage: ${prefix}fbcover <name> | <subname> | <sdt> | <address> | <email> | <uid> | <color>\n` +
      `💬 Example: ${prefix}fbcover Mark | Zuckerberg | n/a | USA | zuck@gmail.com | 4 | Cyan\n\n` +
      `> Powered by Zetsu FB Cover API`;
    return api.sendMessage(usageMessage, threadID, messageID);
  }

  const [name, subname, sdt, address, email, uid, color] = input;

  try {
    // Send loading message first
    const waitMsg = `════『 𝗙𝗕 𝗖𝗢𝗩𝗘𝗥 』════\n\n` +
      `🎨 Generating Facebook cover for: "${name} ${subname}"\nPlease wait a moment.`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Build API URL
    const apiUrl = "https://api.zetsu.xyz/canvas/fbcover";
    const params = {
      name,
      subname,
      sdt,
      address,
      email,
      uid,
      color
    };
    const response = await axios.get(apiUrl, {
      params
    });

    let imageUrl = "";
    if (response.data) {
      if (typeof response.data === "string" && response.data.startsWith("http")) {
        imageUrl = response.data;
      } else if (response.data.url) {
        imageUrl = response.data.url;
      } else if (response.data.result) {
        imageUrl = response.data.result;
      }
    }

    if (!imageUrl) {
      return api.sendMessage(
        `⚠️ Unable to generate Facebook cover image.`, threadID, messageID
      );
    }

    // Send the image as an attachment
    const imageRes = await axios.get(imageUrl, { responseType: "stream" });

    return api.sendMessage({
      body: `════『 𝗙𝗕 𝗖𝗢𝗩𝗘𝗥 』════\n\nHere's your generated Facebook cover!\n\n> Powered by Zetsu`,
      attachment: imageRes.data
    }, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in fbcover command:', error.message || error);

    const errorMessage = `════『 𝗙𝗕 𝗖𝗢𝗩𝗘𝗥 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to generate Facebook cover.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};