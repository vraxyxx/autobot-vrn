module.exports = {
  name: "autoReact",
  description: "Automatically reacts to certain keywords in messages.",
  author: "vern",
  handleEvent: true,

  async handleEvent({ api, event }) {
    const { messageID, body, threadID, senderID, isGroup } = event;

    if (!body || typeof body !== "string") return;

    // Define keywords and corresponding reactions
    const reactions = {
      "hello": "👋",
      "hi": "👋",
      "lol": "😂",
      "haha": "🤣",
      "love": "❤️",
      "wow": "😲",
      "sad": "😢",
      "angry": "😡",
      "bot": "🤖",
      "good morning": "🌅",
      "good night": "🌙",
      "thanks": "🙏",
      "prefix": "👾",
      "vern": "🥰",
      "pogi": "🫡"
    };

    const lowerBody = body.toLowerCase();

    for (const keyword in reactions) {
      if (lowerBody.includes(keyword)) {
        try {
          await api.setMessageReaction(reactions[keyword], messageID, () => {}, true);
        } catch (err) {
          console.error(`Failed to set reaction: ${err.message}`);
        }
        break;
      }
    }
  }
};
