module.exports.config = {
  name: "rulesnoti",
  eventType: ["log:subscribe"],
  version: "1.0.1",
  credits: "Vern + ChatGPT Fixes",
  description: "Notify group of rules when new members are added",
};

module.exports.run = async function ({ api, event }) {
  const { threadID } = event;

  // Check if bot was added itself
  if (event.logMessageData.addedParticipants.some(i => i.userFbId === api.getCurrentUserID())) {
    return api.sendMessage("🤖 Hello! I've been added to this group. Type 'help' to see my features.", threadID);
  }

  const rules = `🌟 𝗚𝗿𝗼𝘂𝗽 𝗥𝘂𝗹𝗲𝘀 - Vern\n
1️⃣ 𝗡𝗼 𝗦𝗽𝗮𝗺𝗺𝗶𝗻𝗴\n2️⃣ 𝗕𝗲 𝗥𝗲𝘀𝗽𝗲𝗰𝘁𝗳𝘂𝗹\n3️⃣ 𝗡𝗼 𝗜𝗹𝗹𝗲𝗴𝗮𝗹 𝗖𝗼𝗻𝘁𝗲𝗻𝘁\n4️⃣ 𝗙𝗼𝗹𝗹𝗼𝘄 𝗚𝘂𝗶𝗱𝗲𝗹𝗶𝗻𝗲𝘀\n5️⃣ 𝗕𝗲 𝗔𝗰𝘁𝗶𝘃𝗲\n6️⃣ 𝗥𝗲𝘀𝗽𝗲𝗰𝘁 𝗔𝗱𝗺𝗶𝗻𝘀\n7️⃣ 𝗡𝗼 𝗦𝗲𝗲𝗻𝗲𝗿\n8️⃣ 𝗡𝗼 𝗥𝗼𝗹𝗲𝗽𝗹𝗮𝘆\n9️⃣ 𝗦𝘂𝗽𝗽𝗼𝗿𝘁 𝗘𝗮𝗰𝗵 𝗢𝘁𝗵𝗲𝗿\n
🚫 Violating these may result in warnings or removal without notice.\n✅ Let's keep this group friendly!`;

  try {
    const newUsers = event.logMessageData.addedParticipants
      .filter(p => p.userFbId !== api.getCurrentUserID())
      .map(p => p.fullName || "member");

    if (newUsers.length > 0) {
      await api.sendMessage(`👋 Welcome ${newUsers.join(", ")}!\n\n${rules}`, threadID);
    }
  } catch (err) {
    console.error("Rules event error:", err.message || err);
  }
};
