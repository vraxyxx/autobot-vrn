const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "goodbyenoti",
  version: "1.0.0"
};

module.exports.handleEvent = async function ({ api, event }) {
  if (event.logMessageType !== "log:unsubscribe") return;

  try {
    const leftID = event.logMessageData.leftParticipantFbId;

    const userInfo = await api.getUserInfo(leftID);
    let name = userInfo[leftID]?.name || "User";

    // Truncate long names
    if (name.length > 15) name = name.slice(0, 12) + "...";

    const threadInfo = await api.getThreadInfo(event.threadID);
    const groupName = threadInfo.threadName || "this group";
    const memberCount = threadInfo.participantIDs.length;

    const avatarUrl = `https://graph.facebook.com/${leftID}/picture?width=512&height=512`;
    const background = threadInfo.imageSrc || "https://i.imgur.com/KC6vjne.jpeg";

    // Build Ace goodbye API URL
    const apiUrl = `https://ace-rest-api.onrender.com/api/goodbye` +
      `?pp=${encodeURIComponent(avatarUrl)}` +
      `&nama=${encodeURIComponent(name)}` +
      `&bg=${encodeURIComponent(background)}` +
      `&member=${memberCount}`;

    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

    const imgPath = path.join(__dirname, "..", "cache", `goodbye-${leftID}.jpg`);
    fs.ensureDirSync(path.dirname(imgPath));
    fs.writeFileSync(imgPath, Buffer.from(response.data));

    await api.sendMessage({
      body: `👋 ${name} has left ${groupName}. We’ll miss you!`,
      attachment: fs.createReadStream(imgPath)
    }, event.threadID);

    fs.unlinkSync(imgPath); // Clean up

  } catch (error) {
    console.error("❌ Error in goodbyenoti:", error.message || error);
    api.sendMessage("👋 Someone left the group, but goodbye image failed to load.", event.threadID);
  }
};
