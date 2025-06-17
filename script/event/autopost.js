const cron = require('node-cron');
const axios = require('axios');
const { OnChat, font } = require('chatbox-utility');

module.exports.config = {
  name: "autopost",
  type: "event",
  eventType: ["message", "message_reply"],
  version: "1.0.0",
  credits: "vern", // DO NOT CHANGE
};

let isCronStarted = false;

const greetings = {
  morning: [
    "Good morning! Have a great day!",
    "Rise and shine! Good morning!",
    "Morning! Hope you have an amazing day!",
    "Gising na kayo umaga na!",
  ],
  afternoon: [
    "Good afternoon! Keep up the great work!",
    "Afternoon! Hope you're having a wonderful day!",
    "Hello! Wishing you a pleasant afternoon!",
    "Time to eat something!",
    "Maayong udto mga ril nigas pangaon namo!",
  ],
  evening: [
    "Good evening! Relax and enjoy your evening!",
    "Evening! Hope you had a productive day!",
    "Hello! Have a peaceful and enjoyable evening!",
  ],
  night: [
    "Good night! Rest well!",
    "Night! Sweet dreams!",
    "Hello! Wishing you a restful night!",
    "Tulog na kayo!",
  ]
};

function greetRandom(timeOfDay) {
  const messages = greetings[timeOfDay];
  return messages[Math.floor(Math.random() * messages.length)];
}

async function motivation(chat) {
  try {
    console.log('Posting motivational quote...');
    const res = await axios.get("https://raw.githubusercontent.com/JamesFT/Database-Quotes-JSON/master/quotes.json");
    const quotes = res.data;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    const quoteText = `"${randomQuote.quoteText}"\n\n— ${randomQuote.quoteAuthor || "Vern"}`;
    await chat.post(font.thin(quoteText));
  } catch (err) {
    console.error('Error fetching/posting motivational quote:', err);
  }
}

async function greetThreads(chat, timeOfDay) {
  try {
    const message = greetRandom(timeOfDay);
    const threads = await chat.threadList(10, null, ['INBOX']);

    for (const thread of threads) {
      if (thread.isGroup) {
        await chat.reply(font.thin(message), thread.threadID);
      }
    }
  } catch (err) {
    console.error(`Error sending ${timeOfDay} greeting:`, err);
  }
}

function scheduleJobs(chat) {
  if (isCronStarted) return;
  isCronStarted = true;

  const scheduleCronJobs = (hours, timeOfDay) => {
    hours.forEach(hour => {
      cron.schedule(`0 ${hour} * * *`, () => {
        greetThreads(chat, timeOfDay);
      }, { timezone: "Asia/Dhaka" });
    });
  };

  scheduleCronJobs([5, 6, 7], "morning");
  scheduleCronJobs([12, 13], "afternoon");
  scheduleCronJobs([18, 19, 20, 21], "evening");
  scheduleCronJobs([22, 23], "night");

  cron.schedule("*/50 * * * *", () => motivation(chat), { timezone: "Asia/Dhaka" });
}

module.exports.run = async function ({ api, event }) {
  const chat = new OnChat(api, event);
  scheduleJobs(chat);
};
