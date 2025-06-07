const axios = require("axios");
const moment = require("moment-timezone");

module.exports.config = {
  name: "teach",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Priyansh Rajput",
  description: "Teach Sim how to respond to specific messages.",
  commandCategory: "Sim",
  usages: "",
  cooldowns: 2,
  dependencies: { axios: "" }
};

module.exports.run = ({ api, event }) => {
  const { threadID, messageID, senderID } = event;

  return api.sendMessage(
    "[ 𝐒𝐈𝐌 ] - Reply to this message with the question you want to teach Sim.",
    threadID,
    (err, info) => {
      if (err) return;
      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        step: 1,
        content: {
          id: senderID,
          ask: "",
          ans: ""
        }
      });
    },
    messageID
  );
};

module.exports.handleReply = async ({ api, event, handleReply }) => {
  const { threadID, messageID, senderID, body } = event;
  const timeZ = moment.tz("Asia/Kolkata").format("HH:mm:ss | DD/MM/YYYY");

  // Only the original user can continue the teach flow
  if (handleReply.content.id !== senderID) return;

  const input = body.trim();
  const content = handleReply.content;

  // Helper to move to the next step
  const sendStep = (text, step, updatedContent) =>
    api.sendMessage(text, threadID, async (err, info) => {
      if (err) return;
      // Remove the old handleReply
      const idx = global.client.handleReply.indexOf(handleReply);
      if (idx > -1) global.client.handleReply.splice(idx, 1);
      // Optionally unsend the previous bot message for tidiness
      try { await api.unsendMessage(handleReply.messageID); } catch (e) {}

      // Register the next step
      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        step: step,
        content: updatedContent
      });
    }, messageID);

  // Helper for final response (cleans up handleReply)
  const sendFinal = async (msg) => {
    const idx = global.client.handleReply.indexOf(handleReply);
    if (idx > -1) global.client.handleReply.splice(idx, 1);
    try { await api.unsendMessage(handleReply.messageID); } catch (e) {}
    return api.sendMessage(msg, threadID, messageID);
  };

  try {
    switch (handleReply.step) {
      case 1:
        content.ask = input;
        return sendStep("[ 𝐒𝐈𝐌 ] - Great! Now reply with Sim's answer to this question.", 2, content);

      case 2:
        content.ans = input;

        // Call the teaching API
        let res;
        try {
          res = await axios.get(encodeURI(
            `https://sim-api-by-priyansh.glitch.me/sim?type=teach&ask=${content.ask}&ans=${content.ans}&apikey=PriyanshVip`
          ));
        } catch (err) {
          return sendFinal("❌ API request failed. Please try again later.");
        }

        if (res.data?.error) {
          return sendFinal(`❌ Error: ${res.data.error}`);
        }

        return sendFinal(
          `[ 𝐒𝐈𝐌 ] - Successfully taught Sim!\n\n🗨️ ${content.ask} → 💬 ${content.ans}\n⏰ Taught at: ${timeZ}`
        );

      default:
        return;
    }
  } catch (err) {
    console.error("Teach error:", err);
    return api.sendMessage(`❌ An error occurred.\n${err.message}`, threadID, messageID);
  }
};