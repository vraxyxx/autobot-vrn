const axios = require('axios');

const API_KEY = 'f810244328efffe65edb02e899789cdc1b5303156dd950a644a6f2637ce564f0';
const BASE_URL = 'https://haji-mix.up.railway.app/api/fbcreate';

module.exports.config = {
  name: "fbcreate",
  version: "1.0.0",
  role: 2,
  hasPrefix: true,
  aliases: ["fbc", "createfb"],
  usage: "fbcreate [email]",
  description: "Create Facebook account using external API (Haji-Mix)",
  credits: "Vern",
  cooldown: 10
};

module.exports.run = async function ({ api, event, args }) {
  const email = args[0];
  const amount = 1;

  if (!email || !email.includes("@")) {
    return api.sendMessage("❗ Please provide a valid email.\n\nExample:\nfbcreate yourvern2@gmail.com", event.threadID, event.messageID);
  }

  api.sendMessage(`📲 Creating Facebook account using: ${email}\n⏳ Please wait...`, event.threadID, event.messageID);

  try {
    const res = await axios.get(BASE_URL, {
      params: {
        email: email,
        amount: amount,
        api_key: API_KEY
      }
    });

    const data = res.data;
    if (!data || !data.result || !data.result[0]) {
      return api.sendMessage("⚠️ Failed to create account or response invalid.", event.threadID, event.messageID);
    }

    const acc = data.result[0];
    const msg = 
`✅ Facebook Account Created

📧 Email: ${acc.email}
🔐 Pass: ${acc.password}
🔗 Token: ${acc.token?.substring(0, 30)}...
📱 UID: ${acc.uid}

⚠️ Note: Save your credentials!`;

    api.sendMessage(msg, event.threadID, event.messageID);

  } catch (err) {
    console.error("❌ FBCreate Error:", err.message);
    return api.sendMessage(`❌ Failed to create account:\n${err.response?.data?.message || err.message}`, event.threadID, event.messageID);
  }
};
