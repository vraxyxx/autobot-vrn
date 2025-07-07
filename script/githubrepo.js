const axios = require("axios");

module.exports = {
  config: {
    name: "githubrepo",
    version: "1.0.0",
    aliases: ["ghrepo", "gitsearch"],
    description: "Search GitHub repositories by username or keyword.",
    usage: "githubrepo <username>",
    commandCategory: "tools",
    role: 0,
    hasPrefix: true,
    credits: "Vern",
    cooldown: 3
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const query = args.join(" ");

    if (!query) {
      return api.sendMessage("❓ Please provide a GitHub username or keyword to search.\n\nExample: githubrepo vernesg", threadID, messageID);
    }

    try {
      const res = await axios.get(`https://rapido.zetsu.xyz/api/github/repo?query=${encodeURIComponent(query)}`);
      const { results } = res.data;

      if (!Array.isArray(results) || results.length === 0) {
        return api.sendMessage("❌ No repositories found for this query.", threadID, messageID);
      }

      let msg = `🔍 𝗚𝗶𝘁𝗛𝘂𝗯 𝗥𝗲𝗽𝗼𝘀 𝗳𝗼𝗿 \"${query}\":\n\n`;
      results.slice(0, 5).forEach((repo, i) => {
        msg += `${i + 1}. 📁 ${repo.name}\n🔗 ${repo.url}\n⭐ Stars: ${repo.stars} | 🍴 Forks: ${repo.forks}\n\n`;
      });

      return api.sendMessage(msg.trim(), threadID, messageID);

    } catch (err) {
      console.error("[githubrepo.js] API Error:", err.message || err);
      return api.sendMessage("🚫 Failed to fetch GitHub repos. Try again later.", threadID, messageID);
    }
  }
};
