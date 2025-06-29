const axios = require('axios');

module.exports.config = {
  name: "krisanto",
  version: "1.0.0",
  credits: "Vern",
  description: "Sends a random Krisanto image.",
  hasPrefix: false,
  cooldown: 5,
  aliases: ["kirido"],
};

module.exports.run = async function ({ api, event }) {
  const imageUrls = [
    "https://i.ibb.co/b5qTxwbZ/510073572-723450536960748-3080006706140513861-n-jpg-nc-cat-110-ccb-1-7-nc-sid-9f807c-nc-eui2-Ae-Gp-K.jpg",
    "https://i.ibb.co/W4LwFw5z/513695161-576324795304916-6915555689911035047-n-jpg-nc-cat-105-ccb-1-7-nc-sid-9f807c-nc-eui2-Ae-Huu5.jpg",
    "https://i.ibb.co/nMw1XX0p/510128183-1249179386999329-6375160196925798493-n-jpg-nc-cat-102-ccb-1-7-nc-sid-9f807c-nc-eui2-Ae-FVQ.jpg",
    "https://i.ibb.co/ksGsVFGv/509438833-1435874267595855-6356685495015616581-n-jpg-nc-cat-101-ccb-1-7-nc-sid-9f807c-nc-eui2-Ae-Gv.jpg",
    "https://i.ibb.co/N6whcx10/513272540-2084008238676722-2154941192332127867-n-jpg-nc-cat-102-ccb-1-7-nc-sid-9f807c-nc-eui2-Ae-Gr.jpg"
  ];

  const randomImage = imageUrls[Math.floor(Math.random() * imageUrls.length)];

  try {
    api.sendMessage("🌀 Fetching random Krisanto image...", event.threadID, async () => {
      try {
        const imgStream = await axios.get(randomImage, { responseType: 'stream' });

        return api.sendMessage({
          body: "✨ Here's your Krisanto image!",
          attachment: imgStream.data
        }, event.threadID, event.messageID);
      } catch (err) {
        console.error("Krisanto Command Error:", err.message);
        return api.sendMessage("❎ Error: Unable to fetch image.", event.threadID, event.messageID);
      }
    });
  } catch (err) {
    return api.sendMessage("❎ Error: " + err.message, event.threadID, event.messageID);
  }
};