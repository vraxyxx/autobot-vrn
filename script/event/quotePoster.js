const axios = require("axios");
const cron = require("node-cron");

module.exports.config = {
  name: "quotePoster",
  version: "1.0.0",
  type: "event",
  eventType: [],
  credits: "Vern",
  description: "Automatically post motivational quotes every hour",
  dependencies: {
    axios: "",
    "node-cron": ""
  }
};

let isRunning = false;

module.exports.run = async function ({ api }) {
  if (isRunning) return;
  isRunning = true;

  // Schedule to run every hour at minute 0 (e.g., 1:00, 2:00, 3:00...)
  cron.schedule("0 * * * *", async () => {
    try {
      const res = await axios.get("https://raw.githubusercontent.com/JamesFT/Database-Quotes-JSON/master/quotes.json");
      const quotes = res.data;
      const random = quotes[Math.floor(Math.random() * quotes.length)];

      const quote = random.quoteText;
      const author = random.quoteAuthor || "Unknown";

      const message = `🧠 "${quote}"\n— ${author}`;

      // Get latest 10 group threads from inbox
      const threads = await api.getThreadList(10, null, ["INBOX"]);

      for (const thread of threads) {
        if (thread.isGroup) {
          await api.sendMessage(message, thread.threadID);
        }
      }

      console.log("[✅] Motivational quote sent to groups.");
    } catch (err) {
      console.error("❌ Failed to fetch/send quote:", err.message || err);
    }
  }, {
    timezone: "Asia/Manila"
  });

  console.log("[🕒] Scheduled hourly quote posting.");
};
