const axios = require("axios");

module.exports = {
  config: {
    name: "githubuser",
    version: "1.0.0",
    aliases: ["ghuser", "gituser"],
    description: "Search GitHub users by username or keyword.",
    usage: "githubuser <username>",
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
      return api.sendMessage("❓ Please provide a GitHub username to search.\n\nExample: githubuser vernesg", threadID, messageID);
    }

    try {
      const res = await axios.get(`https://rapido.zetsu.xyz/api/github/user?query=${encodeURIComponent(query)}`);
      const { results } = res.data;

      if (!Array.isArray(results) || results.length === 0) {
        return api.sendMessage("❌ No GitHub user found for this query.", threadID, messageID);
      }

      const user = results[0];
      const msg = `👤 𝗚𝗶𝘁𝗛𝘂𝗯 𝗨𝘀𝗲𝗿 𝗙𝗼𝘂𝗻𝗱:\n\n📛 Username: ${user.username}\n🧑‍💻 Type: ${user.type}\n🔗 Profile: ${user.profile}`;

      // Send message with avatar if available
      const img = (await axios.get(user.avatar, { responseType: "stream" })).data;
      return api.sendMessage(
        {
          body: msg,
          attachment: img
        },
        threadID,
        messageID
      );
    } catch (err) {
      console.error("[githubuser.js] API Error:", err.message || err);
      return api.sendMessage("🚫 Failed to fetch GitHub user. Try again later.", threadID, messageID);
    }
  }
};
