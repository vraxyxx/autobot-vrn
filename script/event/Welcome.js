const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "welcomenoti",
  version: "1.0.0"
};

module.exports.handleEvent = async function ({ api, event }) {
  if (event.logMessageType !== "log:subscribe") return;

  try {
    const newUser = event.logMessageData.addedParticipants?.[0];
    if (!newUser) return;

    const userID = newUser.userFbId;
    const userInfo = await api.getUserInfo(userID);
    let name = userInfo[userID]?.name || "User";

    // Truncate long names
    if (name.length > 15) name = name.slice(0, 12) + "...";

    const threadInfo = await api.getThreadInfo(event.threadID);
    const groupName = threadInfo.threadName || "this group";
    const memberCount = threadInfo.participantIDs.length;

    const avatarUrl = `https://graph.facebook.com/${userID}/picture?width=512&height=512`;
    const background = threadInfo.imageSrc || "https://i.ibb.co/4YBNyvP/images-76.jpg";

    // Ace welcome API
    const apiUrl = `https://ace-rest-api.onrender.com/api/welcome` +
      `?username=${encodeURIComponent(name)}` +
      `&avatarUrl=${encodeURIComponent(avatarUrl)}` +
      `&groupname=${encodeURIComponent(groupName)}` +
      `&bg=${encodeURIComponent(background)}` +
      `&memberCount=${memberCount}`;

    const res = await axios.get(apiUrl, { responseType: "arraybuffer" });

    const imgPath = path.join(__dirname, "..", "cache", `welcome-${userID}.jpg`);
    fs.ensureDirSync(path.dirname(imgPath));
    fs.writeFileSync(imgPath, Buffer.from(res.data));

    await api.sendMessage({
      body: `🎉 Welcome ${name} to ${groupName}!`,
      attachment: fs.createReadStream(imgPath)
    }, event.threadID);

    fs.unlinkSync(imgPath);

  } catch (error) {
    console.error("❌ Error in welcomenoti:", error.message || error);
    api.sendMessage("⚠️ A user joined, but the welcome image failed to load.", event.threadID);
  }
};
