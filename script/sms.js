// commands/sms.js
const sendSMS = require("../script/sms");

module.exports = {
  config: {
    name: "sms",
    aliases: ["text", "sendsms"],
    version: "1.0",
    author: "Vern",
    countDown: 5,
    role: 0,
    shortDescription: "Send SMS to a number",
    longDescription: "Send a message to a PH mobile number using an API",
    category: "utility",
    guide: {
      en: "{pn} <number> | <message>\nExample: {pn} 09693457389 | Hello World"
    }
  },

  onStart: async function ({ message, args }) {
    const input = args.join(" ").split("|").map(str => str.trim());

    if (input.length < 2) {
      return message.reply("⚠️ Usage: sms <number> | <message>\nExample: sms 09693457389 | Hello");
    }

    const [number, smsMessage] = input;

    try {
      const res = await sendSMS(number, smsMessage);

      if (res.status === 200) {
        return message.reply(`✅ SMS Sent Result:
• Message: ${res.data.message}
• Subject: ${res.data.subject}
• Delay: ${res.data.sendDelay}s
• Success Count: ${res.data.success}`);
      } else {
        return message.reply("❌ Failed to send SMS. Please try again.");
      }
    } catch (err) {
      return message.reply("❌ Error: " + err.message);
    }
  }
};
