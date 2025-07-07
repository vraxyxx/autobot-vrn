const axios = require("axios");

module.exports.config = {
  name: 'sms',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['text', 'sendsms'],
  description: "Send a message to a PH mobile number",
  usage: "sms <number> | <message>",
  credits: 'Vern',
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
  const input = args.join(" ").split("|").map(item => item.trim());
  const senderID = event.senderID;
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (input.length < 2) {
    return api.sendMessage("📱 Usage:\nsms <number> | <message>\n\nExample:\nsms 09693457389 | Hello", threadID, messageID);
  }

  const [number, text] = input;

  api.sendMessage('📤 𝗦𝗘𝗡𝗗𝗜𝗡𝗚 𝗦𝗠𝗦, 𝗣𝗟𝗘𝗔𝗦𝗘 𝗪𝗔𝗜𝗧...', threadID, async (err, info) => {
    if (err) return;

    try {
      const { data } = await axios.get("https://urangkapolka.vercel.app/api/sms", {
        params: {
          number,
          message: text
        }
      });

      const sms = data?.data;
      if (!sms) {
        return api.editMessage("❌ Failed to send SMS. No response received.", info.messageID);
      }

      const timePH = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });

      api.getUserInfo(senderID, (err, infoUser) => {
        const userName = infoUser?.[senderID]?.name || "Unknown User";

        const reply = `📲 𝗦𝗠𝗦 𝗦𝗘𝗡𝗧
━━━━━━━━━━━━━━━━━━
📬 Subject : ${sms.subject}
📨 Message : ${sms.message}
⏱ Delay   : ${sms.sendDelay}s
✅ Success : ${sms.success}
━━━━━━━━━━━━━━━━━━
👤 Sent by: ${userName}
🕰 Time   : ${timePH}`;

        api.editMessage(reply, info.messageID);
      });

    } catch (error) {
      console.error("SMS Error:", error);
      const errMsg = "❌ Error: " + (error.response?.data?.message || error.message || "Unknown error occurred.");
      api.editMessage(errMsg, info.messageID);
    }
  });
};
