module.exports.config = {
  name: "inventory",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Shows your inventory grouped by category.",
  usage: "/inventory",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Utility"
};

// Example: Replace this with actual data source (DB, API, or file)
const sampleInventory = {
  "cosmetic": [
    { "name": "Sign Crate", "value": 1 },
    { "name": "Common Gnome Crate", "value": 1 },
    { "name": "Small Stone Pad", "value": 4 },
    { "name": "Viney Beam", "value": 1 },
    { "name": "Shovel Grave", "value": 1 },
    { "name": "Axe Stump", "value": 1 },
    { "name": "Bamboo Wind Chime", "value": 1 },
    { "name": "Wood Pile", "value": 1 },
    { "name": "Bookshelf", "value": 1 }
  ],
  "easter": [],
  "egg": [
    { "name": "Common Egg", "value": 1 },
    { "name": "Bug Egg", "value": 1 },
    { "name": "Common Egg", "value": 1 }
  ],
  "gear": [
    { "name": "Recall Wrench", "value": 1 },
    { "name": "Trowel", "value": 1 },
    { "name": "Basic Sprinkler", "value": 2 },
    { "name": "Favorite Tool", "value": 1 },
    { "name": "Watering Can", "value": 1 },
    { "name": "Harvest Tool", "value": 2 }
  ],
  "honey": [
    { "name": "Flower Seed Pack", "value": 1 },
    { "name": "Lavender", "value": 4 },
    { "name": "Nectarshade", "value": 2 },
    { "name": "Honey Comb", "value": 1 },
    { "name": "Bee Chair", "value": 1 }
  ],
  "night": [
    { "name": "Twilight Crate", "value": 1 },
    { "name": "Star Caller", "value": 1 }
  ],
  "seed": [
    { "name": "Carrot", "value": 13 },
    { "name": "Blueberry", "value": 1 },
    { "name": "Tomato", "value": 2 },
    { "name": "Strawberry", "value": 4 }
  ]
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  // Replace with actual inventory fetching logic
  const inventory = sampleInventory;

  let msg = "════『 𝗜𝗡𝗩𝗘𝗡𝗧𝗢𝗥𝗬 』════\n\n";
  for (const [category, items] of Object.entries(inventory)) {
    if (items.length === 0) continue;
    msg += `• ${category.charAt(0).toUpperCase() + category.slice(1)}:\n`;
    for (const item of items) {
      msg += `   - ${item.name} x${item.value}\n`;
    }
    msg += "\n";
  }

  api.sendMessage(msg.trim(), threadID, messageID);
};