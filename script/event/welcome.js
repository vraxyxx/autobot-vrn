const axios = require("axios");

module.exports.config = {
  name: "welcome",
  version: "1.0.0",
  eventType: ["log:subscribe"],
  credits: "vern",
  description: "Send welcome image when someone joins"
};

module.exports.run = async function ({ api, event, Users, Threads }) {
  const { threadID } = event;

  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const addedUser = event.logMessageData.addedParticipants[0];
    const username = addedUser.fullName || "New Member";
    const userID = addedUser.userFbId;
    const groupname = threadInfo.name || "Group Chat";
    const memberCount = threadInfo.participantIDs.length;

    // Avatar URL (Facebook profile)
    const avatarUrl = `https://graph.facebook.com/${userID}/picture?width=512&height=512`;

    // Default background image (you can change this)
    const bg = "https://i.ibb.co/4YBNyvP/images-76.jpg";

    // Generate image URL via Ace API
    const apiUrl = `https://ace-rest-api.onrender.com/api/welcome?username=${encodeURIComponent(username)}&avatarUrl=${encodeURIComponent(avatarUrl)}&groupname=${encodeURIComponent(groupname)}&bg=${encodeURIComponent(bg)}&memberCount=${encodeURIComponent(memberCount)}`;

    // Fetch image stream
    const response = await axios.get(apiUrl, { responseType: 'stream' });

    // Send welcome message with image
    return api.sendMessage({
      body: `👋 Welcome ${username} to ${groupname}!\nYou're member #${memberCount} 🎉\n\n> Powered by Ace API`,
      attachment: response.data
    }, threadID);

  } catch (err) {
    console.error("❌ Failed to send welcome image:", err.message || err);
  }
};
