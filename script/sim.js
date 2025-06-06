const axios = require('axios');

module.exports.config = {
  name: "sim",
  version: "1.0.0",
  permission: 0,
  credits: "converted by vrax",
  prefix: false,
  premium: false,
  description: "Talk with SimSimi AI",
  category: "without prefix",
  usages: "[text]",
  cooldowns: 3,
  dependencies: {
    "axios": ""
  }
};

module.exports.languages = {
  "english": {
    "noInput": "Please provide a message to send to Sim.\nExample: sim Hello!",
    "noResponse": "Error: No response from Sim API.",
    "apiError": "Error: Failed to connect to Sim API."
  },
  "bangla": {
    "noInput": "অনুগ্রহ করে Sim-এ পাঠানোর জন্য একটি বার্তা লিখুন।\nযেমন: sim হ্যালো!",
    "noResponse": "ত্রুটি: Sim API থেকে কোনো উত্তর পাওয়া যায়নি।",
    "apiError": "ত্রুটি: Sim API এর সাথে সংযোগ ব্যর্থ হয়েছে।"
  }
};

module.exports.run = async ({ api, event, args, getText }) => {
  const { threadID, messageID, senderID } = event;
  const query = args.join(" ");

  if (!query) {
    return api.sendMessage(getText("noInput"), threadID, messageID);
  }

  try {
    const apiKey = "2a5a2264d2ee4f0b847cb8bd809ed34bc3309be7";
    const apiUrl = `https://simsimi.ooguy.com/sim?query=${encodeURIComponent(query)}&apikey=${apiKey}`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.respond) {
      return api.sendMessage(getText("noResponse"), threadID, messageID);
    }

    return api.sendMessage(data.respond, threadID, messageID);

  } catch (error) {
    console.error("sim command error:", error.message);
    return api.sendMessage(getText("apiError"), threadID, messageID);
  }
};