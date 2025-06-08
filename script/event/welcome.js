const axios = require('axios');

module.exports.config = {
  name: "welcome",
  eventType: ["log:subscribe"],
  version: "1.0.0",
  credits: "vern",
  description: "Send a custom welcome image when a new member joins the group."
};

module.exports.run = async function ({ api, event }) {
  // Only handle if someone else joins, not the bot itself
  if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) return;

  const threadID = event.threadID;
  const newMembers = event.logMessageData.addedParticipants;

  // Get group info for member count and background (use group image if available)
  let threadInfo;
  try {
    threadInfo = await api.getThreadInfo(threadID);
  } catch (e) {
    threadInfo = {};
  }
  const memberCount = threadInfo?.participantIDs?.length || 0;
  const groupname = threadInfo?.threadName || "Group";
  const bg = threadInfo.imageSrc || "https://i.ibb.co/4YBNyvP/images-76.jpg";

  for (const member of newMembers) {
    // Get user info
    let userInfo;
    try {
      userInfo = await api.getUserInfo(member.userFbId);
    } catch (e) {
      userInfo = {};
    }
    const username = userInfo[member.userFbId]?.name || "Member";
    const avatarUrl = `https://graph.facebook.com/${member.userFbId}/picture?width=512&height=512`;

    // Build API URL
    const apiUrl = `https://ace-rest-api.onrender.com/api/welcome?username=${encodeURIComponent(username)}&avatarUrl=${encodeURIComponent(avatarUrl)}&groupname=${encodeURIComponent(groupname)}&bg=${encodeURIComponent(bg)}&memberCount=${encodeURIComponent(memberCount)}`;

    try {
      // Download image as stream
      const response = await axios.get(apiUrl, { responseType: 'stream' });

      // Send image as attachment
      await api.sendMessage({
        body: `Welcome, ${username}! 🎉\nYou are member #${memberCount} in "${groupname}".`,
        attachment: response.data
      }, threadID);
    } catch (error) {
      console.error('❌ Error in welcome event:', error.message || error);
      await api.sendMessage(
        `Welcome, ${username}!\n(Failed to generate image.)`,
        threadID
      );
    }
  }
};