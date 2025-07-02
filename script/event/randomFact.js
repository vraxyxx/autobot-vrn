const axios = require("axios");
const cron = require("node-cron");

module.exports.config = {
  name: "randomFact",
  version: "1.0.0",
  description: "Automatically posts a random dog fact every 20 minutes to the timeline",
  credits: "Vern",
  eventType: ["event"],
};

module.exports.run = async function ({ api }) {
  // Schedule the task to run every 20 minutes
  cron.schedule("*/20 * * * *", async () => {
    try {
      const { data } = await axios.get("https://jerome-web.gleeze.com/service/api/random-dog-fact");
      const fact = data?.fact || "🐶 Here's a fun dog fact for you!";

      // Post to timeline (use api.sendMessage with null threadID for timeline if supported)
      await api.sendMessage(`🐾 Random Dog Fact:
${fact}`, null);
    } catch (err) {
      console.error("[randomFact] Failed to fetch or post dog fact:", err.message);
    }
  });
};
