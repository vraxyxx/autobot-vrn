const cron = require('node-cron');
const axios = require('axios');

module.exports.config = {
  name: "autopost",
  version: "1.0.0",
  credits: "aminul & fixed by Vern",
  description: "Auto greet and post motivation at scheduled times",
  dependencies: {
    "node-cron": "",
    "axios": ""
  }
};

let isCronStarted = false;

// Greeting messages
const greetings = {
  morning: [
    "☀️ Good morning! Have a great day!",
    "🌅 Rise and shine!",
    "Gising na kayo, umaga na!",
  ],
  afternoon: [
    "🍛 Maayong udto mga ril, nigas pangaon namo!",
    "🌞 Good afternoon! Stay productive!",
  ],
  evening: [
    "🌇 Good evening! Take it easy.",
    "🌆 Hello! Hope your day went well.",
  ],
  night: [
    "🌙 Good night! Rest well.",
    "😴 Tulog na kayo!",
  ]
};

// Random greeting selector
function getGreeting(timeOfDay) {
  const list = greetings[timeOfDay] || [];
  return list[Math.floor(Math.random() * list.length)];
}

// Send greeting to group threads
async function greetGroups(api, timeOfDay) {
  const threads = await api.getThreadList(10, null, ["INBOX"]);
  const message = getGreeting(timeOfDay);

  for (const thread of threads) {
    if (thread.isGroup) {
      await api.sendMessage(message, thread.threadID);
    }
  }
}

// Fetch and post random motivational quote
async function postMotivation(api) {
  try {
    const res = await axios.get("https://raw.githubusercontent.com/JamesFT/Database-Quotes-JSON/master/quotes.json");
    const quotes = res.data;
    const random = quotes[Math.floor(Math.random() * quotes.length)];
    const text = `🧠 "${random.quoteText}"\n— ${random.quoteAuthor || "Vern"}`;

    const threads = await api.getThreadList(10, null, ["INBOX"]);
    for (const thread of threads) {
      if (thread.isGroup) {
        await api.sendMessage(text, thread.threadID);
      }
    }
  } catch (err) {
    console.error("[❌] Failed to fetch motivation quote:", err.message);
  }
}

// Schedule all cron jobs
function schedule(api) {
  if (isCronStarted) return;
  isCronStarted = true;

  const scheduleGreeting = (hours, timeOfDay) => {
    hours.forEach(hour => {
      cron.schedule(`0 ${hour} * * *`, () => greetGroups(api, timeOfDay), {
        timezone: "Asia/Manila"
      });
    });
  };

  scheduleGreeting([6, 7, 8], "morning");
  scheduleGreeting([12, 13], "afternoon");
  scheduleGreeting([17, 18, 19], "evening");
  scheduleGreeting([21, 22], "night");

  // Motivation every hour at :50
  cron.schedule("50 * * * *", () => postMotivation(api), {
    timezone: "Asia/Manila"
  });

  console.log("[✅] AutoPost cron jobs scheduled.");
}

// Run once to initialize
module.exports.run = async function ({ api, event }) {
  schedule(api);
};
