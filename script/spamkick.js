const fs = require("fs-extra");

module.exports.config = {
  name: "spamkick",
  version: "1.0.0",
  hasPrefix: true,
  role: 2,
  credits: "Dipto | Modified by Vern",
  description: "Auto kick spammers from the group.",
  usage: "",
  cooldown: 3
};

// Cooldown and spam tracking map
const spamTracker = new Map();

module.exports.handleEvent = async function ({ api, event, Users, Threads }) {
  const { threadID, senderID, body } = event;
  if (!body || event.isGroup === false) return;

  try {
    const threadData = await Threads.getData(threadID) || {};
    const settings = threadData.data || {};
    if (settings.spamKick === false) return;

    const now = Date.now();
    const userKey = `${threadID}-${senderID}`;
    const userHistory = spamTracker.get(userKey) || [];

    // Filter last 10 seconds
    const recent = userHistory.filter(ts => now - ts < 10000);
    recent.push(now);
    spamTracker.set(userKey, recent);

    if (recent.length > 5) {
      // Attempt kick
      const userInfo = await Users.getInfo(senderID);
      const name = userInfo.name || "User";

      try {
        await api.removeUserFromGroup(senderID, threadID);
        api.sendMessage(`⚠️ ${name} has been removed for spamming.`, threadID);
      } catch (err) {
        api.sendMessage(`❌ Failed to kick ${name}. Check bot's permissions.`, threadID);
        console.error("Kick error:", err);
      }

      spamTracker.delete(userKey);
    }
  } catch (err) {
    console.error("SpamKick Error:", err);
  }
};

module.exports.run = async function ({ api, event, Threads }) {
  const { threadID } = event;

  try {
    const threadData = await Threads.getData(threadID);
    const settings = threadData.data || {};

    settings.spamKick = settings.spamKick === false ? true : false;
    await Threads.setData(threadID, { data: settings });

    return api.sendMessage(
      `🛡️ Spam kick is now ${settings.spamKick ? "enabled" : "disabled"}.`,
      threadID
    );
  } catch (err) {
    console.error("Toggle error:", err);
    return api.sendMessage("❌ Failed to toggle spamkick.", threadID);
  }
};
