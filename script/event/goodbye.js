const axios = require('axios');

module.exports.config = {
  name: "goodbye",
  eventType: ["log:unsubscribe"],
  version: "1.0.0",
  credits: "vern",
  description: "Send a custom goodbye image when a member leaves the group."
};

module.exports.run = async function ({ api, event }) {
  // Only handle if someone else leaves, not the bot itself
  if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

  const threadID = event.threadID;
  const memberID = event.logMessageData.leftParticipantFbId;

  // Get user info
  let userInfo;
  try {
    userInfo = await api.getUserInfo(memberID);
  } catch (e) {
    userInfo = {};
  }
  const name = userInfo[memberID]?.name || "Member";

  // Get profile picture
  const pp = `https://graph.facebook.com/${memberID}/picture?width=512&height=512`;

  // Get group info for member count and background (use group image if available)
  let threadInfo;
  try {
    threadInfo = await api.getThreadInfo(threadID);
  } catch (e) {
    threadInfo = {};
  }
  const member = threadInfo?.participantIDs?.length || 0;
  const bg = threadInfo.imageSrc || "https://i.ibb.co/4YBNyvP/images-76.jpg";

  // Build API URL
  const apiUrl = `https://ace-rest-api.onrender.com/api/goodbye?pp=${encodeURIComponent(pp)}&nama=${encodeURIComponent(name)}&bg=${encodeURIComponent(bg)}&member=${encodeURIComponent(member)}`;

  try {
    // Download image as stream
    const response = await axios.get(apiUrl, { responseType: 'stream' });

    // Send image as attachment
    return api.sendMessage({
      body: `Goodbye, ${name}! 👋\nWe now have ${member} member${member != 1 ? "s" : ""} left.`,
      attachment: response.data
    }, threadID);
  } catch (error) {
    console.error('❌ Error in goodbye event:', error.message || error);

    return api.sendMessage(
      `Goodbye, ${name}!\n(Failed to generate image.)`,
      threadID
    );
  }
};