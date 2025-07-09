const axios = require("axios");

module.exports = {
  config: {
    name: "stalkfb",
    aliases: ["fbstalk", "facebookstalk"],
    version: "1.0",
    role: 0,
    author: "Vern",
    countDown: 5,
    longDescription: "Stalk Facebook user using UID and name.",
    category: "info",
    guide: {
      en: "{pn} <uid> | <name>\n\nExample:\n{pn} 100036956043695 | Harold Hutchins"
    }
  },

  onStart: async function ({ message, args }) {
    const input = args.join(" ").split("|").map(i => i.trim());

    const uid = input[0];
    const name = input[1];

    if (!uid || !name) {
      return message.reply("⚠️ Please provide both the Facebook UID and name.\n\nExample:\n/stalkfb 100036956043695 | Harold Hutchins");
    }

    const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/stalkfb?id=${encodeURIComponent(uid)}&name=${encodeURIComponent(name)}`;

    try {
      const { data } = await axios.get(apiUrl);

      if (data.error) {
        return message.reply(`❌ API Error: ${data.error}`);
      }

      const {
        name: fullName,
        uid: fbUid,
        username,
        link,
        followers,
        friends,
        profile,
        cover,
        bio
      } = data;

      const info = 
`👤 Name: ${fullName}
🆔 UID: ${fbUid}
🔗 Username: ${username || "N/A"}
🌐 Profile: ${link}
👥 Friends: ${friends}
👣 Followers: ${followers}
📝 Bio: ${bio || "N/A"}`;

      return message.reply({
        body: info,
        attachment: await global.utils.getStreamFromURL(profile)
      });

    } catch (err) {
      console.error(err.message);
      return message.reply("❌ Failed to fetch Facebook profile info. Please try again later.");
    }
  }
};