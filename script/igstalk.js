const axios = require("axios");

module.exports.config = {
  name: "igstalk",
  version: "1.0.0",
  role: 0,
  credits: "Vern",
  aliases: ["insta", "instastalk"],
  countDown: 5,
  description: "Fetch public Instagram profile details.",
  category: "tools",
  usages: "<instagram_username>",
  cooldown: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const username = args[0];

  if (!username) {
    return api.sendMessage(
      "📸 Please provide an Instagram username.\n\nExample:\n/igstalk instagram",
      threadID,
      messageID
    );
  }

  try {
    const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/insta/stalk?ig=${encodeURIComponent(username)}`;
    const { data } = await axios.get(apiUrl);

    if (data.error) {
      return api.sendMessage(`❌ Error: ${data.error}`, threadID, messageID);
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

    return api.sendMessage({ body: caption, attachment }, threadID, messageID);

  } catch (error) {
    console.error("IGStalk Error:", error.message);
    return api.sendMessage("❌ Failed to fetch Instagram profile. Please try again later.", threadID, messageID);
  }
};