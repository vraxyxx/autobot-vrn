const axios = require("axios");

module.exports.config = {
  name: 'githubrepo',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['ghrepo', 'gitsearch'],
  description: "Search GitHub repositories by username or keyword.",
  usage: "githubrepo <username>",
  credits: 'Vern',
  cooldown: 3
};

module.exports.run = async function ({ api, event, args }) {
  const query = args.join(" ").trim();
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!query) {
    return api.sendMessage("❓ Please provide a GitHub username or keyword to search.\n\nExample:\ngithubrepo vernesg", threadID, messageID);
  }

  api.sendMessage(`🔍 𝗦𝗲𝗮𝗿𝗰𝗵𝗶𝗻𝗴 𝗳𝗼𝗿 𝗚𝗶𝘁𝗛𝘂𝗯 𝗿𝗲𝗽𝗼𝘀 𝗼𝗳: ${query}...`, threadID, async (err, info) => {
    if (err) return;

    try {
      const res = await axios.get(`https://rapido.zetsu.xyz/api/github/repo?query=${encodeURIComponent(query)}`);
      const { results } = res.data;

      if (!Array.isArray(results) || results.length === 0) {
        return api.editMessage("❌ No repositories found for this query.", info.messageID);
      }

      let msg = `🔍 𝗚𝗶𝘁𝗛𝘂𝗯 𝗥𝗲𝗽𝗼𝘀 𝗳𝗼𝗿 \"${query}\":\n\n`;
      results.slice(0, 5).forEach((repo, i) => {
        msg += `${i + 1}. 📁 ${repo.name}\n🔗 ${repo.url}\n⭐ Stars: ${repo.stars} | 🍴 Forks: ${repo.forks}\n\n`;
      });

      return api.editMessage(msg.trim(), info.messageID);

    } catch (error) {
      console.error("[githubrepo] Error:", error);
      return api.editMessage("🚫 Failed to fetch GitHub repos. Please try again later.", info.messageID);
    }
  });
};
