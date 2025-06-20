const axios = require("axios");

module.exports.config = {
  name: "igstalk",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Stalk an Instagram user's public profile",
  usage: "/igstalk <username>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Search"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const username = args[0];
  const prefix = "/"; // Replace with dynamic prefix if used

  if (!username) {
    const usageMsg = `════『 𝗜𝗚𝗦𝗧𝗔𝗟𝗞 』════\n\n` +
      `📸 Please provide an Instagram username to stalk.\n\n` +
      `📌 Usage: ${prefix}igstalk <username>\n` +
      `💬 Example: ${prefix}igstalk vernesg`;
    return api.sendMessage(usageMsg, threadID, messageID);
  }

  try {
    const waitMsg = `📸 Fetching profile of @${username}...\nPlease wait...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    const apiUrl = `https://api.ferdev.my.id/stalker/instagram?username=${encodeURIComponent(username)}`;
    const { data } = await axios.get(apiUrl);

    if (!data?.status || !data?.result) {
      return api.sendMessage(`❌ Profile not found for "${username}".`, threadID, messageID);
    }

    const user = data.result;

    const info = `════『 𝗜𝗚𝗦𝗧𝗔𝗟𝗞 』════\n\n` +
      `👤 𝗡𝗮𝗺𝗲: ${user.fullname}\n` +
      `🔖 𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲: @${user.username}\n` +
      `📷 𝗣𝗼𝘀𝘁𝘀: ${user.posts}\n` +
      `👥 𝗙𝗼𝗹𝗹𝗼𝘄𝗲𝗿𝘀: ${user.followers}\n` +
      `👤 𝗙𝗼𝗹𝗹𝗼𝘄𝗶𝗻𝗴: ${user.following}\n` +
      `🔐 𝗣𝗿𝗶𝘃𝗮𝘁𝗲: ${user.private ? "Yes 🔒" : "No 🔓"}\n` +
      `📄 𝗕𝗶𝗼: ${user.bio || "None"}\n` +
      `🔗 𝗣𝗿𝗼𝗳𝗶𝗹𝗲: ${user.profile_link}\n\n` +
      `> Provided by Vern-Autobot`;

    await api.sendMessage(info, threadID, messageID);

    // Send profile image
    if (user.profile_pic) {
      await api.sendMessage({
        attachment: await global.utils.getStreamFromURL(user.profile_pic)
      }, threadID, messageID);
    }

  } catch (error) {
    console.error("❌ Error in igstalk command:", error.message || error);

    const errorMsg = `════『 𝗜𝗚𝗦𝗧𝗔𝗟𝗞 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to fetch IG profile.\nReason: ${error.message || "Unknown error"}\n\n` +
      `> Please try again later.`;
    return api.sendMessage(errorMsg, threadID, messageID);
  }
};
