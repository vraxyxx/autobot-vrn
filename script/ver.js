module.exports.config = {
name: "ver",
version: "1.0.0",
credits: "vern",
description: "A simple command that sends a greeting message.",
commanCategory: "General",
usages: "[optional message]",
cooldown: 5
},

module.exports.run = async function({ api, event, args }) {
  try {
    const msg = args.length ? args.join(" ") : "HAHHAHA bisaya tanginamo amoy putok bisaya ano na hahahahah tanggalin ko panga mo e gago ka ulol pakyu";
    return api.sendMessage(msg, event.threadID);
  } catch (err) {
    console.error(err);
  }
};