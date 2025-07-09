const axios = require("axios");

module.exports.config = {
  name: "stalkfb",
  version: "1.0.0",
  role: 0,
  credits: "Vern",
  aliases: ["fbstalk", "facebookstalk"],
  countDown: 5,
  description: "Stalk Facebook user using UID and name.",
  category: "info",
  usages: "<uid> | <name>",
  cooldown: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const input = args.join(" ").split("|").map(i => i.trim());
  const uid = input[0];
  const name = input[1];

  if (!uid || !name) {
    return api.sendMessage(
      "⚠️ Please provide both the Facebook UID and name.\n\nExample:\n/stalkfb 100036956043695 | Harold Hutchins",
      threadID,
      messageID
    );
  }

  const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/stalkfb?id=${encodeURIComponent(uid)}&name=${encodeURIComponent(name)}`;

  try {
    const { data } = await axios.get(apiUrl);

    if (data.error) {
      return api.sendMessage(`❌ API Error: ${data.error}`, threadID, messageID);
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

    const info = `
👤 Name: ${fullName}
🆔 UID: ${fbUid}
🔗 Username: ${username || "N/A"}
🌐 Profile: ${link}
👥 Friends: ${friends}
👣 Followers: ${followers}
📝 Bio: ${bio || "N/A"}
    `.trim();

    const attachment = await global.utils.getStreamFromURL(profile);

    return api.sendMessage({ body: info, attachment }, threadID, messageID);

  } catch (err) {
    console.error("FBStalk Error:", err.message);
    return api.sendMessage("❌ Failed to fetch Facebook profile info. Please try again later.", threadID, messageID);
  }
};