const axios = require("axios");

module.exports.config = {
  name: "appstate",
  version: "1.0",
  role: 0,
  author: "Vern",
  credits: "Favinna",
  aliases: ["fbappstate", "genappstate"],
  countDown: 5,
  longDescription: "Generate Facebook Appstate using email and password.",
  category: "tools",
  usages: "<email>|<password>",
  cooldown: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;

  if (args.length === 0 || !args.join(" ").includes("|")) {
    return api.sendMessage(
      "❌ Please provide your Facebook email and password in this format:\n\n/appstate email|password",
      threadID,
      messageID
    );
  }

  const [email, password] = args.join(" ").split("|").map(part => part.trim());

  if (!email || !password) {
    return api.sendMessage("⚠️ Missing email or password.", threadID, messageID);
  }

  try {
    api.sendMessage("🔐 Generating appstate, please wait...", threadID, messageID);

    const url = `https://jonell01-ccprojectsapihshs.hf.space/api/appstate?e=${encodeURIComponent(email)}&p=${encodeURIComponent(password)}`;
    const res = await axios.get(url);
    const data = res.data;

    if (data.error) {
      return api.sendMessage(`❌ Error: ${data.error}`, threadID, messageID);
    }

    const appstateJson = JSON.stringify(data, null, 2);

    return api.sendMessage({
      body: "✅ Appstate generated successfully!",
      attachment: await global.utils.createStreamFromString(appstateJson, "appstate.json")
    }, threadID, messageID);

  } catch (err) {
    console.error("appstate error:", err.message);
    return api.sendMessage("❌ An error occurred while generating the appstate. Please try again.", threadID, messageID);
  }
};