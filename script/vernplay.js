module.exports.config = {
  name: "vernplay",
  version: "1.1.0",
  credits: "vern",
  description: "Number guessing game with score tracking and multi-round play.",
  commandCategory: "Games",
  usages: "[guess number]",
  cooldowns: 5
};

// Structure to store game data per thread
// threadID -> { answer: number, scores: Map<userID, number> }
const games = new Map();

module.exports.run = async function({ api, event, args, Users }) {
  try {
    const threadID = event.threadID;
    const senderID = event.senderID;

    // Initialize game if not present
    if (!games.has(threadID)) {
      games.set(threadID, {
        answer: null,
        scores: new Map()
      });
    }

    const game = games.get(threadID);

    if (!args.length) {
      // Start a new round
      if (game.answer !== null) {
        return api.sendMessage("A round is already in progress! Guess the number or wait for it to finish.", threadID);
      }
      const answer = Math.floor(Math.random() * 10) + 1;
      game.answer = answer;
      return api.sendMessage("🎮 New round started! Guess a number between 1 and 10 by typing the command followed by your guess.", threadID);
    }

    // Validate if a round is active
    if (game.answer === null) {
      return api.sendMessage("No active game round. Start a new round by using the command without arguments.", threadID);
    }

    const guess = parseInt(args[0]);
    if (isNaN(guess) || guess < 1 || guess > 10) {
      return api.sendMessage("❌ Please enter a valid number between 1 and 10.", threadID);
    }

    if (guess === game.answer) {
      // Correct guess - update score
      const currentScore = game.scores.get(senderID) || 0;
      game.scores.set(senderID, currentScore + 1);

      // Reset answer for next round
      game.answer = null;

      // Get username of the winner
      const userName = await Users.getNameUser(senderID);

      return api.sendMessage(`🎉 Congrats ${userName}! You guessed it right. Your score: ${game.scores.get(senderID)}\nType the command without arguments to start a new round.`, threadID);
    } else {
      return api.sendMessage("❌ Wrong guess. Try again!", threadID);
    }
  } catch (error) {
    console.error(error);
  }
};
