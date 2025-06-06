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

module.exports.handleReply = async ({ api, event, handleReply, Users }) => {
  const { threadID, messageID, senderID, body } = event;
  const timeZ = moment.tz("Asia/Kolkata").format("HH:mm:ss | DD/MM/YYYY");

  if (handleReply.content.id !== senderID) return;

  const input = body.trim();
  const content = handleReply.content;

  const sendStep = (text, step, updatedContent) =>
    api.sendMessage(text, threadID, (err, info) => {
      if (err) return;
      global.client.handleReply.splice(global.client.handleReply.indexOf(handleReply), 1);
      api.unsendMessage(handleReply.messageID);

      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        step: step,
        content: updatedContent
      });
    }, messageID);

  const sendFinal = (msg) => {
    global.client.handleReply.splice(global.client.handleReply.indexOf(handleReply), 1);
    api.unsendMessage(handleReply.messageID);
    return api.sendMessage(msg, threadID, messageID);
  };

  try {
    switch (handleReply.step) {
      case 1:
        content.ask = input;
        return sendStep("[ 𝐒𝐈𝐌 ] - Great! Now reply with Sim's answer to this question.", 2, content);

      case 2:
        content.ans = input;

        const res = await axios.get(encodeURI(
          `https://sim-api-by-priyansh.glitch.me/sim?type=teach&ask=${content.ask}&ans=${content.ans}&apikey=PriyanshVip`
        ));

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
