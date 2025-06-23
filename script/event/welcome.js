const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "welcome",
  eventType: ["log:subscribe"], // Trigger when user joins
  version: "1.0.0",
  credits: "vern",
  description: "Send welcome image using Ace API when someone joins"
};

module.exports.run = async function({ event, api }) {
  const threadID = event.threadID;
  const newUser = event.logMessageData.addedParticipants?.[0];

  if (!newUser) return;

  try {
    const userName = newUser.fullName || "User";
    const userID = newUser.userFbId;

    // Get user avatar
    const avatarUrl = `https://graph.facebook.com/${userID}/picture?width=512&height=512`;

    // Generate welcome image from Ace API
    const welcomeUrl = `https://ace-rest-api.onrender.com/api/welcomeV2?nickname=${encodeURIComponent(userName)}&secondText=${encodeURIComponent("Have a nice day!")}&avatar=${encodeURIComponent(avatarUrl)}`;

    const imageRes = await axios.get(welcomeUrl, { responseType: "arraybuffer" });
    const imagePath = path.join(__dirname, "cache", `welcome-${userID}.png`);
    fs.ensureDirSync(path.dirname(imagePath));
    fs.writeFileSync(imagePath, Buffer.from(imageRes.data, "binary"));

    // Send message with attachment
    const msg = {
      body: `🎉 Welcome ${userName} to the group!\nHave a great time here.`,
      attachment: fs.createReadStream(imagePath)
    };

    await api.sendMessage(msg, threadID);

    // Cleanup
    fs.unlinkSync(imagePath);

  } catch (error) {
    console.error("❌ Welcome event error:", error.message || error);
  }
};
