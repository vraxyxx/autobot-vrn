const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "welcomenoti",
  version: "1.0.0",
};

module.exports.handleEvent = async function ({ api, event }) {
  if (event.logMessageType !== "log:subscribe") return;

  try {
    const addedUser = event.logMessageData.addedParticipants?.[0];
    if (!addedUser) return;

    const senderID = addedUser.userFbId;
    const userInfo = await api.getUserInfo(senderID);
    let name = userInfo[senderID]?.name || "User";

    // Truncate long names
    if (name.length > 15) name = name.slice(0, 12) + '...';

    const groupInfo = await api.getThreadInfo(event.threadID);
    const groupName = groupInfo.threadName || "this group";
    const memberCount = groupInfo.participantIDs.length;

    // Real Facebook avatar URL
    const avatarUrl = `https://graph.facebook.com/${senderID}/picture?width=512&height=512`;

    // Optional background image or fallback
    const background = groupInfo.imageSrc || "https://i.ibb.co/FkQMsQgG/494820034-1290485175939968-835018671615168300-n-jpg-nc-cat-103-ccb-1-7-nc-sid-fc17b8-nc-ohc-gtlt82-D.jpg";

    // Your actual API key
    const apiKey = "APIKEYYYYY";

    const welcomeUrl = `https://kaiz-apis.gleeze.com/api/welcome` +
      `?username=${encodeURIComponent(name)}` +
      `&avatarUrl=${encodeURIComponent(avatarUrl)}` +
      `&groupname=${encodeURIComponent(groupName)}` +
      `&bg=${encodeURIComponent(background)}` +
      `&memberCount=${memberCount}` +
      `&apikey=${apiKey}`;

    const res = await axios.get(welcomeUrl, { responseType: 'arraybuffer' });

    // Save image to /cache folder
    const imgPath = path.join(__dirname, '..', 'cache', `welcome-${senderID}.jpg`);
    fs.ensureDirSync(path.dirname(imgPath));
    fs.writeFileSync(imgPath, Buffer.from(res.data));

    // Send welcome message with image
    await api.sendMessage({
      body: `👋 Welcome ${name} to ${groupName}! 🎉`,
      attachment: fs.createReadStream(imgPath)
    }, event.threadID);

    // Cleanup
    fs.unlinkSync(imgPath);

  } catch (error) {
    console.error("❌ Error in welcomenoti:", error.message || error);
    api.sendMessage("👋 A new member has joined, but welcome image failed to load.", event.threadID);
  }
};
