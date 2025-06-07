const axios = require('axios');

module.exports.config = {
  name: "sim1",
  version: "4.3.7",
  role: 0,
  description: "Chat with Simsimi AI.",
  prefix: false,
  premium: false,
  credits: "vern",
  cooldowns: 5,
  category: "chat"
};

// Keeps track of which threads have Simsimi enabled
const simEnabledThreads = new Map();

/**
 * Fetch Simsimi reply from API
 * @param {string} text - The user's message
 * @returns {object} - { error: boolean, data: object|null }
 */
async function fetchSimsimiReply(text) {
  try {
    const encodedText = encodeURIComponent(text);
    // Always return some response for testing
    if (text.trim().length === 0) {
      return { error: false, data: { success: "🤖 Simsimi needs something to reply to!" } };
    }
    // Simulated bot response, replace with actual API call if needed
    // const res = await axios.get(`https://api.simsimi.net/v2/?text=${encodedText}&lc=en`);
    // return { error: false, data: res.data };
    return { error: false, data: { success: "Hello! I'm Simsimi. How can I help you today?" } };
  } catch (err) {
    console.error("Simsimi API error:", err.message);
    return { error: true, data: null };
  }
}

/**
 * Auto-reply event handler
 * Replies automatically in threads where Simsimi is enabled
 */
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, messageID, senderID, body } = event;

  // Only respond if Simsimi is enabled in this thread
  if (!simEnabledThreads.has(threadID)) return;
  // Ignore if no message or if message is from the bot itself
  if (!body || senderID === api.getCurrentUserID()) return;

  const reply = await fetchSimsimiReply(body);
  if (reply.error) return;

  // Simsimi API returns 'success' or 'error' fields for the reply
  const message = reply.data.success || reply.data.error || "🤖 Simsimi didn't understand that.";
  return api.sendMessage(message, threadID, messageID);
};

/**
 * Command to manually control Simsimi:
 * Usage:
 *  /sim1 on   - enable auto replies
 *  /sim1 off  - disable auto replies
 *  /sim1 [text] - get a one-time reply from Simsimi
 */
module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const send = (msg) => api.sendMessage(msg, threadID, messageID);

  if (!args[0]) {
    return send("💬 Send a message or use `on` / `off` to control Simsimi.");
  }

  const command = args[0].toLowerCase();

  if (command === "on") {
    if (simEnabledThreads.has(threadID))
      return send("⚠️ Simsimi is already enabled.");
    simEnabledThreads.set(threadID, true);
    return send("✅ Simsimi has been enabled.");
  }

  if (command === "off") {
    if (!simEnabledThreads.has(threadID))
      return send("⚠️ Simsimi is already disabled.");
    simEnabledThreads.delete(threadID);
    return send("❎ Simsimi has been disabled.");
  }

  // Default: manual one-time reply
  const query = args.join(" ");
  const reply = await fetchSimsimiReply(query);
  if (reply.error) return send("🚫 Error communicating with Simsimi.");

  const message = reply.data.success || reply.data.error || "🤖 Simsimi didn't understand that.";
  return send(message);
};