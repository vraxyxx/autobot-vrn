const axios = require('axios');

module.exports.config = {
  name: "githubrepo",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Search for GitHub repositories using the Rapido API.",
  usage: "/githubrepo <search term>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Utility"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(' ').trim();
  const prefix = "/"; // Change if your bot uses a dynamic prefix

  // No search term provided
  if (!query) {
    const usageMessage = `════『 𝗚𝗜𝗧𝗛𝗨𝗕 𝗥𝗘𝗣𝗢 』════\n\n` +
      `⚠️ Please provide a search term for GitHub repositories.\n\n` +
      `📌 Usage: ${prefix}githubrepo <search term>\n` +
      `💬 Example: ${prefix}githubrepo portfolio\n\n` +
      `> Thank you for using GitHub Repo Search!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗚𝗜𝗧𝗛𝗨𝗕 𝗥𝗘𝗣𝗢 』════\n\n` +
      `🔎 Searching GitHub for repositories: "${query}"\nPlease wait a moment...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Rapido GitHub Repo API
    const apiUrl = "https://rapido.zetsu.xyz/api/github/repo";
    const response = await axios.get(apiUrl, {
      params: {
        query: query
      }
    });

    const data = response.data?.result || response.data?.repos || response.data;
    let resultMsg = `════『 𝗚𝗜𝗧𝗛𝗨𝗕 𝗥𝗘𝗣𝗢 』════\n\n`;

    if (Array.isArray(data) && data.length > 0) {
      data.slice(0, 5).forEach((repo, idx) => {
        resultMsg += `#${idx + 1}\n`;
        if (repo.name) resultMsg += `• Name: ${repo.name}\n`;
        if (repo.url) resultMsg += `• URL: ${repo.url}\n`;
        if (repo.description) resultMsg += `• Description: ${repo.description}\n`;
        if (repo.stars) resultMsg += `• Stars: ${repo.stars}\n`;
        if (repo.language) resultMsg += `• Language: ${repo.language}\n`;
        resultMsg += `\n`;
      });
    } else {
      resultMsg += "⚠️ No repositories found.";
    }

    resultMsg += `> Powered by Rapido GitHub Repo API`;

    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in githubrepo command:', error.message || error);

    const errorMessage = `════『 𝗚𝗜𝗧𝗛𝗨𝗕 𝗥𝗘𝗣𝗢 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to search for GitHub repositories.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};