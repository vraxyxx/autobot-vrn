const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "goodbyenoti",
  eventType: ["log:unsubscribe"], // Trigger on user leave/kick
  version: "1.0.0",
  credits: "vern",
  description: "Send goodbye image using Ace API when someone leaves"
};

module.exports.run = async function({ event, api }) {
  const threadID = event.threadID;
  const leftUser = event.logMessageData?.leftParticipantFbId;

  try {
    // Fetch user name
    const userInfo = await api.getUserInfo(leftUser);
    const userName = userInfo[leftUser]?.name || "User";

    // Get group info to show member count
    const threadInfo = await api.getThreadInfo(threadID);
    const memberCount = threadInfo.participantIDs.length;

    // Avatar of the user
    const avatarUrl = `https://graph.facebook.com/${leftUser}/picture?width=512&height=512`;

    // Optional background image (replace or rotate if needed)
    const backgroundUrl = "https://i.ibb.co/4YBNyvP/images-76.jpg";

    // Call Ace goodbye API
    const apiUrl = `https://ace-rest-api.onrender.com/api/goodbye?pp=${encodeURIComponent(avatarUrl)}&nama=${encodeURIComponent(userName)}&bg=${encodeURIComponent(backgroundUrl)}&member=${memberCount}`;

    const res = await axios.get(apiUrl, { responseType: "arraybuffer" });

    // Save to cache
    const imgPath = path.join(__dirname, "cache", `goodbye-${leftUser}.png`);
    fs.ensureDirSync(path.dirname(imgPath));
    fs.writeFileSync(imgPath, Buffer.from(res.data, "binary"));

    // Send the goodbye image
    await api.sendMessage({
      body: `👋 ${userName} has left the group.`,
      attachment: fs.createReadStream(imgPath)
    }, threadID);

    // Clean up
    fs.unlinkSync(imgPath);

  } catch (err) {
    console.error("❌ Goodbye event error:", err.message || err);
  }
};
