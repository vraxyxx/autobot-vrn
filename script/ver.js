module.exports.cofig = {
name: "ver",
version: "1.0.0",
credits: "vern",
description: "commands made by vern.",
commanCategory: "General",
usages: "[Message option]",
cooldown: 1
},

module.exports.run = async function({ api, event, args }) {
  try {
    const msg = args.length ? args.join(" ") : "HAHHAHA bisaya tanginamo amoy putok bisaya ano na hahahahah tanggalin ko panga mo e gago ka ulol pakyu";
    return api.sendMessage(msg, event.threadID);
  } catch (err) {
    console.error(err);
  }
};