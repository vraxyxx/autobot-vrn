// 📌 Converted command: brat.js

const axios = require("axios");

module.exports.config = { name: "brat", version: "1.0.0", role: 0, credits: "Jonell01", description: "Generate brat-style caption using input text.", usage: "/brat <text> | <type>", prefix: true, cooldowns: 3, commandCategory: "Text" };

module.exports.run = async function ({ api, event, args }) { const { threadID, messageID } = event; const input = args.join(" ").split("|").map(i => i.trim()); const text = input[0]; const type = input[1] || "direct";

if (!text) { return api.sendMessage( 📌 Usage: /brat <text> | <type>\n💡 Example: /brat you again? | savage, threadID, messageID ); }

const apiUrl = https://jonell01-ccprojectsapihshs.hf.space/api/brat?text=${encodeURIComponent(text)}&type=${encodeURIComponent(type)};

try { const { data } = await axios.get(apiUrl);

if (data.error) {
  return api.sendMessage(`❌ API Error: ${data.error}`, threadID, messageID);
}

return api.sendMessage(`💬 Brat says: ${data.result || "No response"}`, threadID, messageID);

} catch (err) { console.error("Brat Error:", err); return api.sendMessage("❌ Failed to generate brat caption.", threadID, messageID); } };

// 📌 Additional converted commands will follow the same structure...

