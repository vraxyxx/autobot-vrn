const axios = require("axios");

module.exports = {
  config: {
    name: "igstalk",
    aliases: ["insta", "instastalk"],
    version: "1.0",
    role: 0,
    author: "Vern",
    countDown: 5,
    longDescription: "Fetch public Instagram profile details.",
    category: "tools",
    guide: {
      en: "{pn} <instagram_username>"
    }
  },

  onStart: async function ({ message, args, event }) {
    const username = args[0];

    if (!username) {
      return message.reply("📸 Please provide an Instagram username.\n\nExample:\n/igstalk instagram");
    }

    try {
      const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/insta/stalk?ig=${encodeURIComponent(username)}`;
      const { data } = await axios.get(apiUrl);

      if (data.error) {
        return message.reply(`❌ Error: ${data.error}`);
      }

      const {
        username: ig,
        fullName,
        bio,
        followers,
        following,
        posts,
        profilePic
      } = data;

      const caption = `
📸 𝗜𝗻𝘀𝘁𝗮𝗴𝗿𝗮𝗺 𝗦𝘁𝗮𝗹𝗸
👤 Username: ${ig}
📛 Full Name: ${fullName || "N/A"}
📝 Bio: ${bio || "N/A"}
📦 Posts: ${posts}
👥 Followers: ${followers}
👣 Following: ${following}
      `.trim();

      const attachment = await global.utils.getStreamFromURL(profilePic);

      message.reply({
        body: caption,
        attachment: attachment
      });

    } catch (error) {
      console.error("IGStalk Error:", error.message);
      message.reply("❌ Failed to fetch Instagram profile. Please try again later.");
    }
  }
};