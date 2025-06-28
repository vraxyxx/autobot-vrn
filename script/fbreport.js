const axios = require("axios");

const API_KEY = 'f810244328efffe65edb02e899789cdc1b5303156dd950a644a6f2637ce564f0';
const API_URL = 'https://haji-mix.up.railway.app/api/fbreport';

module.exports.config = {
  name: "fbreport",
  version: "1.3.0",
  role: 2,
  hasPrefix: true,
  aliases: ["reportfb", "fbwarn"],
  usage: "fbreport [facebook_url or pfp_url] [optional_reason]",
  description: "Report a Facebook account using their URL or PFP image link",
  credits: "Vern",
  cooldown: 10
};

async function getFacebookUID(profileUrl) {
  try {
    const html = await axios.get(profileUrl).then(res => res.data);
    const uidMatch = html.match(/"entity_id":"(\d+)"/) || html.match(/profile_id=(\d+)/);
    return uidMatch ? uidMatch[1] : null;
  } catch {
    return null;
  }
}

module.exports.run = async function ({ api, event, args }) {
  const [target, ...reasonParts] = args;
  const reason = reasonParts.join(" ") || "Suspicious activity or impersonation";

  if (!target || !/^https?:\/\/facebook\.com\/.+/i.test(target) && !/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)/i.test(target)) {
    return api.sendMessage(
      "❗ Please provide a valid Facebook profile URL or image link.\n\nExample:\nfbreport https://facebook.com/zuck impersonating admin",
      event.threadID, event.messageID
    );
  }

  api.sendMessage(`🕵️ Reporting target...\n🔗 Target: ${target}\n📝 Reason: ${reason}\n⏳ Processing...`, event.threadID, event.messageID);

  try {
    let pfpUrl = target;

    // Convert Facebook URL to PFP
    if (target.includes("facebook.com")) {
      const uid = await getFacebookUID(target);
      if (!uid) return api.sendMessage("❌ Could not extract UID from the Facebook URL.", event.threadID, event.messageID);
      pfpUrl = `https://graph.facebook.com/${uid}/picture?width=512&height=512`;
    }

    const reportRes = await axios.get(API_URL, { params: { api_key: API_KEY } });
    const data = reportRes.data;

    if (!data || !data.status || !data.message) {
      return api.sendMessage("⚠️ Failed to report: Invalid API response.", event.threadID, event.messageID);
    }

    const imageStream = await axios.get(pfpUrl, { responseType: 'stream' });

    const message =
`✅ Facebook Report Submitted

📅 ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}
📋 Reason: ${reason}
📨 Message: ${data.message}
🔐 Target below:`;

    api.sendMessage({
      body: message,
      attachment: imageStream.data
    }, event.threadID, event.messageID);

  } catch (err) {
    console.error("❌ FB Report error:", err.message);
    return api.sendMessage(`❌ Failed to send report:\n${err.response?.data?.message || err.message}`, event.threadID, event.messageID);
  }
};
