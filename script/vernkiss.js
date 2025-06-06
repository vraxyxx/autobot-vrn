module.exports.config = {
  name: "vernkiss",
  version: "1.2.0",
  credits: "vern",
  description: "Send lots of kissing emojis with a random kissing GIF.",
  commandCategory: "Fun",
  usages: "[optional mention]",
  cooldowns: 5
};

const gifs = [
  "https://media.giphy.com/media/G3va31oEEnIkM/giphy.gif",
  "https://media.giphy.com/media/nyGFcsP0kAobm/giphy.gif",
  "https://media.giphy.com/media/bGm9FuBCGg4SY/giphy.gif",
  "https://media.giphy.com/media/FqBTvSNjNzeZG/giphy.gif",
  "https://media.giphy.com/media/zkppEMFvRX5FC/giphy.gif",
  "https://media.giphy.com/media/KH1CTZtw1iP3W/giphy.gif",
  "https://media.giphy.com/media/3o6gbbuLW76jkt8vIc/giphy.gif",
  "https://media.giphy.com/media/11k3oaUjSlFR4I/giphy.gif",
  "https://media.giphy.com/media/l3V0j3ytFyGHqiV7W/giphy.gif",
  "https://media.giphy.com/media/3oEjHP8ELRNNlnlLGM/giphy.gif"
];

module.exports.run = async function({ api, event, args, Users }) {
  try {
    let mentionText = "";
    if (args.length > 0) {
      const mentionID = event.mentions ? Object.keys(event.mentions)[0] : null;
      if (mentionID) {
        const name = await Users.getNameUser(mentionID);
        mentionText = `${name}, `;
      }
    }

    const kisses = "😘😗😙😚💋💕💖".repeat(3);
    const randomGif = gifs[Math.floor(Math.random() * gifs.length)];

    const message = {
      body: `${mentionText}Sending you lots of kisses! ${kisses}`,
      attachment: await global.utils.getStream(randomGif)
    };

    return api.sendMessage(message, event.threadID);
  } catch (error) {
    console.error(error);
  }
};
