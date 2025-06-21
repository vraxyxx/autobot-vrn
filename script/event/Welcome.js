const axios = require("axios");

module.exports.config = {
  name: "welcomenoti",
  version: "1.0.0",
  eventType: ["log:subscribe"],
  credits: "vern",
  description: "Auto-send welcome image when a user joins the group"
};

module.exports.run = async function ({ api, event }) {
  const { threadID } = event;

  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const addedUser = event.logMessageData.addedParticipants[0];
    const username = addedUser.fullName || "New Member";
    const userID = addedUser.userFbId;
    const groupname = threadInfo.name || "Group Chat";
    const memberCount = threadInfo.participantIDs.length;

    const avatarUrl = `https://graph.facebook.com/${userID}/picture?width=512&height=512`;
    const bg = "https://i.ibb.co/4YBNyvP/images-76.jpg"; // You can replace this with a custom BG

    const apiUrl = `https://ace-rest-api.onrender.com/api/welcome?username=${encodeURIComponent(username)}&avatarUrl=${encodeURIComponent(avatarUrl)}&groupname=${encodeURIComponent(groupname)}&bg=${encodeURIComponent(bg)}&memberCount=${encodeURIComponent(memberCount)}`;

    const response = await axios.get(apiUrl, { responseType: 'stream' });

    return api.sendMessage({
      body: `👋 Welcome ${username} to ${groupname}!\nYou're member #${memberCount} 🎉\n\n> Powered by Ace API`,
      attachment: response.data
    }, threadID);

  } catch (err) {
    console.error("❌ welcomenoti error:", err.message || err);
  }
};
