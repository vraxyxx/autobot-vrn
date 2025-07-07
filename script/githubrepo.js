const axios = require("axios");

module.exports.config = {
  name: 'githubrepo',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['ghrepo', 'gitsearch'],
  description: "Search GitHub repositories by username or keyword.",
  usage: "githubrepo <username or keyword>",
  credits: 'Vern',
  cooldown: 3
};

module.exports.run = async function ({ api, event, args }) {
  const query = args.join(" ").trim();
  const threadID = event.threadID;
  const messageID = event.messageID;
  const senderID = event.senderID;

  if (!query) {
    return api.sendMessage("❓ Please provide a GitHub username or keyword.\n\nExample:\ngithubrepo vernesg", threadID, messageID);
  }

  api.sendMessage(`🔍 𝗦𝗲𝗮𝗿𝗰𝗵𝗶𝗻𝗴 𝗚𝗶𝘁𝗛𝘂𝗯 𝗿𝗲𝗽𝗼𝘀𝗶𝘁𝗼𝗿𝗶𝗲𝘀 𝗳𝗼𝗿:\n➤ ${query}`, threadID, async (err, info) => {
    if (err) return;

    try {
      const { data } = await axios.get(`https://rapido.zetsu.xyz/api/github/repo?query=${encodeURIComponent(query)}`);
      const repos = data.results;

      if (!Array.isArray(repos) || repos.length === 0) {
        return api.editMessage("❌ No repositories found for this query.", info.messageID);
      }

      let resultText = `📦 𝗧𝗼𝗽 𝗚𝗶𝘁𝗛𝘂𝗯 𝗥𝗲𝗽𝗼𝘀 𝗳𝗼𝗿: ${query}\n━━━━━━━━━━━━━━━━━━\n`;
      repos.slice(0, 5).forEach((repo, index) => {
        resultText += `${index + 1}. 📁 ${repo.name}\n🔗 ${repo.url}\n⭐ Stars: ${repo.stars} | 🍴 Forks: ${repo.forks}\n\n`;
      });

      api.getUserInfo(senderID, (err, infoUser) => {
        const userName = infoUser?.[senderID]?.name || "Unknown User";
        const timePH = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });

        const fullReply = `${resultText.trim()}━━━━━━━━━━━━━━━━━━\n🔎 Requested by: ${userName}\n⏰ Time: ${timePH}`;
        api.editMessage(fullReply, info.messageID);
      });

    } catch (error) {
      console.error("[githubrepo.js] API Error:", error);
      const errMsg = "🚫 Error: " + (error.response?.data?.message || error.message || "Unknown error occurred.");
      api.editMessage(errMsg, info.messageID);
    }
  });
};
